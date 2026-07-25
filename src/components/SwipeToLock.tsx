"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LOCK_THRESHOLD = 0.85;
const HANDLE_PX = 44;
const RESET_DELAY_MS = 1300;

export default function SwipeToLock() {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const usable = rect.width - HANDLE_PX;
    if (usable <= 0) return;
    const raw = (clientX - rect.left - HANDLE_PX / 2) / usable;
    setProgress(Math.min(1, Math.max(0, raw)));
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => updateFromClientX(e.clientX);
    const onUp = () => {
      draggingRef.current = false;
      setDragging(false);
      setProgress((p) => {
        if (p >= LOCK_THRESHOLD) {
          setLocked(true);
          window.setTimeout(() => {
            setLocked(false);
            setProgress(0);
          }, RESET_DELAY_MS);
          return 1;
        }
        return 0;
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, updateFromClientX]);

  return (
    <div>
      <div
        ref={trackRef}
        className="relative h-[52px] w-full select-none overflow-hidden rounded-full border border-white/5 bg-[#0d0d0a]"
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4a5518]/70 via-[#3a4514]/30 to-transparent"
          style={{
            width: `calc((100% - ${HANDLE_PX}px) * ${progress} + ${HANDLE_PX}px)`,
            transition: dragging ? "none" : "width 300ms ease",
          }}
        />
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center pl-9 font-mono text-sm transition-colors ${
            locked ? "text-[#e6ffb0]" : "text-[#c9f24d]"
          }`}
        >
          {locked ? "Locked" : "Swipe to lock"}
        </span>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Swipe to lock"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          onPointerDown={(e) => {
            draggingRef.current = true;
            setDragging(true);
            updateFromClientX(e.clientX);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setProgress((p) => Math.min(1, p + 0.1));
            if (e.key === "ArrowLeft") setProgress((p) => Math.max(0, p - 0.1));
          }}
          className={`absolute top-1 grid h-11 w-11 cursor-grab touch-none place-items-center rounded-full border active:cursor-grabbing ${
            locked
              ? "border-[#c9f24d] bg-[#c9f24d]"
              : "border-[#c9f24d]/60 bg-[#151510]"
          } shadow-[0_0_10px_rgba(201,242,77,0.35)]`}
          style={{
            left: `calc((100% - ${HANDLE_PX}px) * ${progress})`,
            transition: dragging ? "none" : "left 300ms ease",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className={locked ? "text-[#0a0a09]" : "text-[#c9f24d]"}
          >
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center font-mono text-[9px] uppercase tracking-wider text-[#55554e]">
        <span
          className={`h-1 w-1 rounded-full transition-colors ${
            locked ? "bg-[#c9f24d]" : "bg-[#55554e]"
          }`}
        />
        {locked ? "Locked" : "Drag handle to lock"}
      </p>
    </div>
  );
}
