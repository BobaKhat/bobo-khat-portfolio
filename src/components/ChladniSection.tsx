"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useKeyReleaseReveal } from "@/hooks/useKeyReleaseReveal";

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

// Vendored tone presets — must match the labels the plate's own buttons render.
const TONES = ["244 Hz", "410 Hz", "1527 Hz", "1752 Hz", "3846 Hz"];

type Status = "pending" | "ready" | "unsupported" | "failed";
type PlateColors = { ink: string };

// Read the exact resolved value of --text-primary (ink). No bg is read or
// passed — colors={{ ink }} with bg omitted selects the vendor's
// TRUE-TRANSPARENT mode, so the plate composites straight onto the card
// surface behind it instead of painting its own background.
function readPlateColors(): PlateColors {
  const style = getComputedStyle(document.documentElement);
  return {
    ink: style.getPropertyValue("--text-primary").trim(),
  };
}

export default function ChladniSection() {
  const sectionRef = useRef<HTMLElement>(null);
  // The outer frame is a neomorphic card, so it gets the key-release reveal.
  // Merge the reveal ref with sectionRef (used for the lazy-load gate below)
  // since both need the same <section> element.
  const revealRef = useKeyReleaseReveal<HTMLElement>();
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      revealRef.current = node;
    },
    [revealRef],
  );
  const [eligible, setEligible] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [status, setStatus] = useState<Status>("pending");
  const [colors, setColors] = useState<PlateColors | null>(null);

  // Hz tone presets (stable vendored config). We render our own buttons so they
  // can sit beside the plaque, and proxy clicks to the real (visually hidden)
  // vendor controls inside .chladni-controls, which drive the plate.
  const [activeTone, setActiveTone] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const selectTone = (label: string) => {
    sectionRef.current
      ?.querySelectorAll<HTMLButtonElement>(".chladni-controls .chladni-tone")
      .forEach((b) => {
        if (b.textContent?.trim() === label) b.click();
      });
    setActiveTone(label);
  };
  const toggleMute = () => {
    sectionRef.current
      ?.querySelector<HTMLButtonElement>(".chladni-controls .chladni-mute")
      ?.click();
    setMuted((m) => !m);
  };

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
      ref={setSectionRef}
      className="chladni-section reveal-card reveal-card--no-scale relative rounded-3xl bg-module p-[45px] md:col-span-2"
    >
      {/* Key-release status LED */}
      <span aria-hidden="true" className="reveal-led" />
      {/* Raised 15px frame (above) around a sunken well showing the page's
          own surface + dot-grid texture, not the card color — a deliberate
          one-off: nothing else on the site is framed this way. */}
      <div className="chladni-well relative flex flex-col items-center rounded-2xl p-5 sm:p-6">
        {/* Heading plaque — centered at the top, text centered */}
        <div className="rounded-2xl bg-module px-5 py-4 text-center shadow-[var(--shadow-raised)] sm:px-6 sm:py-5">
          <span className="block t-heading text-2xl text-text-primary sm:text-3xl">
            Chladni Plate
          </span>
          <p className="t-subtitle mt-2 text-sm text-text-secondary">
            Sound finding its shape — the same physics behind Orion&apos;s
            track visualizer. Tap a tone.
          </p>
        </div>

        {/* Hz buttons — centered below the plaque. Our own buttons (reusing the
            vendor button styles) that proxy clicks to the hidden vendor
            controls. */}
        {status === "ready" && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                className="chladni-tone"
                aria-pressed={activeTone === t}
                onClick={() => selectTone(t)}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              className="chladni-mute"
              aria-pressed={muted}
              onClick={toggleMute}
            >
              Mute
            </button>
          </div>
        )}

        {/* Plate — centered, self-sizing square (globals.css fills the host). */}
        <div className="mt-6 w-full max-w-[640px]">
          <div className="aspect-square w-full overflow-hidden rounded-2xl">
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
      </div>
    </section>
  );
}
