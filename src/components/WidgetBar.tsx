import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";
import SpotifyWidget from "./SpotifyWidget";
import ScrollProgress from "./ScrollProgress";

/*
  Fixed status/control strip, inset from the screen edges with rounded
  corners rather than flush edge-to-edge — matches the softer, "nothing
  touches the raw edge" treatment used across the rest of the site.
  Position (top vs bottom) is still an open decision in the spec — using
  fixed-top for now.
*/
export default function WidgetBar() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 h-[56px] rounded-2xl border border-border bg-module">
      <div className="mx-auto flex h-full max-w-[1300px] items-center justify-between gap-6 px-3">
        <div className="flex items-center gap-6">
          <SpotifyWidget />
          <div className="hidden sm:block">
            <Clock />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <ScrollProgress />
          </div>
          {/* Availability */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">
              Open to new work
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
