"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const SEARCH_ICON_PATH =
  "M8.5777 4.45326H8.03293L7.84357 4.64124C8.51252 5.4213 8.91938 6.43257 8.91938 7.54056C8.91938 10.0035 6.92281 12 4.45969 12C1.99657 12 0 10.0035 0 7.54056C0 5.07758 1.99657 3.08113 4.45969 3.08113C5.56775 3.08113 6.57839 3.48728 7.35849 4.15551L7.54786 3.96753V3.42416L10.977 5.96046e-08L12 1.02293L8.5777 4.45326V4.45326ZM4.45931 4.45357C2.75364 4.45357 1.37183 5.83531 1.37183 7.54087C1.37183 9.24575 2.75364 10.6282 4.45931 10.6282C6.16428 10.6282 7.54678 9.24575 7.54678 7.54087C7.54678 5.83531 6.16428 4.45357 4.45931 4.45357V4.45357Z";

const MAX_CHARS = 30;
const LOADING_DELAY = 1800;

const MOCK_RESULTS = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMGRlc2lnbnxlbnwxfHx8fDE3NzMzODM4OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Minimalist Product Design",
    desc: "Clean, modern aesthetics for digital interfaces",
    tags: ["Design", "Minimal", "Product"],
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1639817754460-9af351966008?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGFydCUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MzM4Mzg5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Abstract Geometric Patterns",
    desc: "Vibrant compositions with bold geometric forms",
    tags: ["Abstract", "Art", "Color"],
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1683041133891-613b76cbebc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBtb3VudGFpbiUyMGxha2V8ZW58MXx8fHwxNzczMzgzODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Mountain Lake Landscape",
    desc: "Serene natural scenery with reflective waters",
    tags: ["Nature", "Photo", "Scenic"],
  },
];

function ShimmerBlock({
  className,
  style,
  delay = 0,
}: {
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <div
      className={`overflow-hidden ${className || ""}`}
      style={{ background: "#d9d9d9", ...style }}
    >
      <motion.div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      />
    </div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.15, ease: "easeOut" }}
      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
    >
      {/* Thumbnail */}
      <ShimmerBlock
        className="rounded-[10px]"
        style={{ width: 72, height: 72, flexShrink: 0 }}
        delay={index * 0.15}
      />
      {/* Text lines */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <ShimmerBlock
          className="rounded-[6px]"
          style={{ width: "100%", height: 12 }}
          delay={index * 0.15 + 0.05}
        />
        <ShimmerBlock
          className="rounded-[6px]"
          style={{ width: "80%", height: 12 }}
          delay={index * 0.15 + 0.1}
        />
        {/* Tag pills */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {[0, 1, 2].map((t) => (
            <ShimmerBlock
              key={t}
              className="rounded-[6px]"
              style={{ width: 44, height: 12 }}
              delay={index * 0.15 + 0.12 + t * 0.04}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ResultRow({ item, index }: { item: (typeof MOCK_RESULTS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1 }}
      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.img}
        alt={item.title}
        className="rounded-[10px] object-cover"
        style={{ width: 72, height: 72, flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <span
          className="truncate"
          style={{
            fontSize: 13,
            color: "#222",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          {item.title}
        </span>
        <span
          className="truncate"
          style={{
            fontSize: 11,
            color: "#666",
            fontFamily: "'Inter', sans-serif",
            marginTop: 4,
          }}
        >
          {item.desc}
        </span>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {item.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                color: "#555",
                background: "#ebebeb",
                borderRadius: 5,
                padding: "3px 8px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

type Phase = "empty" | "loading" | "loaded";

export function SkeletonSearch() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("empty");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS);
    setQuery(val);
    clearTimer();
    if (val.length === 0) {
      setPhase("empty");
      return;
    }
    setPhase("loading");
    timerRef.current = setTimeout(() => {
      setPhase("loaded");
    }, LOADING_DELAY);
  };

  const handleClear = () => {
    setQuery("");
    setPhase("empty");
    clearTimer();
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center justify-center w-full h-full select-none" style={{ padding: 20 }}>
      {/* Card */}
      <div
        className="bg-white overflow-hidden"
        style={{
          width: "100%",
          maxWidth: 370,
          borderRadius: 24,
          boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          padding: "22px 18px 18px",
          gap: 14,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 14,
            paddingRight: 14,
            paddingTop: 8,
            paddingBottom: 8,
            background: "#f0f0f0",
            borderRadius: 100,
            boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)",
          }}
        >
          <div className="flex items-center gap-[12px]">
            <div className="-scale-y-100">
              <div style={{ width: 12, height: 12, position: "relative" }}>
                <svg
                  style={{ position: "absolute", width: "100%", height: "100%" }}
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 12 12"
                >
                  <path
                    clipRule="evenodd"
                    d={SEARCH_ICON_PATH}
                    fill="#435B5B"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search for something"
              maxLength={MAX_CHARS}
              className="bg-transparent outline-none border-none text-[#484848] text-[11px] placeholder-[#484848]"
              style={{ fontFamily: "'Inter', sans-serif", width: 160 }}
            />
          </div>
          <div className="flex items-center gap-[6px]">
            {query.length > 0 && (
              <button
                onClick={handleClear}
                className="text-[#999] hover:text-[#666] text-[10px] cursor-pointer bg-transparent border-none p-0"
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1 }}
              >
                ✕
              </button>
            )}
            <span
              className="text-[#484848] text-[8px] whitespace-nowrap"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {query.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Results area */}
        <div style={{ flex: 1, minHeight: 270 }}>
          <AnimatePresence mode="wait">
            {phase === "empty" && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: "#f0f0f0",
                  borderRadius: 16,
                  height: 270,
                  width: "100%",
                }}
              />
            )}

            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[0, 1, 2].map((i) => (
                  <SkeletonRow key={i} index={i} />
                ))}
              </motion.div>
            )}

            {phase === "loaded" && (
              <motion.div
                key="loaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {MOCK_RESULTS.map((item, i) => (
                  <ResultRow key={item.id} item={item} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
