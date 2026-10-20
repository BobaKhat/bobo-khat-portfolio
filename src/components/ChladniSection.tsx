"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/*
  Loads the vendored Chladni plate (src/vendor/chladni/) lazily, desktop/
  tablet only. Three gates, in order:
    1. PHONE CHECK — matchMedia, after mount. Must mirror the CSS media
       query on .chladni-section below EXACTLY, or the two disagree about
       who sees it. Phones never get past this, so the chunk is never
       requested — the <section> itself (heading + copy) still renders,
       just hidden by CSS, so there's no JS-dependent flash on desktop.
    2. VIEWPORT PROXIMITY — IntersectionObserver with a 200px rootMargin,
       one-shot. Only once the section is close to scrolling into view do
       we even import the module.
    3. CAPABILITY — the module import resolves to both the component and
       canRunChladni(); we probe before ever rendering the real thing. If
       the probe fails, or the mounted component later calls onFailure
       (e.g. a lost WebGL context), the whole section unmounts. No
       fallback UI — the spec is "remove it", not "explain why".
*/

// Keep this string identical to the @media query in globals.css
// (.chladni-section hide rule) — see the comment there too.
const HIDE_QUERY =
  "(max-width: 599px), (max-height: 599px) and (pointer: coarse)";

const ChladniTones = dynamic(
  () => import("@/vendor/chladni/portfolio/ChladniTones.jsx"),
  { ssr: false, loading: () => null },
);

type Status = "pending" | "ready" | "unsupported" | "failed";
type PlateColors = { bg: string; ink: string };

// Read the exact resolved values of the two tokens the plate needs to match
// its host card: --module (the card surface it sits on) and --text-primary
// (ink). Both live on :root / :root[data-theme="dark"] — reading them here
// rather than hardcoding the hex values means this never drifts from
// globals.css, in light or dark.
function readPlateColors(): PlateColors {
  const style = getComputedStyle(document.documentElement);
  return {
    bg: style.getPropertyValue("--module").trim(),
    ink: style.getPropertyValue("--text-primary").trim(),
  };
}

export default function ChladniSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [eligible, setEligible] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [status, setStatus] = useState<Status>("pending");
  const [colors, setColors] = useState<PlateColors | null>(null);

  // Theme-aware colors: read once on mount, then re-read every time the
  // toggle flips <html data-theme="...">. Cheap (no chladni/three code
  // involved), so this runs unconditionally, not behind the lazy-load
  // gates. The component re-parses colors by value (see colorsKey inside
  // ChladniTones) and applies them to the live sim — no remount, no
  // re-sprinkle, the figure survives the toggle.
  useEffect(() => {
    const update = () => setColors(readPlateColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Gate 1: phone check. Re-evaluated on change (e.g. a window resized
  // across the breakpoint), not just once, but the chunk fetch below only
  // ever fires once (gate 2 disconnects its observer after the first hit).
  useEffect(() => {
    const mql = window.matchMedia(HIDE_QUERY);
    const update = () => setEligible(!mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Gate 2: viewport proximity. Only armed once eligible, so a phone never
  // even sets up the observer.
  useEffect(() => {
    if (!eligible) return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eligible]);

  // Gate 3: capability probe. Imports the module ourselves (same specifier
  // next/dynamic uses below, so webpack dedupes it to one chunk/request)
  // purely to call canRunChladni() before committing to render anything.
  useEffect(() => {
    if (!nearViewport) return;
    let cancelled = false;
    import("@/vendor/chladni/portfolio/ChladniTones.jsx")
      .then((mod) => {
        if (cancelled) return;
        setStatus(mod.canRunChladni() ? "ready" : "unsupported");
      })
      .catch(() => {
        if (!cancelled) setStatus("unsupported");
      });
    return () => {
      cancelled = true;
    };
  }, [nearViewport]);

  if (status === "unsupported" || status === "failed") return null;

  return (
    <section
      ref={sectionRef}
      className="chladni-section relative flex flex-col overflow-hidden rounded-3xl bg-module p-5 shadow-[var(--shadow-raised)] sm:p-6 md:col-span-2"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-accent"
          aria-hidden="true"
        />
        <span className="t-heading text-2xl text-text-primary sm:text-3xl">
          Chladni Plate
        </span>
      </div>
      <p className="t-subtitle mt-2 text-sm text-text-secondary">
        Sound finding its shape — the same physics behind Orion&apos;s
        track visualizer. Tap a tone.
      </p>

      <div className="mx-auto mt-5 aspect-square w-full max-w-[640px]">
        <div className="h-full w-full overflow-hidden rounded-2xl">
          {status === "ready" && (
            <ChladniTones
              unstyled
              className="chladni-fill"
              colors={colors ?? undefined}
              onFailure={() => setStatus("failed")}
            />
          )}
        </div>
      </div>
    </section>
  );
}
