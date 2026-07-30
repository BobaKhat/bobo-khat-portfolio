import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";
import SpotifyWidget from "./SpotifyWidget";
import ScrollProgress from "./ScrollProgress";

/*
  Single control bar fixed to the top-center of the viewport, above
  everything. Three columns: Spotify on the left, navigation centered in
  the middle, scroll progress + theme toggle on the right.
*/
export default function WidgetBar() {
  return (
    <div className="fixed inset-x-0 top-6 z-[80] flex justify-center px-4">
      <div className="grid w-[min(1200px,100%)] grid-cols-3 items-center gap-6 rounded-full bg-module px-6 py-3 shadow-[var(--shadow-raised)]">
        <div className="flex min-w-0 justify-start">
          <SpotifyWidget />
        </div>
        <div className="flex justify-center">
          <Navigation />
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="w-32">
            <ScrollProgress />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
