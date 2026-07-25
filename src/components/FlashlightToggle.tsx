"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function FlashlightToggle() {
  const [isOn, setIsOn] = useState(false);

  const springConfig = { type: "spring" as const, stiffness: 500, damping: 30 };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Ambient radial glow — large, soft, behind everything */}
      <motion.div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        initial={false}
        animate={{
          background: isOn
            ? "radial-gradient(circle, rgba(255,220,80,0.18) 0%, rgba(255,200,60,0.08) 30%, rgba(255,180,40,0.03) 55%, transparent 75%)"
            : "radial-gradient(circle, rgba(255,220,80,0) 0%, transparent 75%)",
          scale: isOn ? 1 : 0.6,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Secondary tighter glow ring */}
      <motion.div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        initial={false}
        animate={{
          background: isOn
            ? "radial-gradient(circle, rgba(255,240,102,0.25) 0%, rgba(255,230,80,0.1) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,240,102,0) 0%, transparent 70%)",
          scale: isOn ? 1 : 0.4,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Breathing pulse when on */}
      <motion.div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        initial={false}
        animate={{
          background: isOn
            ? "radial-gradient(circle, rgba(255,240,102,0.06) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(255,240,102,0) 0%, transparent 60%)",
          scale: isOn ? [1, 1.15, 1] : 0.5,
          opacity: isOn ? [0.8, 1, 0.8] : 0,
        }}
        transition={
          isOn
            ? {
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                background: { duration: 0.5 },
              }
            : { duration: 0.4 }
        }
      />

      {/* The Toggle Switch */}
      <motion.button
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={() => setIsOn(!isOn)}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          padding: 8,
          borderRadius: 9999,
          cursor: "pointer",
          backgroundColor: "#000",
          width: 140,
          height: 72,
          borderWidth: 1.5,
          borderStyle: "solid",
          outline: "none",
        }}
        initial={false}
        animate={{
          borderColor: isOn ? "rgba(255,240,102,0.6)" : "#262626",
        }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Track glow fill */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            pointerEvents: "none",
          }}
          initial={false}
          animate={{
            backgroundColor: isOn ? "rgba(255,240,102,0.06)" : "rgba(255,240,102,0)",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Thumb */}
        <motion.div
          style={{
            position: "relative",
            height: 52,
            width: 52,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={false}
          animate={{
            x: isOn ? 69 : 0,
            backgroundColor: isOn ? "#FFF066" : "#262626",
            boxShadow: isOn
              ? "0px 0px 20px 4px rgba(255,240,102,0.5), 0px 0px 50px 12px rgba(255,240,102,0.2), 0px 0px 80px 20px rgba(255,240,102,0.08)"
              : "0px 0px 0px 0px rgba(255,240,102,0)",
          }}
          transition={{
            x: springConfig,
            backgroundColor: { duration: 0.2 },
            boxShadow: { duration: 0.35, delay: isOn ? 0.05 : 0 },
          }}
        >
          {/* Inner highlight */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, transparent 60%)",
            }}
            initial={false}
            animate={{ opacity: isOn ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
