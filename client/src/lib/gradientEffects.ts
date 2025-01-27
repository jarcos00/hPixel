import { GradientSettings } from "@/pages/home";

export function generateGradient(
  ctx: CanvasRenderingContext2D,
  settings: GradientSettings,
  deltaTime: number
) {
  const { width, height } = ctx.canvas;
  const { pixelSize, backgroundColor, artColor, effectMode, tileSpacing } = settings;

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const time = performance.now() / 1000;
  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);

  ctx.fillStyle = artColor;

  // Random values for free mode
  const randomValues = new Float32Array(cols * rows);
  if (effectMode === "free") {
    for (let i = 0; i < randomValues.length; i++) {
      randomValues[i] = Math.random() * 2 * Math.PI;
    }
  }

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let opacity = 0;

      switch (effectMode) {
        case "wavy":
          opacity = Math.sin(x * 0.2 + y * 0.1 + time) * 0.5 + 0.5;
          break;
        case "orbit":
          const dx = x - cols / 2;
          const dy = y - rows / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          opacity = Math.sin(dist * 0.2 - time) * 0.5 + 0.5;
          break;
        case "chaotic":
          opacity = Math.sin(x * y * 0.01 + time) * 0.5 + 0.5;
          break;
        case "free":
          // More random and dynamic free mode
          const randIndex = y * cols + x;
          const randPhase = randomValues[randIndex];
          opacity = Math.sin(
            time + randPhase + 
            Math.sin(time * 0.5) * x * 0.1 + 
            Math.cos(time * 0.3) * y * 0.1
          ) * 0.5 + 0.5;
          break;
      }

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