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
    <div className="fixed inset-x-0 top-4 z-[80] flex justify-center px-3 sm:top-6 sm:px-4">
      {/*
        Mobile: a simple flex row with just the two essential controls
        (navigation + theme toggle) so nothing overflows the pill. From md up
        it becomes the three-column layout with Spotify + scroll progress.
      */}
      <div className="flex w-[min(1200px,100%)] items-center justify-between gap-2 rounded-full bg-module px-3 py-2 shadow-[var(--shadow-raised)] md:grid md:grid-cols-3 md:gap-6 md:px-6 md:py-3">
        <div className="hidden min-w-0 md:flex md:justify-start">
          <SpotifyWidget />
        </div>
        <div className="flex min-w-0 justify-center">
          <Navigation />
        </div>
        <div className="flex items-center justify-end gap-3 md:gap-4">
          {/* Hidden below lg: between md and ~980px the centered nav overflows
              its column and "Resume" collides with the progress rail, so only
              show it once the bar is wide enough to clear the nav. */}
          <div className="hidden w-32 lg:block">
            <ScrollProgress />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
