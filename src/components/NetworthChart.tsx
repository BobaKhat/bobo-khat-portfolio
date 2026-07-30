"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BarData {
  year: string;
  value: number;
  label: string;
  barHeight: number;
  left: number;
  gradientAngle: number;
  age: number;
  growthPercent: number;
}

// --- Animated number hook ---
function useAnimatedNumber(target: number, duration = 400): number {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef({ value: target, time: 0 });

  const easeOut = useCallback(
    (t: number) => 1 - Math.pow(1 - t, 3),
    []
  );

  useEffect(() => {
    const from = display;
    if (from === target) return;
    const startTime = performance.now();
    startRef.current = { value: from, time: startTime };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = Math.round(from + (target - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

const data: BarData[] = [
  { year: "2026", value: 189420, label: "$189k", barHeight: 41, left: 64.5, gradientAngle: 143.543, age: 34, growthPercent: 8 },
  { year: "2029", value: 251780, label: "$251k", barHeight: 57, left: 112.5, gradientAngle: 134.234, age: 37, growthPercent: 12 },
  { year: "2033", value: 434150, label: "$434k", barHeight: 84, left: 160.5, gradientAngle: 123.451, age: 41, growthPercent: 18 },
  { year: "2036", value: 502340, label: "$502k", barHeight: 115, left: 208.5, gradientAngle: 115.76, age: 44, growthPercent: 24 },
  { year: "2039", value: 636920, label: "$636k", barHeight: 150, left: 256.5, gradientAngle: 110.303, age: 47, growthPercent: 30 },
];

// Default values (last bar / no hover)
const DEFAULT = data[data.length - 1];

const gridLines = [
  { label: "700k", labelTop: 118.5, lineTop: 124.5 },
  { label: "600k", labelTop: 153.5, lineTop: 159.5 },
  { label: "500k", labelTop: 188.5, lineTop: 194.5 },
  { label: "400k", labelTop: 223.5, lineTop: 229.5 },
  { label: "200k", labelTop: 258.5, lineTop: 264.5 },
  { label: "100k", labelTop: 293.5, lineTop: 299.5 },
];

const BASELINE_Y = 299.5;
const BAR_WIDTH = 35;
const GRID_LEFT = 64.5;
const GRID_WIDTH = 222;

const FONT_SF =
  "'SF Pro Display', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

export function NetworthChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const active = hoveredIndex !== null ? data[hoveredIndex] : DEFAULT;
  const animatedValue = useAnimatedNumber(active.value, 450);
  const animatedGrowth = useAnimatedNumber(active.growthPercent, 350);
  const animatedAge = useAnimatedNumber(active.age, 350);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "100%",
        backgroundColor: "transparent",
        userSelect: "none",
        WebkitUserSelect: "none",
        fontFamily: FONT_SF,
        padding: "24px 12px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Card */}
        <div
          style={{
            width: 311,
            height: 347,
            backgroundColor: "#080808",
            borderRadius: 20,
            border: "0.5px solid #333333",
            position: "relative",
            overflow: "hidden",
            opacity: 0.9,
          }}
        >
          {/* Ambient glow behind card */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "25%",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(181,255,77,0.12) 0%, rgba(181,255,77,0.04) 40%, transparent 70%)",
              pointerEvents: "none",
              filter: "blur(40px)",
            }}
          />

          {/* Header */}
          <p
            style={{
              position: "absolute",
              left: 19.5,
              top: 14.5,
              color: "#5e5e5e",
              fontSize: 13,
              fontWeight: 590,
              fontFamily: FONT_SF,
              letterSpacing: "0.01em",
            }}
          >
            ESTIMATED NETWORTH
          </p>

          {/* Value + Growth row */}
          <div
            style={{
              position: "absolute",
              left: 19.5,
              top: 40.5,
              display: "flex",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <p
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: 590,
                fontFamily: FONT_SF,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ${animatedValue.toLocaleString()}
            </p>

            <p
              style={{
                color: "#c8ff75",
                fontSize: 13,
                fontWeight: 590,
                fontFamily: FONT_SF,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              + {animatedGrowth}%
            </p>
          </div>

          {/* By age */}
          <p
            style={{
              position: "absolute",
              left: 19.5,
              top: 74.5,
              color: "#555",
              fontSize: 12,
              fontWeight: 590,
              fontFamily: FONT_SF,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            by {animatedAge}
          </p>

          {/* Grid labels */}
          {gridLines.map((g) => (
            <p
              key={g.label}
              style={{
                position: "absolute",
                left: 19.5,
                top: g.labelTop,
                color: "#40413f",
                fontSize: 10,
                fontWeight: 510,
                fontFamily: FONT_SF,
              }}
            >
              {g.label}
            </p>
          ))}

          {/* Grid lines */}
          {gridLines.slice(0, -1).map((g, i) => (
            <div
              key={`grid-${i}`}
              style={{
                position: "absolute",
                left: GRID_LEFT,
                top: g.lineTop,
                width: GRID_WIDTH,
                height: 0.5,
                backgroundColor: i === 4 ? "#3a3a3a" : "#222222",
              }}
            />
          ))}

          {/* Bottom baseline */}
          <div
            style={{
              position: "absolute",
              left: GRID_LEFT,
              top: BASELINE_Y,
              width: 228,
              height: 0.5,
              backgroundColor: "#222222",
            }}
          />

          {/* Bars */}
          {data.map((bar, i) => {
            const isHovered = hoveredIndex === i;
            const barTop = BASELINE_Y - bar.barHeight;

            return (
              <div
                key={bar.year}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: "absolute",
                  left: bar.left,
                  top: barTop,
                  width: BAR_WIDTH,
                  height: bar.barHeight,
                  cursor: "pointer",
                }}
              >
                {/* Value label — pops up above bar on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      style={{
                        position: "absolute",
                        top: -22,
                        left: 0,
                        width: BAR_WIDTH,
                        textAlign: "center",
                        color: "#b4e569",
                        fontSize: 10,
                        fontWeight: 590,
                        fontFamily: FONT_SF,
                        whiteSpace: "nowrap",
                        zIndex: 10,
                      }}
                    >
                      {bar.label}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Bar body */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: mounted ? 1 : 0 }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  style={{
                    width: BAR_WIDTH,
                    height: bar.barHeight,
                    borderRadius: "10px 10px 0 0",
                    position: "relative",
                    transformOrigin: "bottom",
                    // Hovered bar gets solid #181818, others keep gradient
                    backgroundImage: isHovered
                      ? "none"
                      : `linear-gradient(${bar.gradientAngle}deg, rgb(0, 0, 0) 2.6%, rgb(24, 24, 24) 97.4%)`,
                    backgroundColor: isHovered ? "#111111" : "transparent",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  {/* Border overlay — lime green top+sides when not hovered, neutral all-sides when hovered */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -0.5,
                      left: -0.5,
                      right: -0.5,
                      bottom: isHovered ? -0.5 : 0,
                      borderRadius: "10.5px 10.5px 0 0",
                      borderTop: isHovered
                        ? "0.5px solid #414240"
                        : "0.5px solid #b6e86a",
                      borderLeft: isHovered
                        ? "0.5px solid #414240"
                        : "0.5px solid #b6e86a",
                      borderRight: isHovered
                        ? "0.5px solid #414240"
                        : "0.5px solid #b6e86a",
                      borderBottom: isHovered
                        ? "0.5px solid #414240"
                        : "none",
                      pointerEvents: "none",
                      transition: "border-color 0.3s ease",
                    }}
                  />

                  {/* Inner glow on hover */}
                  <motion.div
                    animate={{
                      boxShadow: isHovered
                        ? "inset 0px 0px 17.1px 0px #b4e569"
                        : "inset 0px 0px 0px 0px rgba(180,229,105,0)",
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      inset: -0.5,
                      borderRadius: "inherit",
                      pointerEvents: "none",
                    }}
                  />
                </motion.div>
              </div>
            );
          })}

          {/* Year labels */}
          {data.map((bar, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <p
                key={`year-${bar.year}`}
                style={{
                  position: "absolute",
                  top: 319.5,
                  left: bar.left,
                  width: BAR_WIDTH,
                  textAlign: "center",
                  color: isHovered ? "#b4e569" : "#464746",
                  fontSize: 10,
                  fontWeight: 400,
                  fontFamily: FONT_SF,
                  transition: "color 0.25s ease",
                }}
              >
                {bar.year}
              </p>
            );
          })}
        </div>

      </div>
    </div>
  );
}
