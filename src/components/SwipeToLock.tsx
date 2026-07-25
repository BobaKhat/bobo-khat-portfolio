"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";

const TRACK_WIDTH = 300;
const HANDLE_SIZE = 65;
const TRACK_HEIGHT = 85;
const PADDING = 10;
const MAX_DRAG = TRACK_WIDTH - HANDLE_SIZE - PADDING * 2;
const LOCK_THRESHOLD = MAX_DRAG * 0.65;

// ── Math helpers ──

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
function invLerp(a: number, b: number, v: number) {
  return a === b ? 0 : (v - a) / (b - a);
}
function mapRange(
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  value: number
) {
  return lerp(outMin, outMax, Math.max(0, Math.min(1, invLerp(inMin, inMax, value))));
}
function lerpColor(
  r1: number, g1: number, b1: number, a1: number,
  r2: number, g2: number, b2: number, a2: number,
  t: number
) {
  return `rgba(${lerp(r1, r2, t)},${lerp(g1, g2, t)},${lerp(b1, b2, t)},${lerp(a1, a2, t)})`;
}

// ── Spring physics with sub-stepping for stability ──

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  onComplete?: () => void;
}

function useSpringValue(initial: number) {
  const ref = useRef(initial);
  const velRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const [val, setVal] = useState(initial);

  const set = useCallback((v: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    velRef.current = 0;
    prevTimeRef.current = null;
    ref.current = v;
    setVal(v);
  }, []);

  const animateTo = useCallback(
    (target: number, { stiffness = 400, damping = 25, mass = 1, onComplete }: SpringConfig = {}) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      let current = ref.current;
      let velocity = velRef.current;
      prevTimeRef.current = null;

      const SUB_STEPS = 8;
      const FIXED_DT = 1 / 60;
      const subDt = FIXED_DT / SUB_STEPS;

      const tick = (now: number) => {
        const prev = prevTimeRef.current ?? now;
        prevTimeRef.current = now;
        const frameDt = Math.min((now - prev) / 1000, 0.032);
        const steps = Math.max(1, Math.round(frameDt / subDt));
        const actualSubDt = frameDt / steps;

        for (let i = 0; i < steps; i++) {
          const springForce = -stiffness * (current - target);
          const dampForce = -damping * velocity;
          const accel = (springForce + dampForce) / mass;
          velocity += accel * actualSubDt;
          current += velocity * actualSubDt;
        }

        if (Math.abs(current - target) < 0.15 && Math.abs(velocity) < 0.15) {
          current = target;
          velocity = 0;
          ref.current = target;
          velRef.current = 0;
          setVal(target);
          prevTimeRef.current = null;
          onComplete?.();
          return;
        }

        ref.current = current;
        velRef.current = velocity;
        setVal(current);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  return { value: val, ref, set, animateTo };
}

// ── SVGs ──

function ChevronIcon() {
  return (
    <svg width="22" height="40" viewBox="0 0 46 80" fill="none" style={{ position: "absolute" }}>
      <path
        clipRule="evenodd"
        d="M44.171 44.4437L8.83296 80L0 71.1125L30.9216 40L0 8.88749L8.83296 0L44.171 35.5563C45.3421 36.7349 46 38.3333 46 40C46 41.6666 45.3421 43.2651 44.171 44.4437Z"
        fill="#B4E85A"
        fillRule="evenodd"
      />
    </svg>
  );
}

// ── Animated lock with shackle ──

function AnimatedLockIcon({ isLocked, opacity }: { isLocked: boolean; opacity: number }) {
  const [bounceKey, setBounceKey] = useState(0);

  useEffect(() => {
    if (isLocked) setBounceKey((k) => k + 1);
  }, [isLocked]);

  const shackleOrigin = "32px 24.5px";

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* Impact glow */}
      {isLocked && (
        <div
          key={`glow-${bounceKey}`}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(199,255,103,0.4) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "lockGlow 0.6s ease-out 0.15s forwards",
            opacity: 0,
          }}
        />
      )}

      <svg
        key={`lock-${bounceKey}`}
        width="28"
        height="36"
        viewBox="0 0 56 70"
        fill="none"
        style={{
          overflow: "visible",
          animation: isLocked ? "lockBounce 0.6s ease-out 0.1s both" : "none",
        }}
      >
        {/* Lock body */}
        <rect x="0" y="24.5" width="56" height="45.5" rx="7" fill="#C7FF67" />
        {/* Keyhole */}
        <circle cx="28" cy="44" r="6" fill="#1a1a0a" />
        <rect x="25" y="44" width="6" height="12" rx="2" fill="#1a1a0a" />
        {/* Shackle — uses absolute SVG coords for transform-origin */}
        <path
          d="M17.5 24.5V17.5C17.5 11.725 22.225 7 28 7C33.775 7 38.5 11.725 38.5 17.5V24.5"
          stroke="#C7FF67"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          style={{
            transformOrigin: shackleOrigin,
            transform: isLocked
              ? "translateY(0px) rotate(0deg)"
              : "translateY(-18px) rotate(35deg)",
            transition: "transform 0.45s cubic-bezier(0.2, 1.6, 0.4, 1)",
          }}
        />
      </svg>
    </div>
  );
}

// ── Main component ──

export default function SwipeToLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shimmerFading, setShimmerFading] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const x = useSpringValue(0);
  const dragOrigin = useRef({ clientX: 0, startPos: 0 });
  const posRef = useRef(0);

  const pos = x.value;
  const progress = MAX_DRAG > 0 ? pos / MAX_DRAG : 0;

  // ── Derived motion values ──

  const chevronOpacity = mapRange(MAX_DRAG * 0.85, MAX_DRAG * 0.9, 1, 0, pos);
  const lockIconOpacity = mapRange(MAX_DRAG * 0.9, MAX_DRAG * 0.95, 0, 1, pos);
  const textOpacity = mapRange(0, MAX_DRAG * 0.4, 1, 0, pos);
  const handleGlassOpacity = mapRange(0, MAX_DRAG * 0.3, 0, 1, pos);

  const trackBg = lerpColor(180, 232, 90, 0.15, 180, 232, 90, 0.05, progress);

  const handleBg = useMemo(() => {
    if (progress <= 0.4) {
      return lerpColor(0, 0, 0, 1, 180, 232, 90, 0.12, progress / 0.4);
    }
    return lerpColor(180, 232, 90, 0.12, 180, 232, 90, 0.15, (progress - 0.4) / 0.6);
  }, [progress]);

  const handleGlow = useMemo(() => {
    const r = lerp(0, 180, progress);
    const g = lerp(0, 232, progress);
    const b = lerp(0, 90, progress);
    const a = lerp(0.8, 0.3, progress);
    return `0 0 15px 3px rgba(${r},${g},${b},${a})`;
  }, [progress]);

  // ── Drag handlers ──

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) return;
    e.preventDefault();
    dragOrigin.current = { clientX: e.clientX, startPos: x.ref.current };
    posRef.current = x.ref.current;
    setIsDragging(true);
  };

  const handleOverlayMove = (e: React.PointerEvent) => {
    const dx = e.clientX - dragOrigin.current.clientX;
    const raw = dragOrigin.current.startPos + dx;
    const clamped = Math.max(0, Math.min(MAX_DRAG, raw));
    const elastic =
      raw > MAX_DRAG
        ? MAX_DRAG + (raw - MAX_DRAG) * 0.05
        : raw < 0
          ? raw * 0.05
          : clamped;
    posRef.current = elastic;
    x.set(elastic);
  };

  const handleOverlayUp = () => {
    const current = posRef.current;
    setIsDragging(false);

    if (current >= LOCK_THRESHOLD) {
      setIsLocked(true);
      setShimmerFading(true);
      setPulseKey((k) => k + 1);
      x.animateTo(MAX_DRAG, { stiffness: 400, damping: 25 });
    } else {
      x.animateTo(0, { stiffness: 500, damping: 30 });
    }
  };

  const handleReset = () => {
    if (!isLocked) return;
    setIsLocked(false);
    setShimmerFading(false);
    x.animateTo(0, { stiffness: 400, damping: 25 });
  };

  const tapScale = isDragging && !isLocked ? 0.95 : 1;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes lockGlow {
          0%   { transform: scale(0); opacity: 0; }
          40%  { transform: scale(2.2); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes lockBounce {
          0%   { transform: scale(1) rotate(0deg); }
          25%  { transform: scale(1.35) rotate(-3deg); }
          45%  { transform: scale(0.9) rotate(3deg); }
          70%  { transform: scale(1.1) rotate(-1.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Full-screen drag overlay — captures all pointer events during drag */}
      {isDragging && (
        <div
          onPointerMove={handleOverlayMove}
          onPointerUp={handleOverlayUp}
          onPointerCancel={handleOverlayUp}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            cursor: "grabbing",
            touchAction: "none",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "100%",
          fontFamily: "'Inter', sans-serif",
          gap: 20,
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        }}
      >
        {/* ═══ Track ═══ */}
        <div style={{ position: "relative", width: TRACK_WIDTH, height: TRACK_HEIGHT, maxWidth: "95vw" }}>
          {/* Track background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 100,
              backgroundColor: trackBg,
              overflow: "hidden",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: isLocked ? "rgba(180,232,90,0.25)" : "rgba(180,232,90,0)",
              transition: "border-color 0.4s ease",
            }}
          >
            {/* Shimmer — always mounted, fades via opacity */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(180,232,90,0.08) 50%, transparent 100%)",
                animation: "shimmer 2.5s ease-in-out infinite",
                animationDelay: "1s",
                opacity: shimmerFading ? 0 : 1,
                transition: "opacity 0.5s ease",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Center text */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: PADDING + HANDLE_SIZE,
              right: PADDING,
              transform: "translateY(-50%)",
              color: "#C7FF67",
              fontSize: "1.4rem",
              fontWeight: 300,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              textShadow: "0px 0px 10px rgba(0,0,0,0.8)",
              pointerEvents: "none",
              zIndex: 1,
              textAlign: "center",
            }}
          >
            <span
              style={{
                opacity: isLocked ? 0 : textOpacity,
                transition: isLocked ? "opacity 0.15s" : "none",
              }}
            >
              Swipe to lock
            </span>
            <span
              style={{
                position: "absolute",
                left: -PADDING - HANDLE_SIZE,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                textAlign: "center",
                opacity: isLocked ? 1 : 0,
                transition: `opacity 0.3s ease ${isLocked ? "0.1s" : "0s"}`,
              }}
            >
              Locked
            </span>
          </div>

          {/* ═══ Draggable handle ═══ */}
          <div
            onPointerDown={handlePointerDown}
            onClick={isLocked ? handleReset : undefined}
            style={{
              position: "absolute",
              top: PADDING,
              left: PADDING,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              zIndex: 10,
              cursor: isLocked ? "pointer" : "grab",
              transform: `translateX(${pos}px) scale(${tapScale})`,
              transition: isDragging ? "none" : "scale 0.2s ease",
              willChange: "transform",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isLocked ? "rgba(180,232,90,0.05)" : handleBg,
                boxShadow: handleGlow,
                position: "relative",
                overflow: "visible",
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: isLocked ? "rgba(180,232,90,0.5)" : "#B4E85A",
                transition: "border-color 0.3s ease",
              }}
            >
              {/* Glass layers — own clip container */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(-38deg, transparent 30%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0.25) 60%, transparent 75%)", opacity: handleGlassOpacity }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(ellipse at 35% 25%, rgba(200,240,120,0.12) 0%, transparent 50%)", opacity: handleGlassOpacity }} />
                <div style={{ position: "absolute", inset: 2, borderRadius: "50%", border: "1px solid rgba(180,232,90,0.15)", opacity: handleGlassOpacity }} />
                <div style={{ position: "absolute", bottom: "5%", left: "15%", right: "15%", height: "35%", borderRadius: "50%", background: "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)", opacity: handleGlassOpacity }} />
                <div style={{ position: "absolute", inset: -1, borderRadius: "50%", boxShadow: "inset 0 0 12px 2px rgba(180,232,90,0.08), inset 0 0 4px 1px rgba(200,255,100,0.05)", opacity: handleGlassOpacity }} />
              </div>

              {/* Chevron */}
              <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", opacity: chevronOpacity }}>
                <ChevronIcon />
              </div>

              {/* Lock icon */}
              <AnimatedLockIcon isLocked={isLocked} opacity={lockIconOpacity} />
            </div>
          </div>

          {/* Pulse ring */}
          {isLocked && (
            <div
              key={`pulse-${pulseKey}`}
              style={{
                position: "absolute",
                top: PADDING,
                right: PADDING,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                borderRadius: "50%",
                border: "2px solid rgba(180,232,90,0.4)",
                pointerEvents: "none",
                animation: "pulseRing 0.8s ease-out forwards",
              }}
            />
          )}
        </div>

        {/* ═══ Status ═══ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isLocked ? "#C7FF67" : "rgba(180,232,90,0.3)",
              boxShadow: isLocked ? "0 0 8px rgba(199,255,103,0.5)" : "none",
              transition: "all 0.3s ease",
            }}
          />
          <span
            style={{
              color: isLocked ? "rgba(199,255,103,0.5)" : "rgba(255,255,255,0.3)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.3s ease",
            }}
          >
            {isLocked ? "Secured — tap to unlock" : "Drag handle to lock"}
          </span>
        </div>
      </div>
    </>
  );
}
