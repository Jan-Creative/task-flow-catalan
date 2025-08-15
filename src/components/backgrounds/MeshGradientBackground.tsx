import React, { useRef, useEffect } from 'react';

interface MeshGradientBackgroundProps {
  speed?: number;
  intensity?: number;
  hueShift?: number;
}

export const MeshGradientBackground: React.FC<MeshGradientBackgroundProps> = ({
  speed = 1.0,
  intensity = 0.5,
  hueShift = 0.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      time += 0.01 * speed;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient mesh
      const gradient = ctx.createRadialGradient(
        canvas.width * (0.5 + 0.3 * Math.sin(time)),
        canvas.height * (0.5 + 0.3 * Math.cos(time)),
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        Math.max(canvas.width, canvas.height) * 0.8
      );

      const baseHue = (210 + hueShift * 360) % 360;
      const alpha = 0.3 + intensity * 0.4;

      gradient.addColorStop(0, `hsla(${baseHue}, 70%, 20%, ${alpha})`);
      gradient.addColorStop(0.5, `hsla(${(baseHue + 60) % 360}, 60%, 15%, ${alpha * 0.7})`);
      gradient.addColorStop(1, `hsla(${(baseHue + 120) % 360}, 50%, 10%, ${alpha * 0.5})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add secondary gradient
      const gradient2 = ctx.createRadialGradient(
        canvas.width * (0.3 + 0.2 * Math.sin(time * 1.3)),
        canvas.height * (0.7 + 0.2 * Math.cos(time * 1.7)),
        0,
        canvas.width * 0.3,
        canvas.height * 0.3,
        Math.max(canvas.width, canvas.height) * 0.6
      );

      gradient2.addColorStop(0, `hsla(${(baseHue + 180) % 360}, 60%, 25%, ${alpha * 0.6})`);
      gradient2.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [speed, intensity, hueShift]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
      style={{ filter: 'blur(1px)' }}
    />
  );
};