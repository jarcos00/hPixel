import { Card } from "@/components/ui/card";
import GradientCanvas from "@/components/canvas/GradientCanvas";
import ControlPanel from "@/components/controls/ControlPanel";
import { useState } from "react";

export type EffectMode = "wavy" | "orbit" | "chaotic" | "free";

export interface GradientSettings {
  effectMode: EffectMode;
  backgroundColor: string;
  artColor: string;
  pixelSize: number;
}

export default function Home() {
  const [settings, setSettings] = useState<GradientSettings>({
    effectMode: "wavy",
    backgroundColor: "#ffffff",
    artColor: "#000000",
    pixelSize: 20
  });

  return (
    <div className="min-h-screen w-full p-4 bg-background flex flex-col items-center gap-4">
      <h1 className="text-2xl font-light text-foreground">Pixel Gradient Generator</h1>
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
        <Card className="flex-1 p-4 aspect-square">
          <GradientCanvas settings={settings} />
        </Card>
        
        <Card className="md:w-80 p-4">
          <ControlPanel settings={settings} onSettingsChange={setSettings} />
        </Card>
      </div>
    </div>
  );
}
