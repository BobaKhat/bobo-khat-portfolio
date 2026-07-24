"use client";

/*
  Placeholder Now Playing widget.
  Phase 4 will wire this to /api/spotify (currently-playing endpoint) and
  poll every 30s. For now it renders the "Nothing playing" fallback state.
*/
export default function SpotifyWidget() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-secondary">
        {/* pause icon */}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <rect x="1" y="1" width="3" height="8" fill="currentColor" />
          <rect x="6" y="1" width="3" height="8" fill="currentColor" />
        </svg>
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-text-primary">Nothing playing</span>
        <span className="text-[10px] text-text-secondary">Spotify</span>
      </div>
    </div>
  );
}
