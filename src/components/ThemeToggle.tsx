"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-secondary"
    >
      <span className={isDark ? "" : "text-text-primary"}>Light</span>
      {/* Recessed track + sliding knob — plain styling for now */}
      <span className="relative inline-flex h-4 w-8 items-center rounded-full bg-surface shadow-[var(--shadow-recessed)]">
        <span
          className="absolute h-3 w-3 rounded-full bg-accent transition-transform duration-300"
          style={{ transform: isDark ? "translateX(16px)" : "translateX(2px)" }}
        />
      </span>
      <span className={isDark ? "text-text-primary" : ""}>Dark</span>
    </button>
  );
}
