"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/*
  feColorMatrix "values" string tinting a shadow/highlight to a solid color.
  Neomorphism only ever needs grayscale here, but rgb() keeps the warm-gray
  tints from the original light artwork intact.
*/
const rgb = (r: number, g: number, b: number) =>
  `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0`;
const gray = (v: number) => rgb(v, v, v);

type Colorway = {
  outer: string; // raised base plate
  track: string; // recessed well
  knob: string; // raised sliding knob
  f0drop: string; // base plate drop shadow
  f0hl: string; // base plate inner highlight
  f1in1: string; // track inner shadow (near-fill, subtle)
  f1in2: string; // track inner shadow (deep recess)
  f2drop: string; // knob drop shadow
  f2in1: string; // knob inner shadow (top-left)
  f2in2: string; // knob inner highlight (bottom-right)
};

/*
  Light colorway wired to the site's design-system tokens so the switch
  matches the rest of the neomorphic UI: the raised plate/knob take
  --module and the recessed track takes --surface — the same raised-vs-
  recessed token pairing the cards use. Shadow tints stay neutral grey
  (no warm cast) to sit cleanly on the cool palette. Dark keeps its own
  hand-tuned colorway below.
*/
const LIGHT: Colorway = {
  outer: "var(--module)",
  track: "var(--surface)",
  knob: "var(--accent)",
  f0drop: gray(0.66164),
  f0hl: gray(0.986816),
  f1in1: gray(0.843137),
  f1in2: gray(0.623892),
  f2drop: gray(0.648118),
  f2in1: gray(0.491474),
  f2in2: gray(0.992157),
};

/*
  Dark neomorphic counterpart. Same light source, inverted material:
  the plate is the dark module surface, the well is recessed darker than
  it, and the knob sits slightly lighter (raised). Shadows go near-black;
  highlights are a restrained light gray — never white, which reads as
  plastic glare rather than a soft rim in dark neomorphism.
*/
const DARK: Colorway = {
  outer: "#242424",
  track: "#191919",
  knob: "var(--accent)",
  f0drop: gray(0.04),
  f0hl: gray(0.29),
  f1in1: gray(0.1),
  f1in2: gray(0.03),
  f2drop: gray(0.03),
  f2in1: gray(0.15),
  f2in2: gray(0.33),
};

/*
  Physical sliding switch — neomorphic track with a raised knob.
  Knob rests on the right in dark mode; slides left for light mode.
  The knob group is translated in user-space units (viewBox coords):
  right position is the SVG's authored x (60.85), left position shifts
  it back by ~52.25 units to sit symmetrically at the track's left end.
  Colors swap with the theme so the switch reads as neomorphic in both.
  Fill colors transition on theme change so the plate/track/knob shift
  color together, in step with the knob's slide, instead of popping
  instantly while only the position animates.
*/
function Switch({ isDark }: { isDark: boolean }) {
  const c = isDark ? DARK : LIGHT;
  const fillTransition = { transition: "fill 300ms ease" };
  return (
    <svg
      width="115"
      height="60"
      viewBox="0 0 115 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[40px] w-auto"
      aria-hidden="true"
    >
      <g filter="url(#filter0_di_78_61)">
        <rect
          x="0.599976" y="1.34998" width="108.25" height="53.75" rx="25"
          style={{ ...fillTransition, fill: c.outer }}
        />
        <g filter="url(#filter1_ii_78_61)">
          <rect
            x="7.34998" y="7.34998" width="94.75" height="42" rx="21"
            style={{ ...fillTransition, fill: c.track }}
          />
        </g>
        <g
          filter="url(#filter2_dii_78_61)"
          style={{
            transform: isDark ? "translateX(0px)" : "translateX(-52.25px)",
            transition: "transform 300ms ease",
          }}
        >
          <rect
            x="60.85" y="8.09998" width="40" height="40.25" rx="20"
            style={{ ...fillTransition, fill: c.knob }}
          />
        </g>
      </g>
      <defs>
        <filter id="filter0_di_78_61" x="-2.43187e-05" y="-2.43187e-05" width="114.45" height="59.95" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="2.5" dy="1.75" />
          <feGaussianBlur stdDeviation="1.55" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values={c.f0drop} />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_78_61" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_78_61" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="1.25" dy="1" />
          <feGaussianBlur stdDeviation="0.625" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values={c.f0hl} />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_78_61" />
        </filter>
        <filter id="filter1_ii_78_61" x="5.09998" y="7.34998" width="98.25" height="43" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-2.25" dy="0.25" />
          <feGaussianBlur stdDeviation="1.2375" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values={c.f1in1} />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_78_61" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="1.25" dy="1" />
          <feGaussianBlur stdDeviation="1.875" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values={c.f1in2} />
          <feBlend mode="normal" in2="effect1_innerShadow_78_61" result="effect2_innerShadow_78_61" />
        </filter>
        <filter id="filter2_dii_78_61" x="59.85" y="7.12498" width="43.975" height="44.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="1" dy="1" />
          <feGaussianBlur stdDeviation="0.9875" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values={c.f2drop} />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_78_61" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_78_61" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-1" dy="-0.5" />
          <feGaussianBlur stdDeviation="1.125" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values={c.f2in1} />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_78_61" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="1" dy="1" />
          <feGaussianBlur stdDeviation="0.6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values={c.f2in2} />
          <feBlend mode="normal" in2="effect2_innerShadow_78_61" result="effect3_innerShadow_78_61" />
        </filter>
      </defs>
    </svg>
  );
}

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
      className="flex items-center gap-3.5 text-text-secondary transition-transform duration-150 active:scale-[0.96]"
    >
      <SunIcon className={`h-5 w-5 transition-colors ${isDark ? "" : "text-text-primary"}`} />
      <Switch isDark={isDark} />
      <MoonIcon className={`h-5 w-5 transition-colors ${isDark ? "text-text-primary" : ""}`} />
    </button>
  );
}
