import { EffectMode, GradientSettings } from "@/pages/home";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  settings: GradientSettings;
  onSettingsChange: (settings: GradientSettings) => void;
}

export default function ControlPanel({ settings, onSettingsChange }: Props) {
  const [debouncedSize, setDebouncedSize] = useState(settings.pixelSize);
  const [debouncedSpacing, setDebouncedSpacing] = useState(settings.tileSpacing);

  const handleEffectChange = (value: string) => {
    onSettingsChange({
      ...settings,
      effectMode: value as EffectMode
    });
  };

  const handleEffectParamChange = (param: keyof GradientSettings['effectParams'], value: number[]) => {
    onSettingsChange({
      ...settings,
      effectParams: {
        ...settings.effectParams,
        [param]: value[0]
      }
    });
  };

  // Debounced handlers for pixel size and spacing
  const handlePixelSizeChange = useCallback((value: number[]) => {
    setDebouncedSize(value[0]);
    const timeoutId = setTimeout(() => {
      onSettingsChange({
        ...settings,
        pixelSize: value[0]
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [settings, onSettingsChange]);

  const handleSpacingChange = useCallback((value: number[]) => {
    setDebouncedSpacing(value[0]);
    const timeoutId = setTimeout(() => {
      onSettingsChange({
        ...settings,
        tileSpacing: value[0]
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [settings, onSettingsChange]);

  const handleColorChange = (type: 'backgroundColor' | 'artColor', value: string) => {
    const colorValue = value.replace('#', '');
    if (/^[0-9A-Fa-f]{0,6}$/.test(colorValue)) {
      onSettingsChange({
        ...settings,
        [type]: '#' + colorValue
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Controls</h2>

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
              <RadioGroupItem value="hectic" id="hectic" />
              <Label htmlFor="hectic">Hectic</Label>
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
            <Label>Pixel Size ({debouncedSize}px)</Label>
            <Slider
              value={[debouncedSize]}
              onValueChange={handlePixelSizeChange}
              min={5}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Tile Spacing ({debouncedSpacing}px)</Label>
            <Slider
              value={[debouncedSpacing]}
              onValueChange={handleSpacingChange}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="effect-params">
          <AccordionTrigger className="text-gray-800">Effect Parameters</AccordionTrigger>
          <AccordionContent>
            {settings.effectMode === "wavy" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Wave Frequency ({settings.effectParams.frequency.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.frequency]}
                    onValueChange={(v) => handleEffectParamChange('frequency', v)}
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wave Amplitude ({settings.effectParams.amplitude.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.amplitude]}
                    onValueChange={(v) => handleEffectParamChange('amplitude', v)}
                    min={0.1}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {settings.effectMode === "orbit" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Orbit Radius ({settings.effectParams.radius.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.radius]}
                    onValueChange={(v) => handleEffectParamChange('radius', v)}
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Orbit Speed ({settings.effectParams.orbitSpeed.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.orbitSpeed]}
                    onValueChange={(v) => handleEffectParamChange('orbitSpeed', v)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {settings.effectMode === "hectic" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Intensity ({settings.effectParams.intensity.toFixed(3)})</Label>
                  <Slider
                    value={[settings.effectParams.intensity]}
                    onValueChange={(v) => handleEffectParamChange('intensity', v)}
                    min={0.001}
                    max={0.05}
                    step={0.001}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Speed ({settings.effectParams.hecticSpeed.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.hecticSpeed]}
                    onValueChange={(v) => handleEffectParamChange('hecticSpeed', v)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {settings.effectMode === "free" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fluidity ({settings.effectParams.fluidity.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.fluidity]}
                    onValueChange={(v) => handleEffectParamChange('fluidity', v)}
                    min={0.1}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complexity ({settings.effectParams.complexity.toFixed(2)})</Label>
                  <Slider
                    value={[settings.effectParams.complexity]}
                    onValueChange={(v) => handleEffectParamChange('complexity', v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}