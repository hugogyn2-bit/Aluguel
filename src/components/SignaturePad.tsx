"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onChange?: (dataUrl: string | null) => void;
  height?: number;
};

export default function SignaturePad({ onChange, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // melhora qualidade em telas retina
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const newWidth = Math.floor(rect.width);
    const newHeight = height;

    canvas.width = newWidth * dpr;
    canvas.height = newHeight * dpr;

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    const ctx = getCtx();
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // background branco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newWidth, newHeight);

    // estilo do traço
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPosition(e: any) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // mouse
    if (e.clientX !== undefined && e.clientY !== undefined) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    // touch
    const t = e.touches?.[0];
    if (t) {
      return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      };
    }

    return { x: 0, y: 0 };
  }

  function startDraw(e: any) {
    e.preventDefault();
    drawing.current = true;

    const ctx = getCtx();
    if (!ctx) return;

    const { x, y } = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: any) {
    e.preventDefault();
    if (!drawing.current) return;

    const ctx = getCtx();
    if (!ctx) return;

    const { x, y } = getPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasDrawn) setHasDrawn(true);
  }

  function endDraw(e: any) {
    e.preventDefault();
    drawing.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onChange?.(hasDrawn ? dataUrl : null);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getCtx();
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // background branco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    setHasDrawn(false);
    onChange?.(null);
  }

  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <canvas
          ref={canvasRef}
          className="w-full touch-none bg-white"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      <button
        type="button"
        onClick={clear}
        className="mt-2 rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-sm"
      >
        🧽 Limpar assinatura
      </button>
    </div>
  );
}
