import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";
import SpotifyWidget from "./SpotifyWidget";
import ScrollProgress from "./ScrollProgress";
import Navigation from "./Navigation";

/*
  Fixed status/control strip, inset from the screen edges with rounded
  corners rather than flush edge-to-edge — matches the softer, "nothing
  touches the raw edge" treatment used across the rest of the site.
  Position (top vs bottom) is still an open decision in the spec — using
  fixed-top for now.
*/
export default function WidgetBar() {
  return (
    <header className="fixed inset-x-3 top-3 z-50 h-[76px] rounded-full bg-module shadow-[var(--shadow-raised)]">
      <div className="mx-auto flex h-full max-w-[1800px] items-center justify-between gap-8 px-5">
        <div className="flex items-center gap-8">
          <SpotifyWidget />
          <div className="hidden sm:block">
            <Clock />
          </div>
        </div>
        <Navigation />
        <div className="flex items-center gap-8">
          <div className="hidden md:block">
            <ScrollProgress />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
