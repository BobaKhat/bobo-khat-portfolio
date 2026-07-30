"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AppItem {
  id: string;
  name: string;
  img: string;
  color: string;
}

const apps: AppItem[] = [
  { id: "claude", name: "Claude", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="%23D97757"/><g transform="translate(128,128)" fill="%23F7F4EE"><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(30)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(60)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(90)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(120)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(150)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(180)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(210)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(240)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(270)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(300)"/><path d="M0,-98 L5,-30 L0,-6 L-5,-30 Z" transform="rotate(330)"/></g></svg>`, color: "#D97757" },
  { id: "spotify", name: "Spotify", img: "https://cdn.simpleicons.org/spotify/1DB954", color: "#1DB954" },
  { id: "linkedin", name: "LinkedIn", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="%230A66C2"/><path transform="translate(100,100) scale(0.7)" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" fill="%23fff"/></svg>`, color: "#0A66C2" },
  { id: "youtube", name: "YouTube", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%23FF0000"/><stop offset="1" stop-color="%23CC0000"/></linearGradient></defs><rect width="256" height="256" rx="56" fill="url(%23yg)"/><path d="M176.4,120.1l-64-40A10,10,0,0,0,97,88.9v80.2a10,10,0,0,0,15.4,8.4l64-40a9.6,9.6,0,0,0,0-17.4Z" fill="%23fff"/></svg>`, color: "#FF0000" },
  { id: "cinema4d", name: "Cinema 4D", img: "https://upload.wikimedia.org/wikipedia/en/d/d8/C4D_Logo.png", color: "#4A6CF7" },
  { id: "figma", name: "Figma", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="%231a1a1a"/>
<g transform="translate(68,38)"><path d="M60,0H30A30,30,0,0,0,30,60H60Z" fill="%23FF4B1F"/><path d="M60,0H90A30,30,0,0,1,90,60H60Z" fill="%23FF8A75"/><path d="M60,60H30A30,30,0,0,0,30,120H60Z" fill="%23B45FFF"/><circle cx="90" cy="90" r="30" fill="%2325D4FF"/><path d="M30,120H60V150A30,30,0,0,1,0,150V150A30,30,0,0,1,30,120Z" fill="%230FE89B"/></g></svg>`, color: "#A259FF" },
];

function DockIcon({ app }: { app: AppItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: 45, height: 45 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              marginLeft: -3,
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: app.color,
              boxShadow: `0 0 8px 2px ${app.color}60`,
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: hovered ? -28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.6 }}
        style={{
          width: 45,
          height: 45,
          borderRadius: 10,
          position: "relative",
          cursor: "pointer",
          overflow: "visible",
        }}
      >
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: 18,
            background: `radial-gradient(circle, ${app.color}40 0%, ${app.color}18 40%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={app.name}
          src={app.img}
          draggable={false}
          style={{
            width: 45,
            height: 45,
            borderRadius: 10,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </div>
  );
}

export function AppDock() {
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
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
        <div
          style={{
            backgroundColor: "#0e0e0e",
            borderRadius: 20,
            padding: 15,
            display: "flex",
            gap: 15,
            alignItems: "center",
            position: "relative",
            border: "0.5px solid #313131",
          }}
        >
          {apps.map((app) => (
            <DockIcon key={app.id} app={app} />
          ))}
        </div>

      </div>
    </div>
  );
}
