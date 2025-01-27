import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Video, Download, Square } from "lucide-react";
import { GradientSettings } from "@/pages/home";

interface Props {
  settings: GradientSettings;
  onSettingsChange: (settings: GradientSettings) => void;
}

export default function RecordingPanel({ settings, onSettingsChange }: Props) {
  const [duration, setDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

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
        // Calculate opacity based on current effect mode
        let opacity = 0;
        switch (settings.effectMode) {
          case "wavy":
            opacity = Math.sin(x * 0.2 + y * 0.1 + time) * 0.5 + 0.5;
            break;
          case "orbit":
            const dx = x - cols / 2;
            const dy = y - rows / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            opacity = Math.sin(dist * 0.2 - time) * 0.5 + 0.5;
            break;
          case "chaotic":
            opacity = Math.sin(x * y * 0.01 + time) * 0.5 + 0.5;
            break;
          case "free":
            opacity = Math.random() * 0.5 + 0.25; // Random but biased towards middle values
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

    // Create download link
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halliday-gradient-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg">Recording Controls</Label>
        {settings.isRecording && (
          <span className="text-sm font-medium text-red-500">
            Recording: {duration}s
          </span>
        )}
      </div>

      <div className="flex gap-4">
        {!settings.isRecording ? (
          <Button
            onClick={handleStartRecording}
            className="flex-1"
            variant="outline"
          >
            <Video className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            className="flex-1"
            variant="outline"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}

        <Button
          variant="outline"
          className="flex-1"
          onClick={handleExportSVG}
        >
          <Download className="w-4 h-4 mr-2" />
          Export as SVG
        </Button>
      </div>
    </div>
  );
}