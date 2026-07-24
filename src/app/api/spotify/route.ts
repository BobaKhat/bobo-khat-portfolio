import { NextResponse } from "next/server";

/*
  Spotify Now Playing route.

  Reads credentials from env (see CLAUDE.md — Environment Variables). Until
  SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN are set, it
  fails gracefully to the "not playing" state so the widget always renders.

  Full token-refresh + currently-playing implementation lands in Phase 4.
*/

const NOT_PLAYING = { isPlaying: false } as const;

export async function GET() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json(NOT_PLAYING);
  }

  // TODO(phase-4): exchange the refresh token for an access token and call
  // https://api.spotify.com/v1/me/player/currently-playing.
  return NextResponse.json(NOT_PLAYING);
}
