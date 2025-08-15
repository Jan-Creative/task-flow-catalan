import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  speed?: number;
  intensity?: number;
  hueShift?: number;
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
  speed = 1.0,
  intensity = 0.5,
  hueShift = 0.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Matrix characters
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');
    
    const fontSize = Math.max(8, 12 * intensity);
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }
    
    const hueRotation = hueShift * 360;
    
    const draw = () => {
      // Create fading trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      
      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize + fontSize / 2;
        const y = drops[i];
        
        // Create color gradient effect
        const opacity = Math.max(0.3, Math.random() * intensity);
        const hue = (120 + hueRotation + (y / canvas.height) * 60) % 360;
        
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${opacity})`;
        ctx.fillText(char, x, y);
        
        // Add glow effect for some characters
        if (Math.random() < intensity * 0.3) {
          ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
          ctx.shadowBlur = 10 * intensity;
          ctx.fillText(char, x, y);
          ctx.shadowBlur = 0;
        }
        
        // Move drop down
        drops[i] += fontSize * speed * (0.5 + Math.random() * 0.5);
        
        // Reset drop when it goes off screen
        if (drops[i] > canvas.height) {
          drops[i] = -fontSize * Math.random() * 5;
        }
      }
    };
    
    const interval = setInterval(draw, 50 / speed);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [speed, intensity, hueShift]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 20, 0, 0.9) 0%, rgba(0, 0, 0, 1) 100%)',
      }}
      aria-hidden="true"
    />
  );
};