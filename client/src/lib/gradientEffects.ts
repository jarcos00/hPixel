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

      // Apply abstraction effect
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

export function exportLottie(settings: GradientSettings) {
  const width = 1920;
  const height = 1080;
  const cols = Math.ceil(width / settings.pixelSize);
  const rows = Math.ceil(height / settings.pixelSize);
  const frameCount = 60; // 1 second animation at 60fps

  // Create Lottie animation data structure
  const lottieData = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: frameCount,
    w: width,
    h: height,
    nm: "Halliday Gradient",
    ddd: 0,
    assets: [],
    layers: [{
      ty: 4,
      sr: 1,
      ao: 0,
      shapes: [],
      ip: 0,
      op: frameCount,
      st: 0,
      bm: 0,
      ddd: 0
    }]
  };

  // Add rectangles for each pixel
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const rect = {
        ty: "rc",
        d: 1,
        p: {
          a: 0,
          k: [
            x * settings.pixelSize + settings.pixelSize / 2,
            y * settings.pixelSize + settings.pixelSize / 2,
            settings.pixelSize - settings.tileSpacing,
            settings.pixelSize - settings.tileSpacing
          ]
        },
        nm: `pixel_${x}_${y}`,
        s: {
          a: 0,
          k: settings.artColor
        },
        o: {
          a: 1,
          k: generateOpacityKeyframes(x, y, settings, frameCount)
        }
      };

      (lottieData.layers[0].shapes as any[]).push({ it: [rect] });
    }
  }

  return lottieData;
}

function generateOpacityKeyframes(x: number, y: number, settings: GradientSettings, frameCount: number) {
  const keyframes = [];
  const { effectMode, effectParams } = settings;

  for (let frame = 0; frame < frameCount; frame++) {
    const time = frame / 60; // Convert frame to seconds
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
        const dx = x - 1920 / (2 * settings.pixelSize);
        const dy = y - 1080 / (2 * settings.pixelSize);
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

    keyframes.push({
      t: frame,
      s: [opacity * 100],
      h: 1
    });
  }

  return keyframes;
}