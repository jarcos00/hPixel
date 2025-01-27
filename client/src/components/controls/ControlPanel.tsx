import { EffectMode, GradientSettings } from "@/pages/home";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  settings: GradientSettings;
  onSettingsChange: (settings: GradientSettings) => void;
}

export default function ControlPanel({ settings, onSettingsChange }: Props) {
  const handleEffectChange = (value: string) => {
    onSettingsChange({
      ...settings,
      effectMode: value as EffectMode
    });
  };

  const handlePixelSizeChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      pixelSize: value[0]
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Effect Mode</Label>
        <RadioGroup
          value={settings.effectMode}
          onValueChange={handleEffectChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wavy" id="wavy" />
            <Label htmlFor="wavy">Wavy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="orbit" id="orbit" />
            <Label htmlFor="orbit">Orbit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="chaotic" id="chaotic" />
            <Label htmlFor="chaotic">Chaotic</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Free</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Background Color</Label>
        <Input
          type="color"
          value={settings.backgroundColor}
          onChange={(e) => onSettingsChange({
            ...settings,
            backgroundColor: e.target.value
          })}
          className="w-full h-10"
        />
      </div>

      <div className="space-y-2">
        <Label>Art Color</Label>
        <Input
          type="color"
          value={settings.artColor}
          onChange={(e) => onSettingsChange({
            ...settings,
            artColor: e.target.value
          })}
          className="w-full h-10"
        />
      </div>

      <div className="space-y-2">
        <Label>Pixel Size ({settings.pixelSize}px)</Label>
        <Slider
          value={[settings.pixelSize]}
          onValueChange={handlePixelSizeChange}
          min={5}
          max={50}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}
