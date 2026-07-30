import { VolumeInteraction } from "./VolumeInteraction";
import { NetworthChart } from "./NetworthChart";
import { BookingButton } from "./BookingButton";
import ArrowGlyph from "./ArrowGlyph";

const MOCEANVAULT_URL = "https://moceanvault.vercel.app/";

// The 3 screens below are real components from the MoceanVault project
// (ported as-is, including their own colors/animation), not recreations.
// Both the outer bezel and the inner screen follow the site's light/dark
// theme via bg-module/bg-surface — the components' own internal colors
// are untouched, so some elements (pale text, glow effects calibrated
// for black) may be hard to read in light mode.
//
// Each demo is sized to its own natural content height (not forced to
// share equal space) — some of these are inherently smaller than
// others, and stretching everything to match the tallest one looked
// artificial. If the three combined don't fill the full card height,
// that's expected — genuine breathing room, not a bug.
export default function MicroInteractions({
  className = "",
}: {
  className?: string;
}) {
  return (
    <section
      id="micro-interactions"
      className={`scroll-mt-20 flex h-full flex-col ${className}`}
    >
      <div className="relative flex h-full flex-col rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span className="t-eyebrow text-text-secondary">
                Microinteractions
              </span>
            </div>
            <p className="t-subtitle mt-2 max-w-md text-sm text-text-secondary">
              A sneak peek at my new project — launching on a new site soon.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <a
              href={MOCEANVAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-secondary transition-colors hover:text-accent"
            >
              See all 18 on MoceanVault
            </a>
            <a
              href={MOCEANVAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="See all 18 on MoceanVault"
              className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 hover:bg-accent hover:text-white"
            >
              <ArrowGlyph />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl bg-module p-4 shadow-[var(--shadow-raised)]">
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-well px-4 py-8 shadow-[var(--shadow-recessed)]">
              <NetworthChart />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-module p-4 shadow-[var(--shadow-raised)]">
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-well px-4 py-6 shadow-[var(--shadow-recessed)]">
              <VolumeInteraction />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-module p-4 shadow-[var(--shadow-raised)]">
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-well px-4 py-6 shadow-[var(--shadow-recessed)]">
              <BookingButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
