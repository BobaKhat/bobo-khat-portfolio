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
  { id: "claude", name: "Claude", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="%23D97757"/><g transform="translate(128,128)" fill="%23F7F4EE"><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(30)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(60)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(90)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(120)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(150)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(180)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(210)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(240)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(270)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(300)"/><path d="M0,-94 C9,-86 13,-58 11,-36 Q9,-16 0,0 Q-9,-16 -11,-36 C-13,-58 -9,-86 0,-94 Z" transform="rotate(330)"/></g></svg>`, color: "#D97757" },
  { id: "spotify", name: "Spotify", img: "https://cdn.simpleicons.org/spotify/1DB954", color: "#1DB954" },
  { id: "linkedin", name: "LinkedIn", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="%230A66C2"/><path transform="translate(100,100) scale(0.7)" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" fill="%23fff"/></svg>`, color: "#0A66C2" },
  { id: "youtube", name: "YouTube", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%23FF0000"/><stop offset="1" stop-color="%23CC0000"/></linearGradient></defs><rect width="256" height="256" rx="56" fill="url(%23yg)"/><path d="M176.4,120.1l-64-40A10,10,0,0,0,97,88.9v80.2a10,10,0,0,0,15.4,8.4l64-40a9.6,9.6,0,0,0,0-17.4Z" fill="%23fff"/></svg>`, color: "#FF0000" },
  { id: "cinema4d", name: "Cinema 4D", img: "https://upload.wikimedia.org/wikipedia/en/d/d8/C4D_Logo.png", color: "#4A6CF7" },
  { id: "blender", name: "Blender", img: "https://cdn.simpleicons.org/blender/F5792A", color: "#F5792A" },
  { id: "figma", name: "Figma", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="%231a1a1a"/>
<g transform="translate(68,38)"><path d="M60,0H30A30,30,0,0,0,30,60H60Z" fill="%23FF4B1F"/><path d="M60,0H90A30,30,0,0,1,90,60H60Z" fill="%23FF8A75"/><path d="M60,60H30A30,30,0,0,0,30,120H60Z" fill="%23B45FFF"/><circle cx="90" cy="90" r="30" fill="%2325D4FF"/><path d="M30,120H60V150A30,30,0,0,1,0,150V150A30,30,0,0,1,30,120Z" fill="%230FE89B"/></g></svg>`, color: "#A259FF" },
  { id: "instagram", name: "Instagram", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><radialGradient id="ig" cx="0.3" cy="1" r="1.1"><stop offset="0" stop-color="%23FEDA75"/><stop offset="0.28" stop-color="%23FA7E1E"/><stop offset="0.55" stop-color="%23D62976"/><stop offset="0.78" stop-color="%23962FBF"/><stop offset="1" stop-color="%234F5BD5"/></radialGradient></defs><rect width="256" height="256" rx="56" fill="url(%23ig)"/><g transform="translate(53,53) scale(6.25)" fill="%23fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></g></svg>`, color: "#D62976" },
  { id: "notion", name: "Notion", img: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="%23fff"/><g transform="translate(58,58) scale(5.83)" fill="%23000"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.328s0 .84-1.168.84l-3.222.186c-.093-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></g></svg>`, color: "#000000" },
];

// Each icon is 45px wide with 15px gaps (~60px per icon). As the viewport
// narrows the fixed-width dock would overflow, so drop icons from the end one
// at a time — keeping the first (most-relevant) apps. Index-aligned with `apps`;
// blank = always visible. Thresholds ≈ the viewport width at which the Nth icon
// no longer fits the mobile card, and all sit below md (768px) so the full dock
// always shows on tablet/desktop.
const DOCK_HIDE_AT = [
  "", // Claude
  "", // Spotify
  "", // LinkedIn
  "max-[360px]:hidden", // YouTube
  "max-[420px]:hidden", // Cinema 4D
  "max-[480px]:hidden", // Blender
  "max-[540px]:hidden", // Figma
  "max-[600px]:hidden", // Instagram
  "max-[660px]:hidden", // Notion
];

function DockIcon({ app, className = "" }: { app: AppItem; className?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
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
          {apps.map((app, i) => (
            <DockIcon key={app.id} app={app} className={DOCK_HIDE_AT[i] ?? ""} />
          ))}
        </div>

      </div>
    </div>
  );
}
