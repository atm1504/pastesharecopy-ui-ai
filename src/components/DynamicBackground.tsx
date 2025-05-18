import React, { useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

// Throttle helper function to limit event callback frequency
const throttle = (callback: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
};

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Refs to store animation state
  const particlesRef = useRef<Particle[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const mouseMoveTimestampRef = useRef(0);
  const animationFrameRef = useRef(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const isMobileRef = useRef(false);

  const initCanvas = () => {
    console.log("DynamicBackground: Initializing canvas", {
      theme,
      resolvedTheme,
    });
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("DynamicBackground: Canvas ref is null");
      return;
    }

    // Detect if we're on a mobile device
    isMobileRef.current = window.innerWidth < 768;

    // Set canvas to full viewport size
    const updateSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvasSizeRef.current = { width: canvas.width, height: canvas.height };
      console.log(
        `DynamicBackground: Canvas size set to ${canvas.width}x${canvas.height}`
      );

      // Update mobile status on resize
      isMobileRef.current = window.innerWidth < 768;

      // Recreate particles with appropriate count for device size
      createParticles();
    };

    // Initialize and handle resize
    updateSize();
    window.addEventListener("resize", throttle(updateSize, 250));

    // Initial mouse position at center
    mousePositionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    // Initialize particles with appropriate count
    createParticles();

    return () => window.removeEventListener("resize", updateSize);
  };

  const createParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate appropriate particle count based on screen size and device
    const baseCount = isMobileRef.current ? 6000 : 9000; // More visible particles
    const maxCount = isMobileRef.current ? 100 : 180; // More particles

    const particleCount = Math.min(
      Math.floor((canvas.width * canvas.height) / baseCount),
      maxCount
    );

    console.log(
      `DynamicBackground: Creating ${particleCount} particles, isDarkMode: ${isDarkMode}`
    );

    const particles: Particle[] = [];

    // Define colors for both themes
    // Dark mode - keep the existing purple/blue scheme that looks good
    const darkPrimary = "149, 128, 255"; // Purple
    const darkSecondary = "129, 140, 248"; // Indigo
    const darkTertiary = "168, 85, 247"; // Alternative purple for variety

    // Light mode - new elegant, softer colors that complement light backgrounds
    const lightPrimary = "126, 166, 224"; // Soft blue
    const lightSecondary = "190, 227, 248"; // Light sky blue
    const lightTertiary = "147, 197, 253"; // Another soft blue variant

    // Background fills for clearing the canvas
    const darkBgFill = "rgba(9, 6, 24, 0.15)";
    const lightBgFill = "rgba(245, 250, 255, 0.2)";

    for (let i = 0; i < particleCount; i++) {
      // Randomize colors with more variety (3 options instead of 2)
      const random = Math.random();
      let colorChoice;

      if (isDarkMode) {
        if (random < 0.4) colorChoice = darkPrimary;
        else if (random < 0.8) colorChoice = darkSecondary;
        else colorChoice = darkTertiary;
      } else {
        if (random < 0.4) colorChoice = lightPrimary;
        else if (random < 0.8) colorChoice = lightSecondary;
        else colorChoice = lightTertiary;
      }

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 2, // Big particles
        speedX: (Math.random() - 0.5) * 0.5, // Normal speed
        speedY: (Math.random() - 0.5) * 0.5, // Normal speed
        color: colorChoice,
        opacity: isDarkMode
          ? Math.random() * 0.8 + 0.3 // Higher opacity for dark mode
          : Math.random() * 0.6 + 0.2, // Slightly lower opacity for light mode
      });
    }
    particlesRef.current = particles;
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas with slight transparency to create trails
    ctx.fillStyle = isDarkMode
      ? "rgba(9, 6, 24, 0.15)" // Dark mode background
      : "rgba(245, 250, 255, 0.2)"; // Light mode background - slightly blue tinted
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around canvas edges
      if (particle.x > canvas.width) particle.x = 0;
      else if (particle.x < 0) particle.x = canvas.width;
      if (particle.y > canvas.height) particle.y = 0;
      else if (particle.y < 0) particle.y = canvas.height;

      // Cursor influence (attraction/repulsion)
      const mouseX = mousePositionRef.current.x;
      const mouseY = mousePositionRef.current.y;
      const dx = particle.x - mouseX;
      const dy = particle.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Active cursor effect only if mouse/touch moved recently (within last 2 seconds)
      const cursorActive = Date.now() - mouseMoveTimestampRef.current < 2000;

      // Adjust influence radius for mobile
      const influenceRadius = isMobileRef.current ? 100 : 180;

      if (cursorActive && distance < influenceRadius) {
        // Create a force field effect
        const force = 0.8 / distance; // Stronger effect
        const angle = Math.atan2(dy, dx);

        // Particles move away from cursor (repulsion)
        particle.speedX += Math.cos(angle) * force * (index % 2 === 0 ? 1 : -1);
        particle.speedY += Math.sin(angle) * force * (index % 2 === 0 ? 1 : -1);

        // Limit max speed
        const maxSpeed = 3; // Faster
        const currentSpeed = Math.sqrt(
          particle.speedX * particle.speedX + particle.speedY * particle.speedY
        );

        if (currentSpeed > maxSpeed) {
          particle.speedX = (particle.speedX / currentSpeed) * maxSpeed;
          particle.speedY = (particle.speedY / currentSpeed) * maxSpeed;
        }
      }

      // Draw circle particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
      ctx.fill();

      // Connect nearby particles with lines
      connectParticles(particle, index, ctx);

      // Slight damping effect for stability
      particle.speedX *= 0.99;
      particle.speedY *= 0.99;
    });

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(drawParticles);
  };

  const connectParticles = (
    particle: Particle,
    index: number,
    ctx: CanvasRenderingContext2D
  ) => {
    // Adjust connection distance for mobile
    const connectionDistance = isMobileRef.current ? 100 : 150;

    for (let i = index + 1; i < particlesRef.current.length; i++) {
      const nextParticle = particlesRef.current[i];
      const dx = particle.x - nextParticle.x;
      const dy = particle.y - nextParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Connect close particles with lines
      if (distance < connectionDistance) {
        // Line opacity based on distance - more subtle in light mode
        const baseOpacity = isDarkMode ? 0.5 : 0.35;
        const opacity =
          ((connectionDistance - distance) / connectionDistance) * baseOpacity;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${particle.color}, ${opacity})`;
        ctx.lineWidth = isDarkMode ? 1.0 : 0.8; // Slightly thinner lines in light mode
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(nextParticle.x, nextParticle.y);
        ctx.stroke();
      }
    }
  };

  // Effect for initial setup and theme changes
  useEffect(() => {
    console.log("DynamicBackground: Component mounted or theme changed", {
      theme,
      resolvedTheme,
    });

    // Force cleanup of existing animation on theme change
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const cleanup = initCanvas();

    // Start animation
    drawParticles();
    console.log("DynamicBackground: Animation started");

    return () => {
      console.log("DynamicBackground: Cleaning up on theme change or unmount");
      cleanup && cleanup();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [resolvedTheme]); // Depend on resolvedTheme to properly handle system theme changes

  // Mouse/touch event handlers - set up only once
  useEffect(() => {
    console.log("DynamicBackground: Setting up event handlers");

    // Track mouse position (throttled for performance)
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

    // Pulse effect on tap/click
    const handleTap = throttle((e: MouseEvent | TouchEvent) => {
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
    }, 100);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousedown", handleTap as EventListener);
    window.addEventListener("touchstart", handleTap as EventListener, {
      passive: true,
    });

    // Cleanup event listeners only when component unmounts
    return () => {
      console.log("DynamicBackground: Removing event handlers on unmount");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleTap as EventListener);
      window.removeEventListener("touchstart", handleTap as EventListener);
    };
  }, []); // Empty dependency array = run only once on mount

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{ backgroundColor: "transparent" }}
    />
  );
};

export default DynamicBackground;
