import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Video, Download, Square, Image, Play } from "lucide-react";
import { GradientSettings } from "@/pages/home";
import { generateLottieAnimation } from "@/lib/gradientEffects";
import { useToast } from "@/hooks/use-toast";

interface Props {
  settings: GradientSettings;
  onSettingsChange: (settings: GradientSettings) => void;
}

export default function RecordingPanel({ settings, onSettingsChange }: Props) {
  const [duration, setDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const recordedFramesRef = useRef<{ time: number; pixels: { x: number; y: number; opacity: number }[] }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (settings.isRecording && recordingStartTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [settings.isRecording, recordingStartTime]);

  const handleStartRecording = () => {
    setRecordingStartTime(Date.now());
    setDuration(0);
    recordedFramesRef.current = [];
    onSettingsChange({
      ...settings,
      isRecording: true
    });
  };

  const handleStopRecording = () => {
    setRecordingStartTime(null);
    onSettingsChange({
      ...settings,
      isRecording: false
    });
  };

  const handleFrameCapture = (frameData: { time: number; pixels: { x: number; y: number; opacity: number }[] }) => {
    if (settings.isRecording) {
      recordedFramesRef.current.push(frameData);
    }
  };

  const handleExportLottie = () => {
    if (recordedFramesRef.current.length === 0) {
      toast({
        title: "No recording available",
        description: "Please record an animation before exporting to Lottie.",
        variant: "destructive"
      });
      return;
    }

    const lottieData = generateLottieAnimation(recordedFramesRef.current, settings);
    const blob = new Blob([JSON.stringify(lottieData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halliday-gradient-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Lottie animation exported",
      description: "Your gradient animation has been saved as a Lottie JSON file.",
    });
  };

  const handleExportSVG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Get canvas content and export as SVG
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create SVG with the same dimensions as the canvas
    const width = canvas.width;
    const height = canvas.height;

    // Generate a grid of rectangles based on current settings
    const cols = Math.ceil(width / settings.pixelSize);
    const rows = Math.ceil(height / settings.pixelSize);

    let rects = '';
    const time = performance.now() / 1000;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let opacity = 0;
        const abstractionNoise = Math.sin(x * y * settings.effectParams.abstraction) * 0.5 + 0.5;

        switch (settings.effectMode) {
          case "wavy":
            opacity = Math.sin(
              x * settings.effectParams.frequency +
              y * (settings.effectParams.frequency * 0.5) +
              time * settings.effectParams.amplitude
            ) * 0.5 + 0.5;
            break;
          case "orbit":
            const dx = x - cols / 2;
            const dy = y - rows / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            opacity = Math.sin(dist * settings.effectParams.radius - time * settings.effectParams.orbitSpeed) * 0.5 + 0.5;
            break;
          case "hectic":
            opacity = Math.sin(x * y * settings.effectParams.intensity + time * settings.effectParams.hecticSpeed) * 0.5 + 0.5;
            break;
        }

        opacity = opacity * (1 - settings.effectParams.abstraction) + abstractionNoise * settings.effectParams.abstraction;

        rects += `
          <rect 
            x="${x * settings.pixelSize}" 
            y="${y * settings.pixelSize}" 
            width="${settings.pixelSize - settings.tileSpacing}" 
            height="${settings.pixelSize - settings.tileSpacing}" 
            fill="${settings.artColor}"
            opacity="${opacity.toFixed(3)}"
          />`;
      }
    }

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${settings.backgroundColor}"/>
        ${rects}
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halliday-gradient-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Create a new canvas at 3x resolution
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * 3;
    exportCanvas.height = canvas.height * 3;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Scale up the existing canvas
    ctx.scale(3, 3);
    ctx.drawImage(canvas, 0, 0);

    // Convert to PNG and download
    const url = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `halliday-gradient-${Date.now()}@3x.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Recording Controls</Label>
        {settings.isRecording && (
          <span className="text-sm font-medium text-red-500">
            Recording: {duration}s
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {!settings.isRecording ? (
          <Button
            onClick={handleStartRecording}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Video className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}

        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          onClick={handleExportLottie}
        >
          <Play className="w-4 h-4 mr-2" />
          Export Lottie
        </Button>

        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          onClick={handleExportSVG}
        >
          <Download className="w-4 h-4 mr-2" />
          Export SVG
        </Button>

        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          onClick={handleExportPNG}
        >
          <Image className="w-4 h-4 mr-2" />
          Export PNG @3x
        </Button>
      </div>
    </div>
  );
}