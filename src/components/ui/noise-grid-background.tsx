"use client";

import React, { useEffect, useRef } from "react";
type Offset = { x: number; y: number };

const setHiDPICanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const parent = canvas.parentElement;
  const cw = (parent?.clientWidth ?? window.innerWidth) | 0;
  const ch = (parent?.clientHeight ?? window.innerHeight) | 0;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  canvas.width = Math.floor(cw * dpr);
  canvas.height = Math.floor(ch * dpr);
  canvas.style.width = cw + "px";
  canvas.style.height = ch + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const originFromOffset = (offset: Offset, cell: number) => ({
  x: -((offset.x % cell) + cell) % cell,
  y: -((offset.y % cell) + cell) % cell,
});

const Noise: React.FC<{ refresh?: number; alpha?: number }> = ({ refresh = 3, alpha = 12 }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true });
    if (!ctx) return;

    let f = 0;
    let id = 0;
    const S = 1024;

    const resize = () => {
      c.width = S;
      c.height = S;
      c.style.width = "100vw";
      c.style.height = "100vh";
    };

    const draw = () => {
      const img = ctx.createImageData(S, S);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = alpha;
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = () => {
      if (f % refresh === 0) draw();
      f++;
      id = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    loop();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(id);
    };
  }, [refresh, alpha]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

interface GridProps {
  squareSize: number;
  borderColor: string;
  vignette?: boolean;
  gridOffsetRef: React.MutableRefObject<Offset>;
  className?: string;
}

const MovingGrid: React.FC<GridProps> = ({
  squareSize,
  borderColor,
  vignette = true,
  gridOffsetRef,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const draw = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);

      const origin = originFromOffset(gridOffsetRef.current, squareSize);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      // vertical lines
      for (let x = origin.x; x < cw + squareSize; x += squareSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, ch);
        ctx.stroke();
      }
      // horizontal lines
      for (let y = origin.y; y < ch + squareSize; y += squareSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(cw, y + 0.5);
        ctx.stroke();
      }

      if (vignette) {
        const grad = ctx.createRadialGradient(
          cw / 2,
          ch / 2,
          0,
          cw / 2,
          ch / 2,
          Math.sqrt(cw * cw + ch * ch) / 2
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "#0B0F17");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      raf = requestAnimationFrame(draw);
    };

    const resize = () => setHiDPICanvas(canvas, ctx);
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [squareSize, borderColor, vignette, gridOffsetRef]);

  return <canvas ref={canvasRef} className={`block h-full w-full border-none ${className}`} />;
};

interface HoverProps {
  squareSize: number;
  hoverFillColor: string;
  hoverStrokeColor: string;
  hoverGlowColor: string;
  gridOffsetRef: React.MutableRefObject<Offset>;
  className?: string;
}

const SquaresInteractive: React.FC<HoverProps> = ({
  squareSize,
  hoverFillColor,
  hoverStrokeColor,
  hoverGlowColor,
  gridOffsetRef,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.pointerEvents = "none";
    canvas.style.background = "transparent";

    let raf: number;

    const draw = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);

      if (hoveredRef.current) {
        const { x: gx, y: gy } = hoveredRef.current;
        const origin = originFromOffset(gridOffsetRef.current, squareSize);

        const cellX = origin.x + gx * squareSize;
        const cellY = origin.y + gy * squareSize;

        // glow + fill (Cyber Teal)
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = hoverGlowColor;
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(cellX, cellY, squareSize, squareSize);
        ctx.restore();

        // border
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = hoverStrokeColor;
        ctx.strokeRect(cellX + 0.5, cellY + 0.5, squareSize - 1, squareSize - 1);

        // inner sheen
        const grad = ctx.createLinearGradient(cellX, cellY, cellX, cellY + squareSize);
        grad.addColorStop(0, "rgba(0, 245, 212, 0.15)");
        grad.addColorStop(1, "rgba(0, 245, 212, 0.02)");
        ctx.fillStyle = grad;
        ctx.fillRect(cellX, cellY, squareSize, squareSize);
      }

      raf = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) {
        hoveredRef.current = null;
        return;
      }

      const origin = originFromOffset(gridOffsetRef.current, squareSize);
      const gx = Math.floor((mouseX - origin.x) / squareSize);
      const gy = Math.floor((mouseY - origin.y) / squareSize);
      hoveredRef.current = { x: gx, y: gy };
    };

    const resize = () => {
      setHiDPICanvas(canvas, ctx);
    };

    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [squareSize, hoverFillColor, hoverStrokeColor, hoverGlowColor, gridOffsetRef]);

  return <canvas ref={canvasRef} className={`block h-full w-full border-none pointer-events-none ${className}`} />;
};

type Direction = "right" | "left" | "up" | "down" | "diagonal";

export interface NoiseGridBackgroundProps {
  showGrid?: boolean;
  direction?: Direction;
  speed?: number;
  squareSize?: number;
  borderColor?: string;
  vignette?: boolean;
  hoverFillColor?: string;
  hoverStrokeColor?: string;
  hoverGlowColor?: string;
  className?: string;
}

export function NoiseGridBackground({
  showGrid = true,
  direction = "diagonal",
  speed = 0.35,
  squareSize = 48,
  borderColor = "rgba(31, 41, 61, 0.45)", // #1F293D
  vignette = true,
  hoverFillColor = "rgba(0, 245, 212, 0.06)", // Cyber Teal subtle fill
  hoverStrokeColor = "rgba(0, 245, 212, 0.35)", // Cyber Teal stroke
  hoverGlowColor = "rgba(0, 245, 212, 0.25)", // Cyber Teal glow
  className = "",
}: NoiseGridBackgroundProps) {
  const gridOffsetRef = useRef<Offset>({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const v = Math.max(speed, 0.05);
      const s = squareSize;
      switch (direction) {
        case "right":
          gridOffsetRef.current.x = (gridOffsetRef.current.x - v + s) % s;
          break;
        case "left":
          gridOffsetRef.current.x = (gridOffsetRef.current.x + v + s) % s;
          break;
        case "up":
          gridOffsetRef.current.y = (gridOffsetRef.current.y + v + s) % s;
          break;
        case "down":
          gridOffsetRef.current.y = (gridOffsetRef.current.y - v + s) % s;
          break;
        case "diagonal":
        default:
          gridOffsetRef.current.x = (gridOffsetRef.current.x - v + s) % s;
          gridOffsetRef.current.y = (gridOffsetRef.current.y - v + s) % s;
          break;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [direction, speed, squareSize]);

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0B0F17] ${className}`}>
      {/* Soft Cyber Teal & Deep Navy Radial Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_180px,rgba(0,245,212,0.08),transparent_70%)]" />

      {/* Animated Moving Grid */}
      {showGrid && (
        <div className="absolute inset-0 opacity-80">
          <MovingGrid
            squareSize={squareSize}
            borderColor={borderColor}
            vignette={vignette}
            gridOffsetRef={gridOffsetRef}
          />
        </div>
      )}

      {/* Interactive Cyber Hover Cell (tracks global mousemove) */}
      <div className="absolute inset-0">
        <SquaresInteractive
          squareSize={squareSize}
          hoverFillColor={hoverFillColor}
          hoverStrokeColor={hoverStrokeColor}
          hoverGlowColor={hoverGlowColor}
          gridOffsetRef={gridOffsetRef}
        />
      </div>

      {/* Fine Film Grain Noise */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <Noise refresh={3} alpha={10} />
      </div>

      {/* Bottom Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0F17]/80" />
    </div>
  );
}

export default NoiseGridBackground;
