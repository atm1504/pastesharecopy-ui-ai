import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

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
}

interface GameState {
  score: number;
  collectiblesFound: number;
  totalCollectibles: number;
  lastScoreUpdate: number;
  comboMultiplier: number;
  comboTimer: number;
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
  });
  const collectibleTimerRef = useRef(0);

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
        primary: [280, 80, 60], // Purple hue base
        secondary: [260, 70, 50], // Indigo hue base
        tertiary: [300, 75, 55], // Pink/magenta hue base
        background: "rgba(9, 6, 24, 0.05)",
        blobOpacity: [0.6, 0.8],
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

    // Reset game state
    gameStateRef.current = {
      score: 0,
      collectiblesFound: 0,
      totalCollectibles: 0,
      lastScoreUpdate: 0,
      comboMultiplier: 1,
      comboTimer: 0,
    };

    // Start spawning collectibles
    spawnCollectible();
  };

  // Create special collectible blobs that users can click to collect
  const spawnCollectible = () => {
    const now = Date.now();

    // Don't spawn collectibles too frequently
    if (blobsRef.current.filter((b) => b.isCollectible).length >= 3) return;

    const colors = getThemeColors();

    // Create a special collectible blob with different visual properties
    const collectibleBlob: Blob = {
      x: Math.random() * (window.innerWidth - 200) + 100,
      y: Math.random() * (window.innerHeight - 200) + 100,
      radius: Math.random() * 30 + 40, // Smaller than regular blobs
      velX: (Math.random() - 0.5) * 0.8, // Moves a bit faster
      velY: (Math.random() - 0.5) * 0.8,
      growth: 0,
      color: isDarkMode
        ? `hsla(55, 100%, 70%, 1)` // Golden in dark mode
        : `hsla(30, 100%, 60%, 1)`, // Orange in light mode
      opacity: 0.9,
      hue: isDarkMode ? 55 : 30,
      seed: Math.random() * 1000,
      isCollectible: true,
      points: Math.floor(Math.random() * 30) + 20, // Random points 20-50
      pulseRate: 0.05 + Math.random() * 0.05, // Controls animation pulse
    };

    blobsRef.current.push(collectibleBlob);
    gameStateRef.current.totalCollectibles++;

    // Schedule next collectible spawn
    clearTimeout(collectibleTimerRef.current);
    collectibleTimerRef.current = window.setTimeout(
      spawnCollectible,
      3000 + Math.random() * 5000 // Spawn every 3-8 seconds
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

  // Collect a blob and update score
  const collectBlob = (blob: Blob) => {
    // Remove from array
    const index = blobsRef.current.indexOf(blob);
    if (index !== -1) {
      blobsRef.current.splice(index, 1);
    }

    // Update game state
    const now = Date.now();
    const gameState = gameStateRef.current;

    // Update combo multiplier if collected in quick succession
    if (now - gameState.lastScoreUpdate < 3000) {
      gameState.comboMultiplier = Math.min(5, gameState.comboMultiplier + 0.5);
      gameState.comboTimer = now; // Reset combo timer
    } else {
      gameState.comboMultiplier = 1;
    }

    // Add points with multiplier
    const points = Math.floor((blob.points || 10) * gameState.comboMultiplier);
    gameState.score += points;
    gameState.collectiblesFound++;
    gameState.lastScoreUpdate = now;

    // Update high score
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      // Save to localStorage for persistence
      localStorage.setItem("blobGameHighScore", gameState.score.toString());
    }

    // Show score UI element
    setShowScore(true);
    setShowTutorial(false);

    // Hide score after a delay
    setTimeout(() => {
      if (Date.now() - gameState.lastScoreUpdate > 5000) {
        setShowScore(false);
      }
    }, 5000);

    // Spawn a new collectible
    setTimeout(spawnCollectible, Math.random() * 1000 + 500);
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

      // Center color is lighter
      gradient.addColorStop(0, hslColor(blob.hue, 80, 65, blob.opacity));
      // Edge color is more saturated
      gradient.addColorStop(1, hslColor(blob.hue, 85, 55, blob.opacity * 0.3));

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

        // Brighter, more eye-catching gradient
        collectibleGradient.addColorStop(
          0,
          `hsla(${blob.hue}, 100%, 80%, ${blob.opacity})`
        );
        collectibleGradient.addColorStop(
          0.7,
          `hsla(${blob.hue}, 90%, 65%, ${blob.opacity * 0.8})`
        );
        collectibleGradient.addColorStop(
          1,
          `hsla(${blob.hue}, 85%, 50%, ${blob.opacity * 0.4})`
        );

        ctx.fillStyle = collectibleGradient;
        ctx.fill();

        // Add glowing effect
        ctx.shadowColor = `hsla(${blob.hue}, 90%, 70%, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Add inner ring for better visibility
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${blob.hue}, 90%, 75%, ${blob.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
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

    return () => {
      if (typeof cleanup === "function") cleanup();
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(collectibleTimerRef.current);
    };
  }, [resolvedTheme]); // Depend on resolvedTheme to properly handle theme changes

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

      {/* Score display */}
      {showScore && (
        <div
          className="fixed top-20 right-4 z-50 bg-opacity-80 px-4 py-2 rounded-lg transition-opacity duration-300"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(30, 20, 60, 0.7)"
              : "rgba(220, 240, 255, 0.7)",
            color: isDarkMode
              ? "rgba(220, 210, 255, 1)"
              : "rgba(30, 70, 120, 1)",
            boxShadow: isDarkMode
              ? "0 0 20px rgba(120, 90, 255, 0.4)"
              : "0 0 15px rgba(100, 180, 255, 0.5)",
            backdropFilter: "blur(8px)",
            border: isDarkMode
              ? "1px solid rgba(149, 128, 255, 0.3)"
              : "1px solid rgba(126, 166, 224, 0.3)",
          }}
        >
          <div className="text-2xl font-bold">
            {gameStateRef.current.score} points
          </div>
          {highScore > 0 && (
            <div
              className="text-sm text-right"
              style={{
                color: isDarkMode
                  ? "rgba(180, 160, 255, 1)"
                  : "rgba(80, 130, 190, 1)",
              }}
            >
              Best: {highScore}
            </div>
          )}
          <div className="text-sm opacity-80">
            {gameStateRef.current.collectiblesFound} /{" "}
            {gameStateRef.current.totalCollectibles} collected
          </div>
          {gameStateRef.current.comboMultiplier > 1 && (
            <div
              className="text-sm font-bold mt-1"
              style={{
                color: isDarkMode
                  ? "rgba(255, 220, 100, 1)"
                  : "rgba(255, 140, 0, 1)",
              }}
            >
              {gameStateRef.current.comboMultiplier.toFixed(1)}x Combo!
            </div>
          )}
        </div>
      )}

      {/* Tutorial tooltip */}
      {showTutorial && (
        <div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-center"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(30, 20, 60, 0.8)"
              : "rgba(220, 240, 255, 0.8)",
            color: isDarkMode
              ? "rgba(220, 210, 255, 1)"
              : "rgba(30, 70, 120, 1)",
            boxShadow: isDarkMode
              ? "0 0 20px rgba(120, 90, 255, 0.4)"
              : "0 0 15px rgba(100, 180, 255, 0.5)",
            backdropFilter: "blur(8px)",
            maxWidth: "280px",
            border: isDarkMode
              ? "1px solid rgba(149, 128, 255, 0.3)"
              : "1px solid rgba(126, 166, 224, 0.3)",
            animation: "pulse 2s infinite",
          }}
        >
          <div className="text-lg font-semibold mb-1">
            Collect the glowing orbs!
          </div>
          <div className="text-sm opacity-80">
            Click the golden blobs to earn points.
            <br />
            Quick captures build your combo multiplier!
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicBackground;
