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
      const container = canvas.parentElement;
      if (!container) return;

      // Set canvas size to match container
      canvas.width = 1920; // Fixed internal resolution
      canvas.height = 1080;

      // Set display size to fill container
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';

      // Set CSS to prevent blurry rendering
      canvas.style.imageRendering = 'pixelated';
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

  // Handle recording state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (settings.isRecording && !mediaRecorderRef.current) {
      // Start recording
      const stream = canvas.captureStream(24); // 24fps
      const videoTrack = stream.getVideoTracks()[0];

      // Create a new MediaStream with only the video track
      const videoStream = new MediaStream([videoTrack]);

      const mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/mp4; codecs="avc1.42E01E"', // H.264 codec
        videoBitsPerSecond: 8000000 // 8Mbps for high quality
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `halliday-gradient-${Date.now()}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
        toast({
          title: "Recording saved",
          description: "Your gradient animation has been saved as an MP4 file.",
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