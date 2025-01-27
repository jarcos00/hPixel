import { Card } from "@/components/ui/card";
import GradientCanvas from "@/components/canvas/GradientCanvas";
import ControlPanel from "@/components/controls/ControlPanel";
import RecordingPanel from "@/components/controls/RecordingPanel";
import { useState } from "react";

export type EffectMode = "wavy" | "orbit" | "hectic" | "free";

export interface EffectParams {
  // Wavy parameters
  frequency: number;
  amplitude: number;
  // Orbit parameters
  radius: number;
  orbitSpeed: number;
  // Hectic parameters
  intensity: number;
  hecticSpeed: number;
  // Free parameters
  fluidity: number;
  complexity: number;
}

export interface GradientSettings {
  effectMode: EffectMode;
  backgroundColor: string;
  artColor: string;
  pixelSize: number;
  tileSpacing: number;
  isRecording: boolean;
  effectParams: EffectParams;
}

export default function Home() {
  const [settings, setSettings] = useState<GradientSettings>({
    effectMode: "wavy",
    backgroundColor: "#FFFFFF",
    artColor: "#3DF57B",
    pixelSize: 40,
    tileSpacing: 0,
    isRecording: false,
    effectParams: {
      // Wavy default params
      frequency: 0.2,
      amplitude: 0.5,
      // Orbit default params
      radius: 0.2,
      orbitSpeed: 1,
      // Hectic default params
      intensity: 0.01,
      hecticSpeed: 1,
      // Free default params
      fluidity: 0.5,
      complexity: 0.3
    }
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
    <div className="min-h-screen w-full bg-background">
      {/* Full screen canvas */}
      <div className="fixed inset-0">
        <GradientCanvas settings={settings} />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen w-full p-4 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-light text-foreground">Halliday Gradient</h1>

        <div className="mt-auto w-full max-w-6xl">
          <Card className="p-6 bg-background/80 backdrop-blur">
            <div className="flex flex-col gap-6">
              <RecordingPanel settings={settings} onSettingsChange={handleSettingsChange} />
              <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}