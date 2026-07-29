import MessageReveal from "./MessageReveal";
import { VolumeInteraction } from "./VolumeInteraction";
import SwipeToLock from "./SwipeToLock";

const MOCEANVAULT_URL = "https://moceanvault.vercel.app/";

// The 3 screens below are real components from the MoceanVault project
// (ported as-is, including their own colors/animation), not recreations.
// Now stacked vertically (was side-by-side) to fill a row-span-2 grid
// cell — each screen uses flex-1 instead of a fixed height so they
// share whatever vertical space the grid gives this card, rather than
// a hardcoded pixel value that would drift out of sync with its
// neighbors' real heights.
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
      <div className="flex h-full flex-col rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)] md:p-8">
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

        <div className="mt-6 flex flex-1 flex-col gap-4">
          <div className="flex flex-1 overflow-hidden rounded-2xl bg-module p-4 shadow-[var(--shadow-raised)]">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface px-4 py-8">
              <MessageReveal />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden rounded-2xl bg-module p-4 shadow-[var(--shadow-raised)]">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface px-4 py-8">
              <VolumeInteraction />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden rounded-2xl bg-module p-4 shadow-[var(--shadow-raised)]">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface px-4 py-8">
              <SwipeToLock />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
