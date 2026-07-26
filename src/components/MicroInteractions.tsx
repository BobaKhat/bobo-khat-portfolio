import MessageReveal from "./MessageReveal";
import SwipeToLock from "./SwipeToLock";
import FlashlightToggle from "./FlashlightToggle";

const MOCEANVAULT_URL = "https://moceanvault.vercel.app/";

// The 3 screens below are the real components from the MoceanVault project
// (ported as-is, including their own colors/animation), not recreations —
// only the surrounding bezel is themed to match this site's light/dark mode.
export default function MicroInteractions() {
  return (
    <section id="micro-interactions" className="scroll-mt-20 py-2">
      <div className="rounded-3xl border border-border bg-module p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-wider text-text-secondary">
                Microinteractions
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm text-text-secondary">
              A sneak peek at my new project — launching on a new site soon.
            </p>
          </div>
          <a
            href={MOCEANVAULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-1.5 text-xs text-text-primary transition-colors hover:text-accent"
          >
            See all 18 on MoceanVault
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Tap to reveal message — needs a dark backdrop, brings its own status caption */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface p-2">
            <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-[#141414] px-4 py-8">
              <MessageReveal />
            </div>
          </div>

          {/* Swipe to lock — needs a dark backdrop, brings its own status caption */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface p-2">
            <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-[#141414] px-4 py-8">
              <SwipeToLock />
            </div>
          </div>

          {/* Flashlight toggle — needs a dark backdrop for its glow to read */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface p-2">
            <div className="flex h-[420px] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-[#141414] px-4 py-8">
              <FlashlightToggle />
              <p className="text-center font-mono text-[10px] uppercase tracking-wider text-[#4a4a48]">
                Tap to toggle
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
