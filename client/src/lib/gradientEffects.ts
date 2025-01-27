import { GradientSettings } from "@/pages/home";

export function generateGradient(
  ctx: CanvasRenderingContext2D,
  settings: GradientSettings,
  deltaTime: number,
  captureFrame: boolean = false
) {
  const { width, height } = ctx.canvas;
  const { pixelSize, backgroundColor, artColor, effectMode, tileSpacing, effectParams } = settings;

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const time = performance.now() / 1000;
  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);
  const pixelData: { x: number; y: number; opacity: number }[] = [];

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

      if (captureFrame) {
        pixelData.push({ x, y, opacity });
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
  return captureFrame ? pixelData : undefined;
}

export function generateLottieAnimation(frames: { time: number; pixels: { x: number; y: number; opacity: number }[] }[], settings: GradientSettings) {
  const width = 1920;
  const height = 1080;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
      1
    ] : [0, 0, 0, 1];
  };

  const lottieData = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: frames.length,
    w: width,
    h: height,
    nm: "Halliday Gradient",
    ddd: 0,
    assets: [],
    layers: [
      // Background layer
      {
        ty: 1,
        sr: 1,
        ao: 0,
        sw: width,
        sh: height,
        sc: settings.backgroundColor,
        ip: 0,
        op: frames.length,
        st: 0,
        bm: 0,
        ddd: 0
      },
      // Gradient layer
      {
        ty: 4,
        sr: 1,
        ao: 0,
        shapes: [],
        ip: 0,
        op: frames.length,
        st: 0,
        bm: 0,
        ddd: 0
      }
    ]
  };

  // Create rectangles for each pixel position
  const pixelPositions = frames[0].pixels;
  for (const { x, y } of pixelPositions) {
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
        k: hexToRgb(settings.artColor)
      },
      o: {
        a: 1,
        k: frames.map((frame, i) => ({
          t: i,
          s: [frame.pixels.find(p => p.x === x && p.y === y)?.opacity ?? 0 * 100],
          h: 0
        }))
      }
    };

    (lottieData.layers[1].shapes as any[]).push({ it: [rect] });
  }

  return lottieData;
}