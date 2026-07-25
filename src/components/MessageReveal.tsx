"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// Inlined from the source project's imports/svg-dwrnwqtxbx.ts — just the
// one checkmark path this component uses, rather than pulling in the whole
// Figma-Make-generated imports scaffold for a single <path d="...">.
const CHECK_PATH =
  "M29.4655 47.6687L20.7667 38.5622C20.298 38.0715 19.6623 37.7959 18.9994 37.7959C18.3365 37.7959 17.7008 38.0715 17.2321 38.5622C16.7633 39.0529 16.5 39.7185 16.5 40.4124C16.5 40.756 16.5646 41.0963 16.6903 41.4137C16.8159 41.7312 17 42.0196 17.2321 42.2626L27.7107 53.2324C28.6884 54.2559 30.2677 54.2559 31.2454 53.2324L57.768 25.4667C58.2367 24.976 58.5 24.3105 58.5 23.6165C58.5 22.9226 58.2367 22.2571 57.768 21.7664C57.2992 21.2757 56.6635 21 56.0006 21C55.3377 21 54.702 21.2757 54.2333 21.7664L29.4655 47.6687Z";

function Avatar({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: "#a6136e",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: "#fff",
          fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: 590,
          fontSize: size * 0.61,
          lineHeight: 1,
        }}
      >
        B
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 75 75"
      fill="none"
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width="75" height="75" rx="37.5" fill="#00D54B" />
      <path d={CHECK_PATH} fill="white" />
    </svg>
  );
}

const expandSpring = { type: "spring" as const, stiffness: 380, damping: 30 };
const collapseSpring = { type: "spring" as const, stiffness: 350, damping: 24 };

/* Content width uses a smooth tween — springs on width cause oscillation/deform */
const contentTransition = {
  width: { type: "tween" as const, duration: 0.32, ease: [0.4, 0, 0.2, 1] as const },
  opacity: { duration: 0.15 },
};

const GLOW =
  "0px 0px 22px 2px rgba(166,19,110,0.35), inset 0 0 0 0.9px #a6136e";

export default function MessageReveal() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [questionMarks, setQuestionMarks] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isExpanded) {
      setQuestionMarks(0);
      intervalRef.current = setInterval(() => {
        setQuestionMarks((prev) => {
          if (prev >= 8) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setQuestionMarks(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isExpanded]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "100%",
        fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
        gap: 20,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Main pill — glow lives on this element so overflow doesn't clip it */}
      <motion.div
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{
          boxShadow: GLOW,
          borderRadius: isExpanded ? 40 : 300,
          padding: isExpanded ? 14 : 12,
        }}
        transition={isExpanded ? expandSpring : collapseSpring}
        style={{
          backgroundColor: "#1e1b1b",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: 300,
          padding: 12,
          gap: 0,
          boxShadow: GLOW,
        }}
      >
        {/* Avatar */}
        <Avatar />

        {/* Text + Check */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="content"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={contentTransition}
              style={{
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {/* spacer after avatar */}
              <div style={{ width: 10, flexShrink: 0 }} />

              <p
                style={{
                  color: "#d9d9d9",
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: "normal",
                  fontFamily:
                    "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Did you read my slack message
                {"?".repeat(questionMarks)}
              </p>

              {/* spacer before checkmark */}
              <div style={{ width: 10, flexShrink: 0 }} />

              <CheckIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: isExpanded
              ? "#a6136e"
              : "rgba(166,19,110,0.3)",
            boxShadow: isExpanded
              ? "0 0 8px rgba(166,19,110,0.5)"
              : "none",
            transition: "all 0.3s ease",
          }}
        />
        <span
          style={{
            color: isExpanded
              ? "rgba(166,19,110,0.6)"
              : "rgba(255,255,255,0.3)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            transition: "color 0.3s ease",
          }}
        >
          {isExpanded
            ? "Message shown — tap to dismiss"
            : "Tap icon to reveal"}
        </span>
      </div>
    </div>
  );
}
