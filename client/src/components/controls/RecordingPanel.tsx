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
          onClick={() => {
            // SVG export logic will be added here
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export as SVG
        </Button>
      </div>
    </div>
  );
}
