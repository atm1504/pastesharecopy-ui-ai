import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { submitGameScore } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGamePoints } from "@/contexts/GamePointsContext";

// Add pulsing animation for the tutorial
const pulseKeyframes = `
@keyframes pulse {
  0% { transform: translate(-50%, 0) scale(1); }
  50% { transform: translate(-50%, 0) scale(1.05); }
  100% { transform: translate(-50%, 0) scale(1); }
}
`;

// Add style tag to head
const addStyleToHead = () => {
  const styleElement = document.createElement("style");
  styleElement.textContent = pulseKeyframes;
  document.head.appendChild(styleElement);
  return () => {
    document.head.removeChild(styleElement);
  };
};

interface Blob {
  x: number;
  y: number;
  radius: number;
  color: string;
  velX: number;
  velY: number;
  growth: number;
  opacity: number;
  hue: number;
  seed: number;
  isCollectible?: boolean;
  points?: number;
  pulseRate?: number;
  collectibleType?: string;
}

interface GameState {
  score: number;
  collectiblesFound: number;
  totalCollectibles: number;
  lastScoreUpdate: number;
  comboMultiplier: number;
  comboTimer: number;
  sessionId: string;
  sessionStartTime: number;
  lastSubmissionScore: number;
  maxComboReached: number;
}

// Improved throttle with proper TypeScript typing
const throttle = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
};

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { toast } = useToast();
  const { refreshProfile } = useAuthContext();
  const { sessionGamePoints, setSessionGamePoints, resetSessionGamePoints } =
    useGamePoints();

  // State for game elements
  const [showScore, setShowScore] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [highScore, setHighScore] = useState(0);

  // Refs to store animation state
  const blobsRef = useRef<Blob[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const mouseMoveTimestampRef = useRef(0);
  const animationFrameRef = useRef(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const noiseOffsetRef = useRef(0);
  const lastAddBlobTimeRef = useRef(0);
  const gameStateRef = useRef<GameState>({
    score: 0,
    collectiblesFound: 0,
    totalCollectibles: 0,
    lastScoreUpdate: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    sessionId: "",
    sessionStartTime: 0,
    lastSubmissionScore: 0,
    maxComboReached: 0,
  });
  const collectibleTimerRef = useRef(0);

  // Add state for the game rules dialog
  const [showGameRules, setShowGameRules] = useState(false);

  // Gamified point requirements with psychological optimization
  const getUnlockRequirements = () => {
    const requirements = [];

    // Psychology-driven progression: Start easy, then exponential difficulty
    // Simplified to only offer enhanced daily limits
    // UPDATED: Much more challenging progression starting at 2000 points
    const progressionMap = [
      { points: 2000, extraLinks: 1 }, // 11 total daily pastes - First milestone
      { points: 5000, extraLinks: 2 }, // 12 total daily pastes - Commitment test
      { points: 12000, extraLinks: 3 }, // 13 total daily pastes - Serious engagement
      { points: 25000, extraLinks: 5 }, // 15 total daily pastes - Dedicated user
      { points: 45000, extraLinks: 7 }, // 17 total daily pastes - Power user
      { points: 75000, extraLinks: 10 }, // 20 total daily pastes - Expert level
      { points: 120000, extraLinks: 15 }, // 25 total daily pastes - Master tier
      { points: 180000, extraLinks: 20 }, // 30 total daily pastes - Elite status
      { points: 260000, extraLinks: 30 }, // 40 total daily pastes - Legend tier
      { points: 400000, extraLinks: 50 }, // 60 total daily pastes - Ultimate mastery
    ];

    progressionMap.forEach((tier, index) => {
      const tierNum = index + 1;
      const totalLinks = 10 + tier.extraLinks; // Base 10 + extra

      let psychologyType;
      let urgency = "";

      if (tierNum <= 2) {
        // Quick wins to hook users
        psychologyType = "🚀 Quick Win";
        urgency = "Easy to achieve!";
      } else if (tierNum <= 4) {
        // Building momentum
        psychologyType = "🎯 Momentum Builder";
        urgency = "Keep the streak going!";
      } else if (tierNum <= 6) {
        // Significant progress
        psychologyType = "💎 Progress Maker";
        urgency = "Significant upgrade!";
      } else if (tierNum <= 8) {
        // Power user territory
        psychologyType = "⚡ Power User";
        urgency = "You're getting serious!";
      } else {
        // Elite achievements
        psychologyType = "🏆 Elite Achievement";
        urgency = "Ultimate gaming mastery!";
      }

      requirements.push({
        tier: tierNum,
        points: tier.points,
        reward: `${totalLinks} daily pastes (+${tier.extraLinks} bonus)`,
        psychologyType: psychologyType,
        urgency: urgency,
        extraLinks: tier.extraLinks,
      });
    });

    return requirements;
  };

  const unlockRequirements = getUnlockRequirements();

  // Create noise function for organic movement
  const createNoise = () => {
    const permutation: number[] = [];
    for (let i = 0; i < 256; i++) {
      permutation[i] = i;
    }

    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }

    // Double the array for easy lookup
    const p = [...permutation, ...permutation];

    // Simplex-inspired noise function
    return (x: number, y: number, z: number) => {
      // Find unit cube that contains point
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;

      // Find relative x, y, z of point in cube
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      // Compute fade curves for x, y, z
      const u = fade(x);
      const v = fade(y);
      const w = fade(z);

      // Hash coordinates of the 8 cube corners
      const A = p[X] + Y;
      const AA = p[A] + Z;
      const AB = p[A + 1] + Z;
      const B = p[X + 1] + Y;
      const BA = p[B] + Z;
      const BB = p[B + 1] + Z;

      // And add blended results from 8 corners of cube
      return lerp(
        w,
        lerp(
          v,
          lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
          lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
        ),
        lerp(
          v,
          lerp(
            u,
            grad(p[AA + 1], x, y, z - 1),
            grad(p[BA + 1], x - 1, y, z - 1)
          ),
          lerp(
            u,
            grad(p[AB + 1], x, y - 1, z - 1),
            grad(p[BB + 1], x - 1, y - 1, z - 1)
          )
        )
      );
    };
  };

  // Helper functions for noise
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  // Noise generator instance
  const noiseGen = useRef(createNoise());

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas to full viewport size
    const updateSize = () => {
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      // Update CSS size
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      canvasSizeRef.current = { width: canvas.width, height: canvas.height };

      // Scale context for sharper rendering
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    // Initialize and handle resize
    updateSize();
    window.addEventListener("resize", throttle(updateSize, 250));

    // Initial mouse position at center
    mousePositionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    // Initialize blobs
    createInitialBlobs();

    return () => window.removeEventListener("resize", updateSize);
  };

  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        primary: [260, 90, 75], // Brighter blue-purple
        secondary: [300, 85, 70], // Vibrant magenta-pink
        tertiary: [180, 80, 65], // Bright cyan-teal
        background: "rgba(9, 6, 24, 0.05)",
        blobOpacity: [0.7, 0.9], // Increased opacity for better visibility
      };
    } else {
      return {
        primary: [210, 80, 70], // Blue hue base
        secondary: [180, 75, 65], // Teal/cyan hue base
        tertiary: [150, 70, 60], // Green hue base
        background: "rgba(245, 250, 255, 0.07)",
        blobOpacity: [0.4, 0.65],
      };
    }
  };

  const createInitialBlobs = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate appropriate blob count based on screen size
    const screenArea = window.innerWidth * window.innerHeight;
    const baseBlobCount = Math.max(
      4,
      Math.min(10, Math.floor(screenArea / 150000))
    );

    const blobs: Blob[] = [];
    const colors = getThemeColors();

    for (let i = 0; i < baseBlobCount; i++) {
      // Create blobs with some variety
      const colorChoice = Math.random();
      let hue;

      if (colorChoice < 0.33) {
        hue = colors.primary[0] + (Math.random() * 20 - 10);
      } else if (colorChoice < 0.66) {
        hue = colors.secondary[0] + (Math.random() * 20 - 10);
      } else {
        hue = colors.tertiary[0] + (Math.random() * 20 - 10);
      }

      const saturation = Math.random() * 15 + 75; // 75-90%
      const lightness = Math.random() * 15 + 50; // 50-65%

      blobs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 100 + 150,
        velX: (Math.random() - 0.5) * 0.3,
        velY: (Math.random() - 0.5) * 0.3,
        growth: 0,
        color: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`,
        opacity:
          Math.random() * (colors.blobOpacity[1] - colors.blobOpacity[0]) +
          colors.blobOpacity[0],
        hue: hue,
        seed: Math.random() * 1000,
      });
    }

    blobsRef.current = blobs;

    // Initialize new game session
    const sessionId = `game_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const sessionStartTime = Date.now();

    // Reset game state with session data
    gameStateRef.current = {
      score: 0,
      collectiblesFound: 0,
      totalCollectibles: 0,
      lastScoreUpdate: 0,
      comboMultiplier: 1,
      comboTimer: 0,
      sessionId: sessionId,
      sessionStartTime: sessionStartTime,
      lastSubmissionScore: 0,
      maxComboReached: 1,
    };

    // Start spawning collectibles
    spawnCollectible();
  };

  // Enhanced collectible spawning with psychological hooks
  const spawnCollectible = () => {
    const now = Date.now();

    // Don't spawn collectibles too frequently (create anticipation)
    if (blobsRef.current.filter((b) => b.isCollectible).length >= 2) return;

    const colors = getThemeColors();

    // Variable reward schedule - sometimes spawn rare high-value collectibles
    const isRareCollectible = Math.random() < 0.15; // 15% chance for rare
    const isSuperRare = Math.random() < 0.03; // 3% chance for super rare

    let collectibleType = "common";
    let basePoints = Math.floor(Math.random() * 20) + 10; // 10-30 points
    let collectibleColor = isDarkMode
      ? `hsla(50, 100%, 85%, 1)` // Bright golden yellow for dark mode
      : `hsla(45, 100%, 65%, 1)`; // Rich golden for light mode
    let size = Math.random() * 20 + 30;

    if (isSuperRare) {
      collectibleType = "legendary";
      basePoints = Math.floor(Math.random() * 100) + 100; // 100-200 points
      collectibleColor = isDarkMode
        ? `hsla(285, 100%, 85%, 1)` // Bright purple-magenta for dark mode
        : `hsla(285, 100%, 65%, 1)`; // Rich purple for light mode
      size = Math.random() * 40 + 50;
    } else if (isRareCollectible) {
      collectibleType = "rare";
      basePoints = Math.floor(Math.random() * 50) + 40; // 40-90 points
      collectibleColor = isDarkMode
        ? `hsla(350, 100%, 80%, 1)` // Bright red-pink for dark mode
        : `hsla(350, 100%, 60%, 1)`; // Rich red for light mode
      size = Math.random() * 30 + 40;
    }

    const collectibleBlob: Blob = {
      x: Math.random() * (window.innerWidth - 200) + 100,
      y: Math.random() * (window.innerHeight - 200) + 100,
      radius: size,
      velX: (Math.random() - 0.5) * 0.8,
      velY: (Math.random() - 0.5) * 0.8,
      growth: 0,
      color: collectibleColor,
      opacity: 0.9,
      hue: isRareCollectible ? 300 : isDarkMode ? 55 : 30,
      seed: Math.random() * 1000,
      isCollectible: true,
      points: basePoints,
      pulseRate: 0.05 + Math.random() * 0.05,
      collectibleType: collectibleType,
    };

    blobsRef.current.push(collectibleBlob);
    gameStateRef.current.totalCollectibles++;

    // Variable interval spawning (unpredictable rewards increase addiction)
    clearTimeout(collectibleTimerRef.current);
    const spawnDelay =
      collectibleType === "legendary"
        ? 8000 + Math.random() * 12000
        : collectibleType === "rare"
        ? 5000 + Math.random() * 8000
        : 2000 + Math.random() * 4000;

    collectibleTimerRef.current = window.setTimeout(
      spawnCollectible,
      spawnDelay
    ) as unknown as number;
  };

  // Dynamically add a new blob near mouse position
  const addBlob = (x: number, y: number, isClick = false) => {
    const now = Date.now();
    // Limit blob creation rate
    if (now - lastAddBlobTimeRef.current < (isClick ? 200 : 1000)) return;

    lastAddBlobTimeRef.current = now;
    const colors = getThemeColors();
    const hue =
      Math.random() < 0.5
        ? colors.primary[0]
        : Math.random() < 0.5
        ? colors.secondary[0]
        : colors.tertiary[0];

    const saturation = Math.random() * 15 + 75;
    const lightness = Math.random() * 15 + 50;

    const newBlob: Blob = {
      x: x,
      y: y,
      radius: isClick ? Math.random() * 80 + 100 : Math.random() * 80 + 120,
      velX: (Math.random() - 0.5) * 0.5,
      velY: (Math.random() - 0.5) * 0.5,
      growth: isClick ? 1 : 0,
      color: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`,
      opacity:
        Math.random() * (colors.blobOpacity[1] - colors.blobOpacity[0]) +
        colors.blobOpacity[0],
      hue: hue,
      seed: Math.random() * 1000,
    };

    blobsRef.current.push(newBlob);

    // Limit total number of blobs for performance
    if (blobsRef.current.length > 15) {
      // Don't remove collectibles when limiting
      const nonCollectibles = blobsRef.current.filter((b) => !b.isCollectible);
      if (nonCollectibles.length > 0) {
        const index = blobsRef.current.indexOf(nonCollectibles[0]);
        if (index !== -1) blobsRef.current.splice(index, 1);
      } else {
        blobsRef.current.shift();
      }
    }
  };

  // Handle clicking/tapping collectible blobs
  const checkCollectibleClick = (x: number, y: number) => {
    const collectibles = blobsRef.current.filter((b) => b.isCollectible);

    // Check if any collectible was clicked
    for (const blob of collectibles) {
      const dx = blob.x - x;
      const dy = blob.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If click was within the blob
      if (distance < blob.radius) {
        collectBlob(blob);
        return true;
      }
    }

    return false;
  };

  // Enhanced collection with psychological feedback
  const collectBlob = (blob: Blob) => {
    // Remove from array
    const index = blobsRef.current.indexOf(blob);
    if (index !== -1) {
      blobsRef.current.splice(index, 1);
    }

    // Update game state with enhanced rewards
    const now = Date.now();
    const gameState = gameStateRef.current;

    // Enhanced combo system with diminishing returns to encourage sustained play
    if (now - gameState.lastScoreUpdate < 2000) {
      gameState.comboMultiplier = Math.min(10, gameState.comboMultiplier + 0.5);
      gameState.comboTimer = now;
    } else if (now - gameState.lastScoreUpdate < 5000) {
      gameState.comboMultiplier = Math.max(1, gameState.comboMultiplier * 0.9);
    } else {
      gameState.comboMultiplier = 1;
    }

    // Track max combo reached
    if (gameState.comboMultiplier > gameState.maxComboReached) {
      gameState.maxComboReached = gameState.comboMultiplier;
    }

    // Rarity multipliers for psychological impact
    let rarityMultiplier = 1;
    if (blob.collectibleType === "rare") rarityMultiplier = 2;
    if (blob.collectibleType === "legendary") rarityMultiplier = 5;

    // Add points with multipliers
    const points = Math.floor(
      (blob.points || 10) * gameState.comboMultiplier * rarityMultiplier
    );
    gameState.score += points;
    gameState.collectiblesFound++;
    gameState.lastScoreUpdate = now;

    // Achievement notifications for psychological reinforcement
    if (blob.collectibleType === "legendary") {
      // Show special notification for legendary items
      setTimeout(() => {
        toast({
          title: "🎉 LEGENDARY FIND!",
          description: `You found a legendary orb worth ${points} points!`,
          duration: 5000,
        });
      }, 100);
    } else if (blob.collectibleType === "rare") {
      setTimeout(() => {
        toast({
          title: "✨ Rare Discovery!",
          description: `Rare orb collected! ${points} points earned!`,
          duration: 3000,
        });
      }, 100);
    }

    // Check for milestone achievements
    const currentMilestone = unlockRequirements.find(
      (req) =>
        gameState.score >= req.points && gameState.score - points < req.points
    );

    if (currentMilestone) {
      setTimeout(() => {
        toast({
          title: `🏆 Achievement Unlocked!`,
          description: `${currentMilestone.psychologyType} - Now get ${
            10 + currentMilestone.extraLinks
          } daily pastes!`,
          duration: 6000,
        });
      }, 500);
    }

    // Show score UI element
    setShowScore(true);
    setShowTutorial(false);

    // Hide score after delay (but keep users engaged longer)
    setTimeout(() => {
      if (Date.now() - gameState.lastScoreUpdate > 8000) {
        setShowScore(false);
      }
    }, 8000);

    // Submit score to backend if enough points have been earned since last submission
    const scoresSinceLastSubmission =
      gameState.score - gameState.lastSubmissionScore;
    if (scoresSinceLastSubmission >= 50) {
      // Submit every 50 points
      submitScoreToBackend();
    }

    // Spawn next collectible with strategic delays
    const spawnDelay =
      gameState.comboMultiplier > 3 ? 300 : Math.random() * 1000 + 500;
    setTimeout(spawnCollectible, spawnDelay);
  };

  // Function to submit game score to backend
  const submitScoreToBackend = async () => {
    const gameState = gameStateRef.current;
    const scoreToSubmit = gameState.score - gameState.lastSubmissionScore;

    if (scoreToSubmit <= 0) return;

    try {
      const sessionDuration = Math.floor(
        (Date.now() - gameState.sessionStartTime) / 1000
      );

      const response = await submitGameScore({
        score: scoreToSubmit,
        gameSessionId: gameState.sessionId,
        duration: sessionDuration,
        collectiblesFound: gameState.collectiblesFound,
        maxComboMultiplier: gameState.maxComboReached,
      });

      // Update last submission score
      gameState.lastSubmissionScore = gameState.score;

      // Update session game points
      setSessionGamePoints(gameState.score);

      // If additional links were earned, refresh the profile to update available links everywhere
      if (response.additionalLinksEarned > 0) {
        try {
          // Refresh profile first to get the latest available links
          const updatedProfile = await refreshProfile();

          // Then show the notification with the correct value
          setTimeout(() => {
            toast({
              title: `🔗 Daily Limit Increased!`,
              description: `You now have ${updatedProfile.availableLinks} daily pastes available!`,
              duration: 5000,
            });
          }, 2000);

          console.log("Profile refreshed after earning additional links");
        } catch (err) {
          console.error("Error refreshing profile:", err);
        }
      }

      // Show achievement notifications for newly unlocked milestones
      if (response.newlyUnlocked && response.newlyUnlocked.length > 0) {
        response.newlyUnlocked.forEach((achievement, index) => {
          setTimeout(() => {
            toast({
              title: `🎉 ${achievement.psychologyType} Unlocked!`,
              description: `You earned ${achievement.reward}!`,
              duration: 6000,
            });
          }, (index + 1) * 1000);
        });
      }
    } catch (error) {
      console.error("Failed to submit game score:", error);
    }
  };

  const drawBlobs = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    // Clear canvas with slight transparency
    ctx.fillStyle = getThemeColors().background;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Update noise offset for organic movement
    noiseOffsetRef.current += 0.002;

    // Check if mouse has moved recently
    const mouseActive = Date.now() - mouseMoveTimestampRef.current < 2000;

    // Occasionally add blob if mouse is active
    if (mouseActive && Math.random() < 0.01) {
      addBlob(
        mousePositionRef.current.x + (Math.random() - 0.5) * 100,
        mousePositionRef.current.y + (Math.random() - 0.5) * 100
      );
    }

    // Update combo timer
    const now = Date.now();
    const gameState = gameStateRef.current;
    if (gameState.comboMultiplier > 1 && now - gameState.comboTimer > 3000) {
      // Reset combo if no collectibles found within 3 seconds
      gameState.comboMultiplier = 1;
    }

    // Draw each blob with bezier curves for organic shapes
    blobsRef.current.forEach((blob, index) => {
      // Update blob position with some noise for organic movement
      const noise = noiseGen.current;
      const noiseValue =
        noise(blob.x / 500, blob.y / 500, blob.seed + noiseOffsetRef.current) *
        2;

      // Collectibles move differently - more erratic and responsive to noise
      if (blob.isCollectible) {
        // More responsive to noise, less to velocity
        blob.x += blob.velX * 0.5 + noiseValue * 1.2;
        blob.y += blob.velY * 0.5 + noiseValue * 1.2;

        // Extra bouncy behavior for collectibles
        if (Math.random() < 0.01) {
          blob.velX = (Math.random() - 0.5) * 1.5;
          blob.velY = (Math.random() - 0.5) * 1.5;
        }

        // Pulsate collectible for visibility
        const pulseRate = blob.pulseRate || 0.05;
        blob.radius += Math.sin(now * pulseRate) * 0.5;
      } else {
        // Regular blobs maintain normal movement
        blob.x += blob.velX + noiseValue * 0.7;
        blob.y += blob.velY + noiseValue * 0.7;
      }

      // Bounce off edges - keep collectibles more in-bounds
      const padding = blob.isCollectible ? 50 : -100;
      if (blob.x < padding) blob.velX = Math.abs(blob.velX);
      if (blob.x > window.innerWidth - padding)
        blob.velX = -Math.abs(blob.velX);
      if (blob.y < padding) blob.velY = Math.abs(blob.velY);
      if (blob.y > window.innerHeight - padding)
        blob.velY = -Math.abs(blob.velY);

      // Mouse interaction
      if (mouseActive) {
        const dx = mousePositionRef.current.x - blob.x;
        const dy = mousePositionRef.current.y - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const interactionRadius = blob.isCollectible ? 400 : 300;
        const forceFactor = blob.isCollectible ? 0.04 : 0.02;

        if (distance < interactionRadius) {
          // Collectibles are more strongly attracted to cursor
          const force = forceFactor * (1 - distance / interactionRadius);
          blob.velX += (dx * force) / distance;
          blob.velY += (dy * force) / distance;
        }
      }

      // Apply growth for new blobs and make them pulse
      if (blob.growth > 0) {
        blob.radius += blob.growth;
        blob.growth *= 0.95;
        if (blob.growth < 0.1) blob.growth = 0;
      }

      // Draw the blob with bezier curves for organic feel
      ctx.save();

      // Create gradient fill for blob
      const gradient = ctx.createRadialGradient(
        blob.x,
        blob.y,
        0,
        blob.x,
        blob.y,
        blob.radius
      );

      const hslColor = (h: number, s: number, l: number, a: number) =>
        `hsla(${h}, ${s}%, ${l}%, ${a})`;

      // Enhanced gradients for better visibility in both themes
      if (isDarkMode) {
        // Brighter, more vibrant gradients for dark mode
        gradient.addColorStop(0, hslColor(blob.hue, 90, 80, blob.opacity)); // Bright center
        gradient.addColorStop(
          0.5,
          hslColor(blob.hue, 85, 70, blob.opacity * 0.8)
        ); // Mid transition
        gradient.addColorStop(
          1,
          hslColor(blob.hue, 80, 50, blob.opacity * 0.3)
        ); // Darker edge
      } else {
        // Original gradients for light mode
        gradient.addColorStop(0, hslColor(blob.hue, 80, 65, blob.opacity)); // Center color is lighter
        gradient.addColorStop(
          1,
          hslColor(blob.hue, 85, 55, blob.opacity * 0.3)
        ); // Edge color is more saturated
      }

      // Draw actual blob shape with bezier curves
      const points = blob.isCollectible ? 10 : 8; // More points for collectibles = more detailed
      const angleStep = (Math.PI * 2) / points;

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep;

        // Use noise to create irregular blob shape
        // Collectibles have more dynamic noise values
        const radiusNoise = blob.isCollectible
          ? 0.7 +
            noise(
              Math.cos(angle) * 0.3,
              Math.sin(angle) * 0.3,
              blob.seed + noiseOffsetRef.current * 1.5
            ) *
              0.6
          : 0.8 +
            noise(
              Math.cos(angle) * 0.2,
              Math.sin(angle) * 0.2,
              blob.seed + noiseOffsetRef.current
            ) *
              0.4;

        const radius = blob.radius * radiusNoise;

        const x = blob.x + Math.cos(angle) * radius;
        const y = blob.y + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Create control points for bezier curve
          const prevAngle = (i - 1) * angleStep;

          const cp1x =
            blob.x +
            Math.cos(prevAngle + angleStep * 0.3) *
              blob.radius *
              1.2 *
              radiusNoise;
          const cp1y =
            blob.y +
            Math.sin(prevAngle + angleStep * 0.3) *
              blob.radius *
              1.2 *
              radiusNoise;

          const cp2x =
            blob.x +
            Math.cos(angle - angleStep * 0.3) * blob.radius * 1.2 * radiusNoise;
          const cp2y =
            blob.y +
            Math.sin(angle - angleStep * 0.3) * blob.radius * 1.2 * radiusNoise;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }
      }

      ctx.closePath();

      // Add special effects for collectibles
      if (blob.isCollectible) {
        // Use a different gradient for collectibles
        const collectibleGradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );

        // Enhanced gradients with better color progression for dark mode
        if (isDarkMode) {
          // Much brighter and more vibrant gradients for dark mode
          if (blob.collectibleType === "legendary") {
            collectibleGradient.addColorStop(
              0,
              `hsla(285, 100%, 95%, ${blob.opacity})`
            ); // Very bright center
            collectibleGradient.addColorStop(
              0.3,
              `hsla(285, 100%, 85%, ${blob.opacity * 0.9})`
            ); // Bright middle
            collectibleGradient.addColorStop(
              0.7,
              `hsla(300, 90%, 75%, ${blob.opacity * 0.8})`
            ); // Transition
            collectibleGradient.addColorStop(
              1,
              `hsla(315, 85%, 60%, ${blob.opacity * 0.5})`
            ); // Edge
          } else if (blob.collectibleType === "rare") {
            collectibleGradient.addColorStop(
              0,
              `hsla(350, 100%, 90%, ${blob.opacity})`
            ); // Very bright center
            collectibleGradient.addColorStop(
              0.3,
              `hsla(350, 100%, 80%, ${blob.opacity * 0.9})`
            ); // Bright middle
            collectibleGradient.addColorStop(
              0.7,
              `hsla(340, 90%, 70%, ${blob.opacity * 0.8})`
            ); // Transition
            collectibleGradient.addColorStop(
              1,
              `hsla(330, 85%, 55%, ${blob.opacity * 0.5})`
            ); // Edge
          } else {
            // Common collectibles
            collectibleGradient.addColorStop(
              0,
              `hsla(50, 100%, 95%, ${blob.opacity})`
            ); // Very bright center
            collectibleGradient.addColorStop(
              0.3,
              `hsla(50, 100%, 85%, ${blob.opacity * 0.9})`
            ); // Bright middle
            collectibleGradient.addColorStop(
              0.7,
              `hsla(45, 90%, 75%, ${blob.opacity * 0.8})`
            ); // Transition
            collectibleGradient.addColorStop(
              1,
              `hsla(40, 85%, 60%, ${blob.opacity * 0.5})`
            ); // Edge
          }
        } else {
          // Light mode gradients (keep existing but enhance slightly)
          collectibleGradient.addColorStop(
            0,
            `hsla(${blob.hue}, 100%, 85%, ${blob.opacity})`
          );
          collectibleGradient.addColorStop(
            0.7,
            `hsla(${blob.hue}, 90%, 70%, ${blob.opacity * 0.8})`
          );
          collectibleGradient.addColorStop(
            1,
            `hsla(${blob.hue}, 85%, 55%, ${blob.opacity * 0.4})`
          );
        }

        ctx.fillStyle = collectibleGradient;
        ctx.fill();

        // Enhanced glowing effect for dark mode
        if (isDarkMode) {
          // Multiple glow layers for more dramatic effect
          ctx.shadowColor = `hsla(${blob.hue}, 90%, 80%, 0.9)`;
          ctx.shadowBlur = 25;
          ctx.fill();

          // Second glow layer
          ctx.shadowColor = `hsla(${blob.hue}, 85%, 70%, 0.6)`;
          ctx.shadowBlur = 40;
          ctx.fill();

          ctx.shadowBlur = 0;
        } else {
          // Standard glow for light mode
          ctx.shadowColor = `hsla(${blob.hue}, 90%, 70%, 0.8)`;
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Enhanced inner ring with better visibility in dark mode
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius * 0.6, 0, Math.PI * 2);
        if (isDarkMode) {
          ctx.strokeStyle = `hsla(${blob.hue}, 95%, 85%, ${
            blob.opacity * 0.7
          })`;
          ctx.lineWidth = 3; // Thicker ring for dark mode
        } else {
          ctx.strokeStyle = `hsla(${blob.hue}, 90%, 75%, ${
            blob.opacity * 0.5
          })`;
          ctx.lineWidth = 2;
        }
        ctx.stroke();

        // Add additional inner sparkle effect for dark mode
        if (isDarkMode) {
          ctx.beginPath();
          ctx.arc(blob.x, blob.y, blob.radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${blob.hue}, 100%, 95%, ${blob.opacity * 0.6})`;
          ctx.fill();
        }
      } else {
        // Regular blobs use standard gradient
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Apply subtle noise texture
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.05;

      // Create noise pattern
      for (let nx = -blob.radius; nx < blob.radius; nx += 10) {
        for (let ny = -blob.radius; ny < blob.radius; ny += 10) {
          const dist = Math.sqrt(nx * nx + ny * ny);
          if (dist < blob.radius) {
            const noiseVal = noise(
              (blob.x + nx) / 100,
              (blob.y + ny) / 100,
              noiseOffsetRef.current
            );

            ctx.fillStyle =
              noiseVal > 0.5 ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
            ctx.fillRect(blob.x + nx, blob.y + ny, 3, 3);
          }
        }
      }

      ctx.restore();

      // Apply damping for stability
      blob.velX *= 0.98;
      blob.velY *= 0.98;
    });

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(drawBlobs);
  };

  // Effect for initial setup and theme changes
  useEffect(() => {
    // Force cleanup of existing animation on theme change
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const cleanup = initCanvas();

    // Start animation
    drawBlobs();

    // Load saved high score from localStorage if available
    const savedHighScore = localStorage.getItem("blobGameHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    // Reset sessionGamePoints to 0 on mount
    resetSessionGamePoints();

    return () => {
      // Submit final score before cleanup
      const gameState = gameStateRef.current;
      if (
        gameState.sessionId &&
        gameState.score > gameState.lastSubmissionScore
      ) {
        // Fire and forget - don't wait for response
        submitScoreToBackend();
      }

      if (typeof cleanup === "function") cleanup();
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(collectibleTimerRef.current);
    };
  }, [resolvedTheme]); // Depend on resolvedTheme to properly handle theme changes

  // Add session cleanup for inactive users
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs/minimized - submit current score
        const gameState = gameStateRef.current;
        if (
          gameState.sessionId &&
          gameState.score > gameState.lastSubmissionScore
        ) {
          submitScoreToBackend();
        }
      }
    };

    const handleBeforeUnload = () => {
      // User is leaving the page - submit final score
      const gameState = gameStateRef.current;
      if (
        gameState.sessionId &&
        gameState.score > gameState.lastSubmissionScore
      ) {
        // Use navigator.sendBeacon for reliable data submission on page unload
        const scoreToSubmit = gameState.score - gameState.lastSubmissionScore;
        if (scoreToSubmit > 0) {
          const sessionDuration = Math.floor(
            (Date.now() - gameState.sessionStartTime) / 1000
          );

          // Simplified data for beacon - just score submission
          try {
            navigator.sendBeacon(
              "/api/submitFinalScore",
              JSON.stringify({
                score: scoreToSubmit,
                gameSessionId: gameState.sessionId,
                duration: sessionDuration,
                collectiblesFound: gameState.collectiblesFound,
                maxComboMultiplier: gameState.maxComboReached,
              })
            );
          } catch (error) {
            // Fallback to regular API call
            submitScoreToBackend();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Add custom animation styles
  useEffect(() => {
    const cleanupStyle = addStyleToHead();
    return cleanupStyle;
  }, []);

  // Mouse/touch event handlers - set up only once
  useEffect(() => {
    // Track mouse position
    const handleMouseMove = throttle((e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      mouseMoveTimestampRef.current = Date.now();
    }, 16); // ~60fps

    // Touch support for mobile devices
    const handleTouchMove = throttle((e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        mouseMoveTimestampRef.current = Date.now();
      }
    }, 16);

    // Create new blob on click/tap and handle collectibles
    const handleTap = (e: MouseEvent | TouchEvent) => {
      const x =
        "touches" in e && e.touches.length
          ? e.touches[0].clientX
          : "clientX" in e
          ? e.clientX
          : 0;

      const y =
        "touches" in e && e.touches.length
          ? e.touches[0].clientY
          : "clientY" in e
          ? e.clientY
          : 0;

      mousePositionRef.current = { x, y };
      mouseMoveTimestampRef.current = Date.now();

      // First check if player clicked on a collectible
      const collectedSomething = checkCollectibleClick(x, y);

      // Only create normal blob if not collecting
      if (!collectedSomething) {
        // Add blob at click/tap position with special growth effect
        addBlob(x, y, true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousedown", handleTap as EventListener);
    window.addEventListener("touchstart", handleTap as EventListener, {
      passive: true,
    });

    // Cleanup event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleTap as EventListener);
      window.removeEventListener("touchstart", handleTap as EventListener);
    };
  }, []); // Empty dependency array = run only once on mount

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0"
        aria-hidden="false"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Enhanced Score display with psychological elements */}
      {showScore && (
        <div
          className="fixed top-20 right-4 z-50 bg-opacity-90 px-4 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 max-w-xs sm:max-w-sm"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(30, 20, 60, 0.85)"
              : "rgba(220, 240, 255, 0.85)",
            color: isDarkMode
              ? "rgba(220, 210, 255, 1)"
              : "rgba(30, 70, 120, 1)",
            boxShadow: isDarkMode
              ? "0 0 30px rgba(120, 90, 255, 0.6)"
              : "0 0 25px rgba(100, 180, 255, 0.7)",
            backdropFilter: "blur(12px)",
            border: isDarkMode
              ? "2px solid rgba(149, 128, 255, 0.4)"
              : "2px solid rgba(126, 166, 224, 0.4)",
            minWidth: "200px", // Adjusted minimum width
            width: "fit-content", // Allow dynamic width
            wordWrap: "break-word", // Ensure text wraps
            overflow: "hidden", // Prevent any overflow
          }}
        >
          <div className="text-xl sm:text-2xl font-bold animate-pulse break-words leading-tight overflow-hidden">
            {sessionGamePoints.toLocaleString()}
            <span className="text-sm ml-1">pts</span>
          </div>

          {/* Progress to next unlock */}
          {(() => {
            const nextUnlock = unlockRequirements.find(
              (req) => sessionGamePoints < req.points
            );

            if (nextUnlock) {
              const progress = (sessionGamePoints / nextUnlock.points) * 100;
              const remaining = nextUnlock.points - sessionGamePoints;

              return (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1 gap-2">
                    <span className="truncate flex-shrink">
                      {nextUnlock.psychologyType}
                    </span>
                    <span className="text-right flex-shrink-0 font-medium">
                      {remaining.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 opacity-80 truncate">
                    Next: +{nextUnlock.extraLinks} daily pastes
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {highScore > 0 && (
            <div
              className="text-xs text-right mt-2 break-words"
              style={{
                color: isDarkMode
                  ? "rgba(180, 160, 255, 1)"
                  : "rgba(80, 130, 190, 1)",
              }}
            >
              🏆 Best: {highScore.toLocaleString()}
            </div>
          )}

          <div className="text-xs opacity-90 mt-1">
            {gameStateRef.current.collectiblesFound} /{" "}
            {gameStateRef.current.totalCollectibles} collected
          </div>

          {gameStateRef.current.comboMultiplier > 1 && (
            <div
              className="text-xs font-bold mt-2 animate-bounce"
              style={{
                color: isDarkMode
                  ? "rgba(255, 220, 100, 1)"
                  : "rgba(255, 140, 0, 1)",
              }}
            >
              🔥 {gameStateRef.current.comboMultiplier.toFixed(1)}x Combo!
            </div>
          )}

          {/* Motivational messages */}
          {(() => {
            const score = sessionGamePoints;
            if (score > 50000)
              return (
                <div className="text-xs mt-1 text-center">🌟 Elite Gamer!</div>
              );
            if (score > 20000)
              return (
                <div className="text-xs mt-1 text-center">🚀 Power User!</div>
              );
            if (score > 10000)
              return (
                <div className="text-xs mt-1 text-center">
                  💪 Getting Strong!
                </div>
              );
            if (score > 5000)
              return (
                <div className="text-xs mt-1 text-center">
                  ⭐ Great Progress!
                </div>
              );
            if (score > 1000)
              return (
                <div className="text-xs mt-1 text-center">🎯 Keep Going!</div>
              );
            return null;
          })()}
        </div>
      )}

      {/* Game rules icon - always visible in bottom right */}
      <Dialog open={showGameRules} onOpenChange={setShowGameRules}>
        <DialogTrigger asChild>
          <div
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 flex items-center justify-center"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(120, 90, 255, 0.9)"
                : "rgba(100, 180, 255, 0.9)",
              boxShadow: isDarkMode
                ? "0 0 20px rgba(120, 90, 255, 0.6)"
                : "0 0 15px rgba(100, 180, 255, 0.6)",
              backdropFilter: "blur(8px)",
              border: isDarkMode
                ? "2px solid rgba(149, 128, 255, 0.5)"
                : "2px solid rgba(126, 166, 224, 0.5)",
              animation: "pulse 3s infinite",
            }}
            title="Click for game rules & unlock rewards"
          >
            <span className="text-white text-lg font-bold">🎮</span>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              🎮 Game Rules & Unlock System
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-1">
            {/* Basic Rules */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">
                🎯 How to Play
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 flex-shrink-0">✨</span>
                  <span className="break-words">
                    Click on glowing golden orbs to collect them and earn points
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 flex-shrink-0">⚡</span>
                  <span className="break-words">
                    Collect orbs quickly to build up your combo multiplier
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0">⏰</span>
                  <span className="break-words">
                    Combo multiplier decreases over time - stay active!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 flex-shrink-0">🏆</span>
                  <span className="break-words">
                    Earn points to unlock amazing rewards and features
                  </span>
                </li>
              </ul>
            </div>

            {/* Current Progress */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-300">
                📊 Your Progress
              </h3>
              <div className="flex justify-between items-center mb-2 gap-2">
                <span className="text-sm font-medium flex-shrink-0">
                  Current Score:
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 break-words text-right">
                  {sessionGamePoints.toLocaleString()} points
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm font-medium flex-shrink-0">
                  High Score:
                </span>
                <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 break-words text-right">
                  {highScore.toLocaleString()} points
                </span>
              </div>
            </div>

            {/* Enhanced Unlock Requirements with psychology */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-orange-700 dark:text-orange-300">
                🎯 Daily Paste Limit Unlocks
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {unlockRequirements.map((req, index) => {
                  const isUnlocked = sessionGamePoints >= req.points;
                  const isNext =
                    !isUnlocked &&
                    (index === 0 ||
                      sessionGamePoints >=
                        unlockRequirements[index - 1].points);
                  const progress = isNext
                    ? (sessionGamePoints / req.points) * 100
                    : 0;

                  return (
                    <div
                      key={req.tier}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden ${
                        isUnlocked
                          ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600 shadow-md"
                          : isNext
                          ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-300 dark:ring-yellow-600 shadow-xl border-solid"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-70"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <span
                            className={`font-semibold text-sm break-words ${
                              isNext
                                ? "text-orange-700 dark:text-yellow-300"
                                : ""
                            }`}
                          >
                            {isUnlocked ? "✅" : isNext ? "🎯" : "🔒"}
                            {req.psychologyType}
                          </span>
                          <div
                            className={`text-xs mt-1 break-words ${
                              isNext
                                ? "text-orange-600 dark:text-yellow-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {req.urgency}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold flex-shrink-0 ${
                            isUnlocked
                              ? "text-green-600 dark:text-green-400"
                              : isNext
                              ? "text-orange-700 dark:text-yellow-300"
                              : "text-gray-500"
                          }`}
                        >
                          {req.points.toLocaleString()}
                        </span>
                      </div>

                      <div
                        className={`text-sm font-medium mb-1 break-words ${
                          isNext
                            ? "text-orange-800 dark:text-yellow-200"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {req.reward}
                      </div>

                      {isNext && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1 gap-2">
                            <span className="flex-shrink-0">Progress</span>
                            <span className="break-words text-right">
                              {(
                                req.points - sessionGamePoints
                              ).toLocaleString()}{" "}
                              more needed
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Premium upsell at bottom */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg border-2 border-purple-200 dark:border-purple-700 overflow-hidden">
                <div className="text-center">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 break-words">
                    👑 Want Unlimited Pastes?
                  </h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-3 break-words">
                    Skip the gaming and get unlimited daily pastes + no ads
                    instantly!
                  </p>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-semibold hover:scale-105 transition-transform break-words">
                    Upgrade Now - Only $4.99/month
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Pro Tips with psychological triggers */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">
                🧠 Gaming Tips & Strategy
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 flex-shrink-0">⚡</span>
                  <span className="break-words">
                    <strong>Combo System:</strong> Quick consecutive clicks
                    build multipliers up to 10x!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 flex-shrink-0">🎰</span>
                  <span className="break-words">
                    <strong>Rare Orbs:</strong> Golden (common), Red (rare 2x),
                    Purple (legendary 5x)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 flex-shrink-0">🎯</span>
                  <span className="break-words">
                    <strong>Daily Limits:</strong> Earn more paste limits
                    through consistent play
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 flex-shrink-0">🏆</span>
                  <span className="break-words">
                    <strong>Progressive Rewards:</strong> Each tier unlocks
                    higher daily limits
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 flex-shrink-0">⏰</span>
                  <span className="break-words">
                    <strong>Stay Active:</strong> Combos reset after 3 seconds
                    of inactivity
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Tutorial Message with Psychology */}
      <div className="fixed bottom-4 right-4 z-40 max-w-xs sm:max-w-sm">
        <div
          className="group bg-opacity-90 px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 border-2"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(20, 25, 50, 0.85)"
              : "rgba(240, 245, 255, 0.85)",
            color: isDarkMode
              ? "rgba(200, 210, 255, 1)"
              : "rgba(50, 70, 120, 1)",
            borderColor: isDarkMode
              ? "rgba(100, 120, 255, 0.5)"
              : "rgba(120, 150, 255, 0.5)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setShowGameRules(true)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl animate-bounce">🎮</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs sm:text-sm truncate">
                Unlock Daily Paste Limits!
              </div>
              <div className="text-xs opacity-80 mt-1 truncate">
                Click floating orbs to earn points
              </div>
              <div
                className="text-xs mt-1 truncate"
                style={{
                  color: isDarkMode
                    ? "rgba(150, 200, 100, 1)"
                    : "rgba(100, 150, 50, 1)",
                }}
              >
                🎯 Current: {sessionGamePoints.toLocaleString()} pts
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicBackground;
