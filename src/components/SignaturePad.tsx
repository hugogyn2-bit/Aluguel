"use client";

import { useEffect, useRef, useState } from "react";

type SignaturePadProps = {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
};

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function getCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas;
  }

  function clear() {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  function drawStart(x: number, y: number) {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function drawLine(x: number, y: number) {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function getPointFromEvent(e: any) {
    const canvas = getCanvas();
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function handleDown(e: any) {
    e.preventDefault();
    const p = getPointFromEvent(e);
    if (!p) return;

    setIsDrawing(true);
    drawStart(p.x, p.y);
  }

  function handleMove(e: any) {
    e.preventDefault();
    if (!isDrawing) return;

    const p = getPointFromEvent(e);
    if (!p) return;

    drawLine(p.x, p.y);
  }

  function handleUp(e: any) {
    e.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);

    const canvas = getCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
  }

  // se já tiver assinatura salva, desenha no canvas
  useEffect(() => {
    if (!value) return;
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = value;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [value]);

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="w-full bg-white rounded-xl"
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={clear}
          className="rounded-xl px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-white"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
