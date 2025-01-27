import { Card } from "@/components/ui/card";
import GradientCanvas from "@/components/canvas/GradientCanvas";
import ControlPanel from "@/components/controls/ControlPanel";
import RecordingPanel from "@/components/controls/RecordingPanel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
  const [isControlsVisible, setIsControlsVisible] = useState(true);
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
          {!isControlsVisible ? (
            <Button 
              className="w-full py-2 bg-white hover:bg-gray-100 text-gray-800"
              onClick={() => setIsControlsVisible(true)}
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Controls
            </Button>
          ) : (
            <Card className="p-6" style={{ background: '#FFF !important', border: 'none !important', borderRadius: '12px' }}>
              <div className="flex justify-end mb-4">
                <Button 
                  className="bg-white hover:bg-gray-100 text-gray-800"
                  onClick={() => setIsControlsVisible(false)}
                >
                  <ChevronDown className="w-4 h-4 rotate-180 mr-2" />
                  Hide Controls
                </Button>
              </div>
              <div className="flex flex-col gap-6">
                <RecordingPanel settings={settings} onSettingsChange={handleSettingsChange} />
                <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}