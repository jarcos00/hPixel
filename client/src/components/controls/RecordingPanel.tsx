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

    // Create SVG with the same dimensions as the canvas
    const width = canvas.width;
    const height = canvas.height;

    // Generate SVG content based on current canvas state
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gradient-pattern" width="${settings.pixelSize}" height="${settings.pixelSize}" patternUnits="userSpaceOnUse">
            <rect width="${settings.pixelSize - settings.tileSpacing}" height="${settings.pixelSize - settings.tileSpacing}" 
                  fill="${settings.artColor}" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="${settings.backgroundColor}"/>
        <rect width="${width}" height="${height}" fill="url(#gradient-pattern)"/>
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