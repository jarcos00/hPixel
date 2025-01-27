import { GradientSettings } from "@/pages/home";

export function generateGradient(
  ctx: CanvasRenderingContext2D,
  settings: GradientSettings,
  deltaTime: number
) {
  const { width, height } = ctx.canvas;
  const { pixelSize, backgroundColor, artColor, effectMode, tileSpacing, effectParams } = settings;

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const time = performance.now() / 1000;
  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);

  ctx.fillStyle = artColor;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let opacity = 0;
      const abstractionNoise = Math.sin(x * y * effectParams.abstraction) * 0.5 + 0.5;

      switch (effectMode) {
        case "wavy":
          opacity = Math.sin(
            x * effectParams.frequency + 
            y * (effectParams.frequency * 0.5) + 
            time * effectParams.amplitude
          ) * 0.5 + 0.5;
          break;
        case "orbit":
          const dx = x - cols / 2;
          const dy = y - rows / 2;
          const dist = Math.sqrt(dx * dx + dy * dy) * effectParams.radius;
          opacity = Math.sin(dist - time * effectParams.orbitSpeed) * 0.5 + 0.5;
          break;
        case "hectic":
          opacity = Math.sin(
            x * y * effectParams.intensity + 
            time * effectParams.hecticSpeed
          ) * 0.5 + 0.5;
          break;
      }

      opacity = opacity * (1 - effectParams.abstraction) + abstractionNoise * effectParams.abstraction;

      ctx.globalAlpha = opacity;
      ctx.fillRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize - tileSpacing,
        pixelSize - tileSpacing
      );
    }
  }

  ctx.globalAlpha = 1;
}