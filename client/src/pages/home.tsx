import { Card } from "@/components/ui/card";
import GradientCanvas from "@/components/canvas/GradientCanvas";
import ControlPanel from "@/components/controls/ControlPanel";
import RecordingPanel from "@/components/controls/RecordingPanel";
import { useState } from "react";

export type EffectMode = "wavy" | "orbit" | "chaotic" | "free";

export interface GradientSettings {
  effectMode: EffectMode;
  backgroundColor: string;
  artColor: string;
  pixelSize: number;
  tileSpacing: number;
  isRecording: boolean;
}

export default function Home() {
  const [settings, setSettings] = useState<GradientSettings>({
    effectMode: "wavy",
    backgroundColor: "#FFFFFF",
    artColor: "#3DF57B",
    pixelSize: 40,
    tileSpacing: 0,
    isRecording: false
  });

  const handleSettingsChange = (newSettings: GradientSettings) => {
    // Ensure pixel size is always a perfect square
    const perfectSquare = Math.floor(Math.sqrt(newSettings.pixelSize)) ** 2;
    setSettings({
      ...newSettings,
      pixelSize: perfectSquare
    });
  };

  return (
    <div className="min-h-screen w-full p-4 bg-background flex flex-col items-center gap-4">
      <h1 className="text-2xl font-light text-foreground">Halliday Gradient</h1>

      <div className="w-full max-w-6xl flex flex-col gap-4">
        <Card className="p-4">
          <div className="aspect-video w-full">
            <GradientCanvas settings={settings} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <RecordingPanel settings={settings} onSettingsChange={handleSettingsChange} />
            <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />
          </div>
        </Card>
      </div>
    </div>
  );
}