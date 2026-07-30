"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ───────── Config ───────── */
const RED = "#db284c";
const GREEN = "#35b64d";
const LINE_COUNT = 18;
const SPRING = { type: "spring" as const, stiffness: 400, damping: 18 };
const LOAD_DURATION = 3000; // 3 seconds

/* Generate burst lines radiating outward from center */
function generateLines() {
  const lines: { angle: number; length: number; distance: number; delay: number }[] = [];
  for (let i = 0; i < LINE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / LINE_COUNT + (Math.random() - 0.5) * 0.3;
    const length = 14 + Math.random() * 18;
    const distance = 70 + Math.random() * 50;
    const delay = Math.random() * 0.08;
    lines.push({ angle, length, distance, delay });
  }
  return lines;
}

const BURST_LINES = generateLines();

/* Animated checkmark that draws in */
function AnimatedCheck({ size = 26 }: { size?: number }) {
  const r = size / 2;
  // Checkmark path inside circle
  const checkPath = `M${r * 0.5} ${r * 1.0} L${r * 0.85} ${r * 1.35} L${r * 1.5} ${r * 0.65}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {/* Circle */}
      <motion.circle
        cx={r}
        cy={r}
        r={r - 1}
        fill="white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...SPRING, delay: 0.15 }}
        style={{ transformOrigin: "center" }}
      />
      {/* Checkmark stroke */}
      <motion.path
        d={checkPath}
        stroke={GREEN}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

/* Loading dots — each dot pulses in sequence */
function LoadingDots() {
  const DOT_SIZE = 8;
  const FULL_CYCLE = 0.6; // full loop duration

  // Each dot's scale keyframes across the full cycle:
  // Dot appears big, then shrinks as the next one comes in, then disappears
  const scaleKeyframes = [
    //         start  appear  shrink1  shrink2  gone
    /* dot 0 */ [0,    1.6,    0.8,     0.4,     0],
    /* dot 1 */ [0,    0,      1.6,     0.8,     0],
    /* dot 2 */ [0,    0,      0,       1.6,     0],
  ];
  const opacityKeyframes = [
    /* dot 0 */ [0,    1,      0.6,     0.3,     0],
    /* dot 1 */ [0,    0,      1,       0.6,     0],
    /* dot 2 */ [0,    0,      0,       1,       0],
  ];

  return (
    <motion.span
      key="dots"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ display: "flex", alignItems: "center", gap: 8, height: 26 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{
            scale: scaleKeyframes[i],
            opacity: opacityKeyframes[i],
          }}
          transition={{
            duration: FULL_CYCLE,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{
            display: "block",
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: "50%",
            backgroundColor: "#fff",
          }}
        />
      ))}
    </motion.span>
  );
}

/* ───────── Component ───────── */
export function BookingButton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  type State = "idle" | "loading" | "completed";
  const [state, setState] = useState<State>("idle");
  const [burstKey, setBurstKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (state === "completed") {
      setState("idle");
    } else if (state === "idle") {
      setState("loading");
      timerRef.current = setTimeout(() => {
        setState("completed");
        setBurstKey((k) => k + 1);
      }, LOAD_DURATION);
    }
    // ignore clicks during loading
  }, [state]);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "transparent",
        userSelect: "none",
        WebkitUserSelect: "none",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "12px 12px",
        position: "relative",
        ...style,
      }}
    >
      {/* Centering wrapper */}
      <div style={{ position: "relative" }}>
        {/* Burst lines — only render on completion */}
        <AnimatePresence>
          {state === "completed" && (
            <div
              key={burstKey}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              {BURST_LINES.map((line, i) => {
                const cos = Math.cos(line.angle);
                const sin = Math.sin(line.angle);
                // Start position (on button edge)
                const startX = cos * 40;
                const startY = sin * 40;
                // End position (burst outward)
                const endX = cos * line.distance;
                const endY = sin * line.distance;

                return (
                  <motion.div
                    key={i}
                    initial={{
                      x: startX,
                      y: startY,
                      opacity: 1,
                      scaleY: 1,
                    }}
                    animate={{
                      x: endX,
                      y: endY,
                      opacity: 0,
                      scaleY: 0.3,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: line.delay,
                      ease: [0.2, 0.8, 0.3, 1],
                    }}
                    style={{
                      position: "absolute",
                      width: 2,
                      height: line.length,
                      backgroundColor: GREEN,
                      borderRadius: 1,
                      transformOrigin: "center",
                      rotate: `${(line.angle * 180) / Math.PI + 90}deg`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          onClick={handleClick}
          animate={{
            backgroundColor: state === "completed" ? GREEN : RED,
            scale: 1,
          }}
          whileTap={state === "idle" ? { scale: 0.95 } : {}}
          transition={SPRING}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            paddingLeft: 35,
            paddingRight: 35,
            paddingTop: 15,
            paddingBottom: 15,
            borderRadius: 100,
            border: "none",
            cursor: state === "loading" ? "default" : "pointer",
            outline: "none",
            whiteSpace: "nowrap",
            width: 280,
          }}
        >
          <AnimatePresence mode="wait">
            {state === "completed" ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: 600,
                    lineHeight: "normal",
                  }}
                >
                  You Are All Set
                </span>
                <AnimatedCheck />
              </motion.span>
            ) : state === "loading" ? (
              <LoadingDots />
            ) : (
              <motion.span
                key="booking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                Complete Booking
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Hint */}
      <span
        style={{
          marginTop: 24,
          color: "rgba(255,255,255,0.18)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap",
        }}
      >
        {state === "completed"
          ? "click to reset"
          : state === "loading"
            ? "processing..."
            : "click to confirm"}
      </span>
    </div>
  );
}
