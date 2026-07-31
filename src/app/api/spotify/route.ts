import { NextResponse } from "next/server";

/*
  Spotify Now Playing route.

  Reads credentials from env (see CLAUDE.md — Environment Variables). Refreshes
  an access token via the refresh-token grant, then reads the currently-playing
  track; when nothing is playing it falls back to the most recently played
  track (flagged isCurrentlyPlaying:false). Any failure resolves to
  { isPlaying: false } so the widget never breaks or throws a 500.
*/

// Never cache — the response reflects live playback state.
export const dynamic = "force-dynamic";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const CURRENTLY_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const NOT_PLAYING = { isPlaying: false } as const;

type SpotifyArtist = { name: string };
type SpotifyImage = { url: string };
type SpotifyTrack = {
  name: string;
  artists?: SpotifyArtist[];
  album?: { images?: SpotifyImage[] };
  duration_ms?: number;
  external_urls?: { spotify?: string };
};

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string | null> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

function normalizeTrack(
  track: SpotifyTrack,
  {
    isCurrentlyPlaying,
    progressMs,
  }: { isCurrentlyPlaying: boolean; progressMs: number }
) {
  return {
    isPlaying: true,
    isCurrentlyPlaying,
    track: track.name,
    artist: (track.artists ?? []).map((a) => a.name).join(", "),
    albumArt: track.album?.images?.[0]?.url ?? null,
    progressMs,
    durationMs: track.duration_ms ?? 0,
    trackUrl: track.external_urls?.spotify ?? null,
  };
}

async function getRecentlyPlayed(accessToken: string) {
  const res = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json(NOT_PLAYING);

  const data = (await res.json()) as {
    items?: { track?: SpotifyTrack }[];
  };
  const track = data.items?.[0]?.track;
  if (!track) return NextResponse.json(NOT_PLAYING);

  return NextResponse.json(
    normalizeTrack(track, { isCurrentlyPlaying: false, progressMs: 0 })
  );
}

export async function GET() {
  try {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
      process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
      return NextResponse.json(NOT_PLAYING);
    }

    const accessToken = await getAccessToken(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN
    );
    if (!accessToken) return NextResponse.json(NOT_PLAYING);

    const res = await fetch(CURRENTLY_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    // 204 No Content = nothing currently playing → fall back to recent.
    if (res.status === 204) {
      return getRecentlyPlayed(accessToken);
    }

    if (!res.ok) return NextResponse.json(NOT_PLAYING);

    const data = (await res.json()) as {
      item?: SpotifyTrack | null;
      progress_ms?: number | null;
      is_playing?: boolean;
    };

    // No item (e.g. ad break, private session) → fall back to recent.
    if (!data.item) {
      return getRecentlyPlayed(accessToken);
    }

    return NextResponse.json(
      normalizeTrack(data.item, {
        isCurrentlyPlaying: data.is_playing ?? true,
        progressMs: data.progress_ms ?? 0,
      })
    );
  } catch {
    return NextResponse.json(NOT_PLAYING);
  }
}
