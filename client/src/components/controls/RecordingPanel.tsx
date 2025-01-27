import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Video, Download, Square, Image, ChevronDown } from "lucide-react";
import { GradientSettings } from "@/pages/home";

interface Props {
  settings: GradientSettings;
  onSettingsChange: (settings: GradientSettings) => void;
}

export default function RecordingPanel({ settings, onSettingsChange }: Props) {
  const [duration, setDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

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

  const handleExportSVG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Get the current canvas content
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
          case "free":
            const nx = x * settings.effectParams.complexity * 0.1;
            const ny = y * settings.effectParams.complexity * 0.1;
            const t = time * settings.effectParams.fluidity * 0.5;
            opacity = (
              Math.sin(nx + t) * 0.4 +
              Math.sin(ny - t * 0.5) * 0.4 +
              Math.sin((nx + ny) * 0.5 + t * 0.7) * 0.2
            ) * 0.5 + 0.5;
            break;
        }

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

  if (!isVisible) {
    return (
      <Button 
        variant="ghost" 
        onClick={() => setIsVisible(true)}
        className="w-full flex items-center justify-center py-2"
      >
        <ChevronDown className="w-4 h-4 mr-2" />
        Show Recording Controls
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg">Recording Controls</Label>
        <div className="flex items-center gap-4">
          {settings.isRecording && (
            <span className="text-sm font-medium text-red-500">
              Recording: {duration}s
            </span>
          )}
          <Button 
            variant="ghost" 
            onClick={() => setIsVisible(false)}
            className="h-8"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
            Hide
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {!settings.isRecording ? (
          <Button
            onClick={handleStartRecording}
            className="bg-white hover:bg-gray-50"
          >
            <Video className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            className="bg-white hover:bg-gray-50"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}

        <Button
          className="bg-white hover:bg-gray-50"
          onClick={handleExportSVG}
        >
          <Download className="w-4 h-4 mr-2" />
          Export SVG
        </Button>

        <Button
          className="bg-white hover:bg-gray-50"
          onClick={handleExportPNG}
        >
          <Image className="w-4 h-4 mr-2" />
          Export PNG @3x
        </Button>
      </div>
    </div>
  );
}