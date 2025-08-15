import { useEffect, useRef, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DarkVeilBackgroundProps {
  speed?: number;
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
}

export const DarkVeilBackground = ({
  speed = 0.5,
  hueShift = 0,
  noiseIntensity = 0.1,
  scanlineIntensity = 0.05,
  scanlineFrequency = 0.5,
  warpAmount = 0.1
}: DarkVeilBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const isMobile = useIsMobile();

  // Reduce complexity on mobile for performance
  const adjustedProps = useMemo(() => ({
    speed: isMobile ? speed * 0.5 : speed,
    noiseIntensity: isMobile ? noiseIntensity * 0.5 : noiseIntensity,
    scanlineIntensity: isMobile ? scanlineIntensity * 0.5 : scanlineIntensity,
    particles: isMobile ? 30 : 50
  }), [isMobile, speed, noiseIntensity, scanlineIntensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < adjustedProps.particles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() * 60 + 200 // Blue-purple range
      });
    }

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const time = elapsed * adjustedProps.speed;

      // Clear canvas with dark background
      ctx.fillStyle = 'hsl(220, 20%, 8%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create animated gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.3) * 100,
        canvas.height / 2 + Math.cos(time * 0.2) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8
      );
      
      gradient.addColorStop(0, `hsla(${240 + hueShift + Math.sin(time * 0.5) * 20}, 60%, 15%, 0.3)`);
      gradient.addColorStop(0.5, `hsla(${220 + hueShift}, 40%, 10%, 0.2)`);
      gradient.addColorStop(1, `hsla(${200 + hueShift}, 30%, 8%, 0.1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animate particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx + Math.sin(time * 0.5 + index * 0.1) * 0.1;
        particle.y += particle.vy + Math.cos(time * 0.3 + index * 0.1) * 0.1;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Animate opacity
        particle.opacity = (Math.sin(time * 0.8 + index * 0.2) + 1) * 0.15 + 0.05;

        // Draw particle with glow effect
        const glowSize = particle.size * 3;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        
        gradient.addColorStop(0, `hsla(${particle.hue + hueShift}, 70%, 60%, ${particle.opacity})`);
        gradient.addColorStop(0.3, `hsla(${particle.hue + hueShift}, 60%, 50%, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${particle.hue + hueShift}, 50%, 40%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add subtle scanlines if enabled
      if (scanlineIntensity > 0) {
        ctx.globalAlpha = scanlineIntensity;
        for (let y = 0; y < canvas.height; y += Math.max(2, scanlineFrequency * 10)) {
          ctx.fillStyle = `hsla(0, 0%, 100%, ${Math.sin(time * 2 + y * 0.01) * 0.1 + 0.05})`;
          ctx.fillRect(0, y, canvas.width, 1);
        }
        ctx.globalAlpha = 1;
      }

      // Add noise texture if enabled
      if (adjustedProps.noiseIntensity > 0) {
        ctx.globalAlpha = adjustedProps.noiseIntensity;
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const noise = Math.random();
          imageData.data[i] = noise * 255;
          imageData.data[i + 1] = noise * 255;
          imageData.data[i + 2] = noise * 255;
          imageData.data[i + 3] = noise * 25;
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [adjustedProps, hueShift, scanlineIntensity, scanlineFrequency, warpAmount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 1,
        willChange: 'transform'
      }}
      aria-hidden="true"
    />
  );
};