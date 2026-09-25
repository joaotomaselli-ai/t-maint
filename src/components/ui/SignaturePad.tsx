import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Eraser } from "lucide-react";

type SignaturePadProps = {
  onChange: (dataUrl: string) => void;
  value?: string;
  label: string;
};

export function SignaturePad({ onChange, value, label }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(value));
  const lastLoadedValueRef = useRef<string | undefined>(undefined);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    if (value === lastLoadedValueRef.current) return;
    lastLoadedValueRef.current = value;

    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          if (!canvasRef.current) return;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
          setHasSignature(true);
        };
        img.src = value;
      }
    } else if (!value) {
      clearCanvas();
      setHasSignature(false);
    }
  }, [value, clearCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Configurações do traço
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      lastLoadedValueRef.current = dataUrl;
      onChange(dataUrl);
      setHasSignature(true);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    clearCanvas();
    lastLoadedValueRef.current = "";
    onChange("");
    setHasSignature(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          type="button"
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors flex items-center gap-1.5"
          title="Limpar e apagar assinatura"
        >
          <Eraser className="h-3.5 w-3.5" />
          Limpar
        </Button>
      </div>
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-lg overflow-hidden bg-white touch-none max-w-full relative shadow-sm">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-[150px] cursor-crosshair touch-none bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Assine no quadro acima</span>
        {hasSignature && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Assinatura registrada</span>}
      </div>
    </div>
  );
}
