"use client";

import { useEffect, useRef } from "react";

/*
  Ground ripple for the hero's "Interaction" cursor. A fixed full-viewport
  canvas drawn just above the CSS .dot-grid (but behind content). On a
  `ground-ripple` window event it plays a CONTAINED 3D ripple centred on the
  cursor: a travelling wave packet (a few concentric rings) where each grid dot
  rises (pushed out + larger + darker) on a crest and sinks (pulled in +
  smaller + fainter) in a trough — reading as a rippling surface. Dots are
  theme-coloured (black in light mode, white in dark). The faint CSS grid shows
  through underneath, so there's no flash.

  Decoupled from the cursor via a CustomEvent so nothing is lifted into the
  (server-rendered) page.
*/

const SPACING = 24; // matches .dot-grid background-size
const DURATION = 1000;
const MAX_R = 190; // how far the ripple reaches (contained near the cursor)
const PACKET = 42; // width of the raised ring (px)
const DISP = 14; // max radial displacement (px)
const BASE_R = 1.0; // resting dot radius

export default function GroundRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      // A canvas is a replaced element — pin its CSS size to the viewport so
      // drawing coordinates map 1:1 to page coordinates (inset-0 alone would
      // scale by the buffer size).
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const run = (cx: number, cy: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      const rgb = isDark ? "255, 255, 255" : "0, 0, 0";

      // Grid origin matches .dot-grid's background-position: center.
      const ox = (vw / 2) % SPACING;
      const oy = (vh / 2) % SPACING;
      const start = performance.now();

      const frame = (now: number) => {
        const t = (now - start) / DURATION;
        ctx.clearRect(0, 0, vw, vh);
        if (t >= 1) {
          rafRef.current = null;
          return;
        }

        // Ease-out expansion (ring loses energy as it travels).
        const waveR = (1 - (1 - t) * (1 - t)) * MAX_R;
        const timeFade = t < 0.75 ? 1 : (1 - t) / 0.25;

        // Only iterate dots inside the reached region + a small margin.
        const reach = Math.min(MAX_R + PACKET, waveR + 3 * PACKET);
        const x0 = Math.max(ox, cx - reach);
        const x1 = Math.min(vw, cx + reach);
        const y0 = Math.max(oy, cy - reach);
        const y1 = Math.min(vh, cy + reach);
        const sx = ox + Math.ceil((x0 - ox) / SPACING) * SPACING;
        const sy = oy + Math.ceil((y0 - oy) / SPACING) * SPACING;

        for (let gx = sx; gx <= x1; gx += SPACING) {
          for (let gy = sy; gy <= y1; gy += SPACING) {
            const ddx = gx - cx;
            const ddy = gy - cy;
            const d = Math.hypot(ddx, ddy);
            if (d > MAX_R + PACKET) continue;

            const off = d - waveR;
            const env = Math.exp(-(off * off) / (2 * PACKET * PACKET));
            if (env < 0.02) continue;

            // Raised ring: height in [0,1], faded toward the contained edge
            // and the end of the animation. Dots on the ring rise — pushed
            // outward, larger and darker — reading as a 3D crest.
            const contain = Math.max(0, 1 - d / MAX_R);
            const h = env * contain * timeFade;
            if (h < 0.02) continue;

            const nx = d > 0.001 ? ddx / d : 0;
            const ny = d > 0.001 ? ddy / d : 0;
            const push = h * DISP;
            const px = gx + nx * push;
            const py = gy + ny * push;

            const r = BASE_R * (1 + h * 2.6);
            const a = Math.min(0.9, h * 1.05);
            if (a < 0.02) continue;

            ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        rafRef.current = requestAnimationFrame(frame);
      };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(frame);
    };

    const onRipple = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      run(x, y);
    };
    window.addEventListener("ground-ripple", onRipple as EventListener);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("ground-ripple", onRipple as EventListener);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -5 }}
    />
  );
}
