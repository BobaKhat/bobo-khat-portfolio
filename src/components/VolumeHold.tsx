"use client";

import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 20;
const RISE_MS = 2200;

// Deterministic, slightly irregular bar heights (%) for the idle "waveform" look.
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) =>
  Math.round(22 + Math.abs(Math.sin(i * 1.35)) * 62)
);

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8f8f87]">
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        fill="currentColor"
      />
      {muted ? (
        <path
          d="M16 9l5 6M21 9l-5 6"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M16.5 8.5a5 5 0 010 7"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

export default function VolumeHold() {
  const [percent, setPercent] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const percentRef = useRef(0);

  useEffect(() => {
    percentRef.current = percent;
  }, [percent]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startHold = () => {
    if (holdingRef.current || percentRef.current >= 100) return;
    holdingRef.current = true;
    setHolding(true);
    const begin = performance.now();
    const startPercent = percentRef.current;
    const step = (now: number) => {
      if (!holdingRef.current) return;
      const elapsed = now - begin;
      const remaining = 100 - startPercent;
      const next = Math.min(100, startPercent + (elapsed / RISE_MS) * remaining);
      setPercent(next);
      if (next < 100) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        holdingRef.current = false;
        setHolding(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stopHold = () => {
    holdingRef.current = false;
    setHolding(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  };

  const rounded = Math.round(percent);
  const litBars = Math.round((percent / 100) * BAR_COUNT);

  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#111110] p-4">
      <div className="flex shrink-0 flex-col items-start gap-1">
        <SpeakerIcon muted={rounded === 0} />
        <span className="font-mono text-[11px] text-[#c9c9c0]">{rounded}%</span>
      </div>

      <div className="flex h-9 flex-1 items-end gap-[3px]">
        {BAR_HEIGHTS.map((h, i) => {
          const lit = i < litBars;
          return (
            <span
              key={i}
              className={`min-w-0 flex-1 rounded-full transition-colors duration-150 ${
                lit ? "bg-[#c9f24d]" : "bg-[#2a2a25]"
              }`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>

      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        className={`shrink-0 touch-none rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
          holding
            ? "border-[#c9f24d] bg-[#c9f24d]/10 text-[#c9f24d]"
            : "border-white/10 bg-[#1a1a17] text-[#8f8f87]"
        }`}
      >
        Hold
      </button>
    </div>
  );
}
