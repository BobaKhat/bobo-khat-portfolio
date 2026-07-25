import MicroScreen from "./MicroScreen";
import NetWorthChart from "./NetWorthChart";
import SwipeToLock from "./SwipeToLock";
import VolumeHold from "./VolumeHold";

const MOCEANVAULT_URL = "https://moceanvault.vercel.app/";

export default function MicroInteractions() {
  return (
    <section id="micro-interactions" className="scroll-mt-20 py-2">
      <div className="rounded-2xl border border-border bg-module p-6 md:p-8">
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
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-2">
            <MicroScreen
              footer={
                <p className="text-center font-mono text-[10px] text-[#55554e]">
                  hover to inspect
                </p>
              }
            >
              <NetWorthChart />
            </MicroScreen>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-2">
            <MicroScreen>
              <SwipeToLock />
            </MicroScreen>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-2">
            <MicroScreen
              footer={
                <p className="text-center font-mono text-[10px] text-[#55554e]">
                  Hold the button to increase volume
                </p>
              }
            >
              <VolumeHold />
            </MicroScreen>
          </div>
        </div>
      </div>
    </section>
  );
}
