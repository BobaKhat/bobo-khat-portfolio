"use client";

import { useEffect, useState } from "react";

const items = [
  { label: "Work", href: "#work" },
  { label: "Lab", href: "#lab" },
  { label: "About", href: "#about" },
];

export default function Navigation() {
  const [active, setActive] = useState("work");

  useEffect(() => {
    const ids = ["work", "lab", "about"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="flex items-center gap-1 rounded-full bg-module p-1 shadow-[var(--shadow-raised)]">
      {items.map((item) => {
        const id = item.href.slice(1);
        const isActive = active === id;
        return (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-text-primary transition-colors hover:text-accent"
          >
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            )}
            {item.label}
          </a>
        );
      })}
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full px-3 py-1.5 text-xs text-text-primary transition-colors hover:text-accent"
      >
        Resume
      </a>
    </nav>
  );
}
