import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";
import SpotifyWidget from "./SpotifyWidget";
import ScrollProgress from "./ScrollProgress";

/*
  Fixed status/control strip. Position (top vs bottom) is still an open
  decision in the spec — using fixed-top for now. Styling is minimal:
  a plain bordered bar rather than the recessed neomorphic surface.
*/
export default function WidgetBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[56px] border-b border-border bg-module">
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
