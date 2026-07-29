"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Volume2, Volume1, VolumeX, AlertTriangle } from "lucide-react";

const SEGMENTS = 24;

export function VolumeInteraction() {
  const [volume, setVolume] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const animRef = useRef<number>(0);
  const volumeRef = useRef(0);
  const holdingRef = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    if (holdingRef.current) {
      volumeRef.current = Math.min(1, volumeRef.current + 0.004);
    } else {
      volumeRef.current = Math.max(0, volumeRef.current - 0.01);
    }

    setVolume(volumeRef.current);

    // Jitter — exponential ramp
    const intensity = Math.pow(volumeRef.current, 2.8);
    const maxJitter = 6;
    const jitterX = (Math.random() - 0.5) * 2 * maxJitter * intensity;
    const jitterY = (Math.random() - 0.5) * 2 * maxJitter * intensity;

    if (barRef.current) {
      if (volumeRef.current > 0.01) {
        barRef.current.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
      } else {
        barRef.current.style.transform = "translate(0px, 0px)";
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const startHold = useCallback(() => {
    holdingRef.current = true;
    setIsHolding(true);
  }, []);

  const endHold = useCallback(() => {
    holdingRef.current = false;
    setIsHolding(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", endHold);
    window.addEventListener("touchend", endHold);
    return () => {
      window.removeEventListener("mouseup", endHold);
      window.removeEventListener("touchend", endHold);
    };
  }, [endHold]);

  // Color ramp: white → amber → orange → red
  const getSegmentColor = (segIndex: number, v: number) => {
    const segPercent = segIndex / SEGMENTS;
    if (segPercent > v) return "rgba(255, 255, 255, 0.06)";

    if (segPercent < 0.4) return `rgba(255, 255, 255, ${0.6 + segPercent * 0.6})`;
    if (segPercent < 0.65) {
      const t = (segPercent - 0.4) / 0.25;
      return `rgba(255, ${Math.round(230 - t * 60)}, ${Math.round(220 - t * 150)}, 0.9)`;
    }
    if (segPercent < 0.85) {
      const t = (segPercent - 0.65) / 0.2;
      return `rgba(255, ${Math.round(170 - t * 100)}, ${Math.round(70 - t * 40)}, 0.95)`;
    }
    const t = Math.min(1, (segPercent - 0.85) / 0.15);
    return `rgba(255, ${Math.round(70 - t * 40)}, ${Math.round(30 - t * 10)}, 1)`;
  };

  const getSegmentGlow = (segIndex: number, v: number) => {
    const segPercent = segIndex / SEGMENTS;
    if (segPercent > v) return "none";
    if (segPercent < 0.4) return "none";
    if (segPercent < 0.7) return `0 0 6px rgba(255, 180, 50, 0.3)`;
    return `0 0 8px rgba(255, 60, 60, 0.5)`;
  };

  const displayPercent = Math.round(volume * 100);
  const isDanger = volume > 0.8;
  const isWarning = volume > 0.6;

  const VolumeIcon = volume < 0.01 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className="flex items-center justify-center w-full select-none"
      style={{
        backgroundColor: "transparent",
        fontFamily: "'Inter', sans-serif",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%" }}>
          {/* Volume widget container */}
          <div
            className="relative"
            style={{
              backgroundColor: "#080808",
              borderRadius: 18,
              padding: "20px 22px",
              border: isDanger
                ? "1px solid rgba(255, 60, 60, 0.15)"
                : "1px solid #1a1a1a",
              transition: "border-color 0.3s",
            }}
          >
            <div className="flex items-center gap-4">
              {/* Volume icon + label */}
              <div className="flex flex-col items-center gap-1" style={{ width: 36 }}>
                <VolumeIcon
                  size={18}
                  color={
                    isDanger
                      ? "rgba(255, 80, 80, 0.9)"
                      : isWarning
                        ? "rgba(255, 200, 100, 0.8)"
                        : "rgba(255,255,255,0.4)"
                  }
                  style={{ transition: "color 0.3s" }}
                />
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: isDanger
                      ? "rgba(255, 80, 80, 0.8)"
                      : "rgba(255,255,255,0.25)",
                    fontVariantNumeric: "tabular-nums",
                    transition: "color 0.3s",
                  }}
                >
                  {displayPercent}%
                </span>
              </div>

              {/* Segmented bar */}
              <div
                ref={barRef}
                className="flex items-end gap-px flex-1"
                style={{ height: 32 }}
              >
                {Array.from({ length: SEGMENTS }).map((_, i) => {
                  const segPercent = (i + 1) / SEGMENTS;
                  const isActive = segPercent <= volume;
                  const barHeight = 8 + (i / SEGMENTS) * 24;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: barHeight,
                        borderRadius: 1.5,
                        backgroundColor: isActive
                          ? getSegmentColor(i + 1, volume)
                          : "rgba(255, 255, 255, 0.06)",
                        boxShadow: isActive ? getSegmentGlow(i, volume) : "none",
                        transition: isActive ? "none" : "background-color 0.15s",
                      }}
                    />
                  );
                })}
              </div>

              {/* Hold button */}
              <button
                onMouseDown={startHold}
                onTouchStart={startHold}
                className="cursor-pointer flex items-center justify-center shrink-0"
                style={{
                  width: 56,
                  height: 32,
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: isHolding
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(255, 255, 255, 0.06)",
                  color: isHolding
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(255, 255, 255, 0.35)",
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  transition: "all 0.15s",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {isHolding ? "+" : "HOLD"}
              </button>
            </div>

            {/* Hearing warning */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: isDanger ? 40 : 0,
                opacity: isDanger ? 1 : 0,
                transition: "max-height 0.3s ease, opacity 0.3s ease",
                marginTop: isDanger ? 12 : 0,
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 60, 60, 0.08)",
                  border: "1px solid rgba(255, 60, 60, 0.12)",
                }}
              >
                <AlertTriangle
                  size={13}
                  color="rgba(255, 80, 80, 0.8)"
                  style={{
                    animation: isDanger ? "pulse-warn 1s ease-in-out infinite" : "none",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "rgba(255, 80, 80, 0.7)",
                  }}
                >
                  Volume may damage hearing
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Hint */}
        <p
          className="text-center mt-4"
          style={{
            color: "rgba(255,255,255,0.1)",
            fontSize: "0.65rem",
            letterSpacing: "0.05em",
          }}
        >
          Hold the button to increase volume
        </p>
      </div>
    </div>
  );
}
