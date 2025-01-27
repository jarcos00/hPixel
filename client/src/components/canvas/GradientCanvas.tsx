import { useEffect, useRef } from "react";
import { GradientSettings } from "@/pages/home";
import { generateGradient } from "@/lib/gradientEffects";
import { useToast } from "@/hooks/use-toast";

interface Props {
  settings: GradientSettings;
}

export default function GradientCanvas({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = 1920;
      canvas.height = 1080;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';
      canvas.style.imageRendering = 'pixelated';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial render to prevent black frame
    generateGradient(ctx, settings, 0);

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

  // Handle recording state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (settings.isRecording && !mediaRecorderRef.current) {
      // Ensure initial frame is rendered before starting recording
      setTimeout(() => {
        const stream = canvas.captureStream(30); // Increased to 30fps for smoother recording
        const videoTrack = stream.getVideoTracks()[0];
        const videoStream = new MediaStream([videoTrack]);

        const mediaRecorder = new MediaRecorder(videoStream, {
          mimeType: 'video/webm;codecs=h264',
          videoBitsPerSecond: 8000000 // 8Mbps for high quality
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `halliday-gradient-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          chunksRef.current = [];
          toast({
            title: "Recording saved",
            description: "Your gradient animation has been saved as a video file.",
          });
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000 / 30); // Request data every frame
        toast({
          title: "Recording started",
          description: "Recording your gradient animation...",
        });
      }, 100); // Small delay to ensure first frame is rendered
    } else if (!settings.isRecording && mediaRecorderRef.current) {
      // Stop recording
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, [settings.isRecording, toast]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}