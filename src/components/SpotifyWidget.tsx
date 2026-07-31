"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/*
  Now Playing widget. Polls /api/spotify on mount and every 30s, and locally
  extrapolates playback progress once a second between polls so the recessed
  accent rail glides instead of jumping. Falls back to the static "Nothing
  playing" state whenever the API reports isPlaying:false. When the API returns
  a recently-played track (isCurrentlyPlaying:false), the active progress rail
  is swapped for a small "Last played" label.

  Layout: the whole widget lives in its own raised card that floats on top of
  the (already raised) control bar, with the album art sunk into a recessed
  screen inside it — a raised-on-raised, screen-in-card composition.
*/
type NowPlaying = {
  isPlaying: boolean;
  isCurrentlyPlaying?: boolean;
  track?: string;
  artist?: string;
  albumArt?: string | null;
  progressMs?: number;
  durationMs?: number;
  trackUrl?: string | null;
};

const POLL_MS = 30_000;

// Widget sits directly on the control bar — no container of its own.
const CARD = "flex items-center gap-2.5";
// Album art / icon, recessed into the card like a small screen.
const ART =
  "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-well text-text-secondary shadow-[var(--shadow-recessed-sm)]";

// Milliseconds → m:ss for the knob read-out.
function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function SpotifyWidget() {
  const [data, setData] = useState<NowPlaying>({ isPlaying: false });
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const lastFetchRef = useRef(0);

  // Poll the API on mount + every 30s.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/spotify");
        const json = (await res.json()) as NowPlaying;
        if (cancelled) return;
        setData(json);
        lastFetchRef.current = Date.now();
        setDisplayedProgress(json.progressMs ?? 0);
      } catch {
        // Network hiccup — keep the last good state on screen.
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Extrapolate progress locally once a second between polls, so the rail
  // advances smoothly rather than lurching forward every 30 seconds.
  useEffect(() => {
    if (!data.isPlaying || !data.isCurrentlyPlaying) return;

    const base = data.progressMs ?? 0;
    const duration = data.durationMs ?? 0;

    const id = setInterval(() => {
      const elapsed = Date.now() - lastFetchRef.current;
      setDisplayedProgress(Math.min(base + elapsed, duration));
    }, 1_000);
    return () => clearInterval(id);
  }, [data]);

  // Fallback — the "Nothing playing" state.
  if (!data.isPlaying) {
    return (
      <div className={CARD}>
        <span className={ART}>
          {/* pause icon */}
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <rect x="1" y="1" width="3" height="8" fill="currentColor" />
            <rect x="6" y="1" width="3" height="8" fill="currentColor" />
          </svg>
        </span>
        <div className="flex min-w-0 flex-col items-start gap-0.5 text-left leading-tight">
          <span className="text-xs font-semibold text-text-primary">
            Nothing playing
          </span>
          <span className="text-[10px] text-text-secondary">Spotify</span>
        </div>
      </div>
    );
  }

  const duration = data.durationMs ?? 0;
  const pct =
    duration > 0 ? Math.min(100, (displayedProgress / duration) * 100) : 0;
  const isLive = data.isCurrentlyPlaying ?? false;
  // Live tracks show elapsed time; recently-played reads a zeroed timer.
  const timeLabel = formatTime(isLive ? displayedProgress : 0);

  return (
    <div className={CARD}>
      <span className={ART}>
        {data.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.albumArt}
            alt={data.track ? `${data.track} album art` : ""}
            className="h-full w-full object-cover"
          />
        ) : (
          // music note glyph when art is missing
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path
              d="M8 1 3.5 2v4.2a1.6 1.6 0 1 0 1 1.5V3l2.5-.6v2.9a1.6 1.6 0 1 0 1 1.5V1Z"
              fill="currentColor"
            />
          </svg>
        )}
      </span>

      <div className="flex min-w-0 flex-col items-start gap-0.5 text-left leading-tight">
        <span className="max-w-[140px] truncate text-xs font-semibold text-text-primary">
          {data.track}
        </span>
        <span className="max-w-[140px] truncate text-[10px] text-text-secondary">
          {data.artist}
        </span>
        {!isLive && (
          <span className="mt-0.5 flex items-center gap-1 text-[10px] text-text-secondary">
            <span
              className="h-1 w-1 rounded-full bg-accent"
              aria-hidden="true"
            />
            Last played
          </span>
        )}
      </div>

      {/*
        Neomorphic knob built from the same three layers as the theme toggle
        (raised plate → recessed track → raised accent knob), using the
        toggle-matched shadow tokens. The playback timer fills the recessed
        track's collar clockwise.
      */}
      <div
        className="relative ml-1 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-module shadow-[var(--shadow-raised-sm)]"
        role="img"
        aria-label={isLive ? `${timeLabel} elapsed` : "Last played"}
      >
        {/* Recessed track carrying the conic progress collar */}
        <div
          className="knob-ring grid h-10 w-10 place-items-center rounded-full shadow-[var(--shadow-recessed-sm)]"
          style={{ "--sp-progress": `${isLive ? pct : 0}%` } as CSSProperties}
        >
          {/* Raised knob cap with the timer read-out inside */}
          <span
            className={`grid h-[30px] w-[30px] place-items-center rounded-full bg-surface text-[10px] font-semibold leading-none tabular-nums shadow-[var(--shadow-raised-sm)] ${
              isLive ? "text-text-primary" : "text-text-secondary"
            }`}
            aria-hidden="true"
          >
            {timeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
