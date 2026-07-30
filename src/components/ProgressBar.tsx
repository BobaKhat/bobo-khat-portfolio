"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";

const STATUS_MESSAGES = [
  { at: 0.0, text: "Initializing pipeline..." },
  { at: 0.08, text: "Installing dependencies..." },
  { at: 0.18, text: "Resolving modules..." },
  { at: 0.3, text: "Compiling source files..." },
  { at: 0.5, text: "Running build optimizations..." },
  { at: 0.7, text: "Generating static assets..." },
  { at: 0.88, text: "Deploying to edge network..." },
  { at: 1.0, text: "Deployment successful" },
];

const DURATION = 4500;

function customEase(t: number) {
  const k = 12;
  return (Math.exp(k * t) - 1) / (Math.exp(k) - 1);
}
function customEaseDeriv(t: number) {
  const k = 12;
  return (k * Math.exp(k * t)) / (Math.exp(k) - 1);
}

interface Spark {
  x: number; y: number; vx: number; vy: number;
  life: number; decay: number; size: number; gravity: number; color: string;
}

function createSpark(x: number, y: number, intensity: number): Spark {
  const backSpeed = 3 + Math.random() * 4 + intensity * 5;
  const b = 180 + Math.random() * 75;
  return {
    x, y: y + (Math.random() - 0.5) * 6,
    vx: -backSpeed, vy: (Math.random() - 0.5) * 2.2,
    life: 1.0, decay: 0.022 + Math.random() * 0.028,
    size: 0.3 + Math.random() * 0.8, gravity: 0.008,
    color: `rgb(${b},${b},${b})`,
  };
}

function updateSpark(p: Spark) {
  p.x += p.vx; p.vy += p.gravity; p.y += p.vy; p.life -= p.decay; p.vx *= 0.97;
}

function drawSpark(ctx: CanvasRenderingContext2D, p: Spark) {
  if (p.life <= 0) return;
  ctx.save();
  ctx.globalAlpha = p.life * 0.85;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = p.size * 0.5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.vx * 2.5, p.y + p.vy * 0.6);
  ctx.stroke();
  ctx.globalAlpha = p.life;
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 4;
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function PulsatingDots({ color = "rgba(255,255,255,0.7)", size = 5 }: { color?: string; size?: number }) {
  return (
    <div className="flex items-center justify-center gap-[5px]">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: size, height: size, borderRadius: "50%", background: color }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export function ProgressBar() {
  const [btnLabel, setBtnLabel] = useState("Deploy");
  const [statusText, setStatusText] = useState("Ready to deploy");
  const [statusVisible, setStatusVisible] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<Spark[]>([]);
  const animatingRef = useRef(false);
  const completedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const animIdRef = useRef<number | null>(null);
  const statusIndexRef = useRef(-1);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 120;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, []);

  const emitSparks = useCallback((progressPct: number, intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = progressPct * canvas.width;
    const y = 50 + 8;
    const count = Math.floor(2 + intensity * 12);
    for (let i = 0; i < count; i++) particlesRef.current.push(createSpark(x, y, intensity));
  }, []);

  const updateStatus = useCallback((rawT: number) => {
    let newIndex = 0;
    for (let i = STATUS_MESSAGES.length - 1; i >= 0; i--) {
      if (rawT >= STATUS_MESSAGES[i].at) { newIndex = i; break; }
    }
    if (newIndex !== statusIndexRef.current) {
      statusIndexRef.current = newIndex;
      setStatusVisible(false);
      setTimeout(() => {
        setStatusText(STATUS_MESSAGES[newIndex].text);
        setStatusVisible(true);
      }, 150);
    }
  }, []);

  const updateGlow = useCallback((rawT: number) => {
    const fill = fillRef.current;
    const track = trackRef.current;
    if (!fill || !track) return;
    const gi = 0.15 + rawT * 0.6;
    const gs = 8 + rawT * 25;
    const gs2 = 20 + rawT * 40;
    fill.style.boxShadow = `0 0 ${gs}px rgba(255,255,255,${gi}), 0 0 ${gs2}px rgba(255,255,255,${gi * 0.4}), 0 0 ${gs2 * 1.5}px rgba(255,255,255,${gi * 0.1})`;
    const tg = 0.03 + rawT * 0.08;
    track.style.boxShadow = `0 0 ${12 + rawT * 20}px rgba(255,255,255,${tg})`;
  }, []);

  const reset = useCallback(() => {
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    startTimeRef.current = null;
    animatingRef.current = false;
    completedRef.current = false;
    particlesRef.current = [];
    statusIndexRef.current = -1;

    const fill = fillRef.current;
    const track = trackRef.current;
    const card = cardRef.current;
    const canvas = canvasRef.current;

    if (fill) {
      fill.style.width = "0%";
      fill.style.transition = "none";
      fill.style.boxShadow = "0 0 8px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.15)";
    }
    if (track) { track.style.transition = "none"; track.style.boxShadow = "0 0 12px rgba(255,255,255,0.04)"; }
    if (card) {
      card.style.boxShadow = "0 0 30px rgba(255,255,255,0.03), inset 0 0 30px rgba(255,255,255,0.01)";
      card.style.borderColor = "rgba(255,255,255,0.08)";
    }
    if (canvas) { const ctx = canvas.getContext("2d"); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }

    setStatusText("Ready to deploy");
    setStatusVisible(true);
    setIsDone(false);
    setIsLoading(false);
    setPercent(0);
    setElapsed(0);
    setBtnLabel("Deploy");
  }, []);

  const animateProgress = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsedMs = timestamp - startTimeRef.current;
      const rawT = Math.min(elapsedMs / DURATION, 1);
      const easedT = customEase(rawT);

      const fill = fillRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (fill) fill.style.width = easedT * 100 + "%";
      setPercent(Math.round(easedT * 100));
      setElapsed(Math.min(elapsedMs, DURATION));
      updateGlow(rawT);
      updateStatus(rawT);

      const speed = customEaseDeriv(rawT);
      const normalizedSpeed = Math.min(speed / 12, 1);
      if (rawT > 0.05 && easedT > 0.005) emitSparks(easedT, normalizedSpeed);
      if (rawT > 0.8) emitSparks(easedT, Math.min(normalizedSpeed * 1.5, 1));

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesRef.current.forEach((p) => { updateSpark(p); drawSpark(ctx, p); });
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      }

      if (rawT < 1) { animIdRef.current = requestAnimationFrame(animateProgress); return; }

      if (fill) fill.style.width = "100%";
      completedRef.current = true;
      animatingRef.current = false;
      setIsLoading(false);
      setBtnLabel("Deployed");
      setIsDone(true);
      setPercent(100);

      if (canvas) {
        for (let i = 0; i < 45; i++)
          particlesRef.current.push(createSpark(canvas.width, 50 + 8 + (Math.random() - 0.5) * 8, 1.2));
      }

      const shine = shineRef.current;
      if (shine) {
        setTimeout(() => {
          shine.style.animation = "shineSweep 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards";
          setTimeout(() => { shine.style.animation = "none"; }, 800);
        }, 80);
      }

      const card = cardRef.current;
      const track = trackRef.current;
      if (fill) {
        fill.style.transition = "none";
        fill.style.boxShadow = `0 0 60px rgba(255,255,255,1), 0 0 100px rgba(255,255,255,0.7), 0 0 160px rgba(255,255,255,0.35), 0 0 240px rgba(255,255,255,0.12)`;
      }
      if (track) track.style.boxShadow = "0 0 70px rgba(255,255,255,0.3)";
      if (card) {
        card.style.boxShadow = "0 0 100px rgba(255,255,255,0.1), inset 0 0 50px rgba(255,255,255,0.04)";
        card.style.borderColor = "rgba(255,255,255,0.35)";
      }

      setTimeout(() => {
        if (fill) { fill.style.transition = "box-shadow 2s ease"; fill.style.boxShadow = `0 0 20px rgba(255,255,255,0.6), 0 0 45px rgba(255,255,255,0.2), 0 0 80px rgba(255,255,255,0.08)`; }
        if (track) { track.style.transition = "box-shadow 2s ease"; track.style.boxShadow = "0 0 30px rgba(255,255,255,0.1)"; }
      }, 600);

      const postLoop = () => {
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesRef.current.forEach((p) => { updateSpark(p); drawSpark(ctx, p); });
          particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
          if (particlesRef.current.length > 0) requestAnimationFrame(postLoop);
        }
      };
      postLoop();
    },
    [emitSparks, updateGlow, updateStatus]
  );

  const handleRun = () => {
    if (animatingRef.current) return;
    if (completedRef.current) { reset(); return; }
    animatingRef.current = true;
    setIsLoading(true);
    animIdRef.current = requestAnimationFrame(animateProgress);
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${s}.${tenths}s`;
  };

  const statusBadge = isDone ? "success" : isLoading ? "running" : "idle";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] select-none" style={{ padding: "24px" }}>
      <div
        ref={cardRef}
        style={{
          background: "#0a0a0a",
          borderRadius: 16,
          padding: "0",
          width: "100%",
          maxWidth: 370,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 30px rgba(255,255,255,0.03), inset 0 0 30px rgba(255,255,255,0.01)",
          transition: "box-shadow 0.6s ease, border-color 0.6s ease",
          fontFamily: "'DM Sans', 'Inter', -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: isDone ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${isDone ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.4s ease",
            }}>
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>
                Build Pipeline
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                production &middot; v2.4.1
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 10,
            letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 5,
            background: statusBadge === "success" ? "rgba(52,211,153,0.1)" : statusBadge === "running" ? "rgba(250,204,21,0.08)" : "rgba(255,255,255,0.04)",
            color: statusBadge === "success" ? "rgba(52,211,153,0.9)" : statusBadge === "running" ? "rgba(250,204,21,0.8)" : "rgba(255,255,255,0.35)",
            border: `1px solid ${statusBadge === "success" ? "rgba(52,211,153,0.15)" : statusBadge === "running" ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.08)"}`,
            transition: "all 0.4s ease",
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: statusBadge === "success" ? "rgba(52,211,153,0.9)" : statusBadge === "running" ? "rgba(250,204,21,0.8)" : "rgba(255,255,255,0.25)",
              animation: statusBadge === "running" ? "statusPulse 1.5s ease-in-out infinite" : "none",
            }} />
            {statusBadge === "success" ? "Deployed" : statusBadge === "running" ? "Running" : "Idle"}
          </div>
        </div>

        {/* Progress section */}
        <div style={{ padding: "18px 20px 6px" }}>
          {/* Percent + time row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontSize: 26, color: "rgba(255,255,255,0.9)",
                fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
                transition: "color 0.3s",
              }}>
                {percent}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>%</span>
            </div>
            {(isLoading || isDone) && (
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.25)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {formatTime(elapsed)} {!isDone && `/ ${(DURATION / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>

          {/* Track */}
          <div style={{ position: "relative", width: "100%", height: 10 }}>
            <div
              ref={trackRef}
              style={{
                width: "100%", height: "100%",
                background: "rgba(255,255,255,0.04)", borderRadius: 5,
                overflow: "hidden", position: "relative",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 0 12px rgba(255,255,255,0.04)",
                transition: "box-shadow 0.3s ease",
              }}
            >
              <div
                ref={fillRef}
                style={{
                  height: "100%", borderRadius: 4,
                  background: isDone ? "rgba(52,211,153,0.9)" : "#fff",
                  width: "0%",
                  boxShadow: "0 0 8px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.15)",
                  position: "relative",
                  transition: isDone ? "background 0.6s ease" : "none",
                }}
              >
                <div
                  ref={shineRef}
                  style={{
                    position: "absolute", top: 0, left: "-100%",
                    width: "60%", height: "100%",
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.0) 20%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.0) 80%, transparent 100%)",
                    borderRadius: 4, pointerEvents: "none", opacity: 0,
                  }}
                />
              </div>
            </div>
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute", top: -50, left: 0,
                width: "100%", height: 120,
                pointerEvents: "none", zIndex: 10,
              }}
            />
          </div>

          {/* Status text */}
          <div style={{
            fontSize: 11, marginTop: 10,
            color: isDone ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.3)",
            height: 16,
            transition: "opacity 0.3s ease, color 0.4s ease",
            opacity: statusVisible ? 1 : 0,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: 10, height: 10, flexShrink: 0 }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </motion.div>
            )}
            {statusText}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          padding: "12px 20px",
          margin: "8px 20px 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          {[
            { label: "Region", value: "us-east-1" },
            { label: "Runtime", value: "Node 20" },
            { label: "Bundle", value: "1.2 MB" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginBottom: 3, letterSpacing: "0.04em" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: "14px 20px 16px", display: "flex", gap: 8 }}>
          <button
            onClick={handleRun}
            className="cursor-pointer active:scale-[0.97]"
            style={{
              flex: 1,
              height: 38,
              borderRadius: 10,
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              fontSize: 13,
              letterSpacing: "0.01em",
              background: isDone ? "rgba(52,211,153,0.12)" : "#fff",
              color: isDone ? "rgba(52,211,153,0.9)" : "#000",
              border: isDone ? "1px solid rgba(52,211,153,0.2)" : "none",
              boxShadow: isDone ? "none" : "0 0 15px rgba(255,255,255,0.08)",
              transition: "all 0.3s ease",
            }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="dots" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <PulsatingDots color={isDone ? "rgba(52,211,153,0.8)" : "rgba(0,0,0,0.8)"} size={5} />
                </motion.div>
              ) : (
                <motion.span key={btnLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {btnLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={reset}
            className="cursor-pointer active:scale-[0.97]"
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              fontSize: 13,
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.15s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shineSweep {
          0%   { left: -60%; opacity: 1; }
          100% { left: 110%; opacity: 0.4; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
