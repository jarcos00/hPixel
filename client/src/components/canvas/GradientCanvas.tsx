import { useEffect, useRef } from "react";
import { GradientSettings } from "@/pages/home";
import { generateGradient } from "@/lib/gradientEffects";
import { useToast } from "@/hooks/use-toast";

interface Props {
  settings: GradientSettings;
  onFrameCapture?: (frameData: { time: number; pixels: { x: number; y: number; opacity: number }[] }) => void;
}

export default function GradientCanvas({ settings, onFrameCapture }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = 1920;
      canvas.height = 1080;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';
      canvas.style.imageRendering = 'pixelated';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (timestamp: number) => {
      if (!ctx) return;

      const deltaTime = timestamp - timeRef.current;
      timeRef.current = timestamp;

      // Get frame data if recording
      if (settings.isRecording && onFrameCapture) {
        const frameTime = (timestamp - startTimeRef.current) / 1000; // Convert to seconds
        const frameData = generateGradient(ctx, settings, deltaTime, true);
        if (frameData) {
          onFrameCapture({ time: frameTime, pixels: frameData });
        }
      } else {
        generateGradient(ctx, settings, deltaTime, false);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    if (settings.isRecording) {
      startTimeRef.current = performance.now();
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings, onFrameCapture]);

  // Handle recording state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (settings.isRecording && !mediaRecorderRef.current) {
      // Start recording
      const stream = canvas.captureStream(24);
      const videoTrack = stream.getVideoTracks()[0];
      const videoStream = new MediaStream([videoTrack]);

      const mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/webm;codecs=h264',
        videoBitsPerSecond: 8000000
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
      mediaRecorder.start();
      toast({
        title: "Recording started",
        description: "Recording your gradient animation...",
      });
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