import { useEffect, useRef } from "react";
import { GradientSettings } from "@/pages/home";
import { generateGradient } from "@/lib/gradientEffects";

interface Props {
  settings: GradientSettings;
}

export default function GradientCanvas({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (timestamp: number) => {
      if (!ctx) return;
      
      const deltaTime = timestamp - timeRef.current;
      timeRef.current = timestamp;

      generateGradient(ctx, settings, deltaTime);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}
