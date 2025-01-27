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

  const handleSpacingChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      tileSpacing: value[0]
    });
  };

  const handleColorChange = (type: 'backgroundColor' | 'artColor', value: string) => {
    // Remove # if present for validation
    const colorValue = value.replace('#', '');

    // Only update if it's a valid hex color or empty
    if (/^[0-9A-Fa-f]{0,6}$/.test(colorValue)) {
      onSettingsChange({
        ...settings,
        [type]: '#' + colorValue
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label>Effect Mode</Label>
        <RadioGroup
          value={settings.effectMode}
          onValueChange={handleEffectChange}
          className="flex flex-row md:flex-col space-x-4 md:space-x-0 md:space-y-2"
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onSettingsChange({
                ...settings,
                backgroundColor: e.target.value
              })}
              className="w-14 h-10 p-1"
            />
            <Input
              type="text"
              value={settings.backgroundColor.replace('#', '')}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              placeholder="FFFFFF"
              maxLength={6}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Art Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.artColor}
              onChange={(e) => onSettingsChange({
                ...settings,
                artColor: e.target.value
              })}
              className="w-14 h-10 p-1"
            />
            <Input
              type="text"
              value={settings.artColor.replace('#', '')}
              onChange={(e) => handleColorChange('artColor', e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
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

        <div className="space-y-2">
          <Label>Tile Spacing ({settings.tileSpacing}px)</Label>
          <Slider
            value={[settings.tileSpacing]}
            onValueChange={handleSpacingChange}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}