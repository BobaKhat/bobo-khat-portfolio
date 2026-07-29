"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? window.scrollY / scrollable : 0;
      setPct(Math.min(100, Math.max(0, Math.round(value * 100))));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Recessed rail — plain styling for now */}
      <div className="h-1 w-16 overflow-hidden rounded-full bg-surface shadow-[var(--shadow-recessed-sm)]">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-text-secondary">{pct}%</span>
    </div>
  );
}
