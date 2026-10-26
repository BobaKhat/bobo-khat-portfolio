import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared Open Graph / Twitter card renderer. Used by every opengraph-image /
// twitter-image route. Matches the site: dark surface, burnt-orange accent,
// and a heavy Inter (an SF-Pro-like stand-in for the system headline font).

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SURFACE = "#1a1a1a";
const INK = "#e8e6e3";
const MUTED = "#8f8f8f";
const ACCENT = "#E85D2C";

async function fonts() {
  const [extraBold, medium] = await Promise.all([
    readFile(join(process.cwd(), "src/lib/fonts/Inter-ExtraBold.woff")),
    readFile(join(process.cwd(), "src/lib/fonts/Inter-Medium.woff")),
  ]);
  return [
    { name: "Inter", data: extraBold, weight: 800 as const, style: "normal" as const },
    { name: "Inter", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

// Read a /public image as a data URI (so it embeds at build time). null if
// the file isn't there.
async function publicImageDataUri(path: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", path));
    const ext = path.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function homeImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: SURFACE,
          padding: "76px 84px",
          position: "relative",
          fontFamily: "Inter",
        }}
      >
        <div style={{ width: 68, height: 8, backgroundColor: ACCENT, borderRadius: 4, marginBottom: 40 }} />
        <div style={{ fontSize: 108, fontWeight: 800, color: INK, letterSpacing: "-0.03em", lineHeight: 1 }}>
          Bobo Khat
        </div>
        <div style={{ fontSize: 50, fontWeight: 800, color: INK, letterSpacing: "-0.02em", marginTop: 20 }}>
          Product Designer and Builder
        </div>
        <div style={{ fontSize: 27, fontWeight: 500, color: MUTED, marginTop: 30 }}>
          prev @ MyShake · UC Berkeley Cognitive Science
        </div>
        <div style={{ position: "absolute", bottom: 60, right: 84, fontSize: 26, fontWeight: 500, color: ACCENT }}>
          bobokhat.com
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}

export async function projectImage({
  title,
  subtitle,
  heroPath,
}: {
  title: string;
  subtitle: string;
  heroPath?: string;
}) {
  const hero = heroPath ? await publicImageDataUri(heroPath) : null;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: SURFACE,
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "72px",
            position: "relative",
          }}
        >
          <div style={{ width: 56, height: 7, backgroundColor: ACCENT, borderRadius: 4, marginBottom: 34 }} />
          <div style={{ fontSize: 72, fontWeight: 800, color: INK, letterSpacing: "-0.02em", lineHeight: 1.02 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: MUTED,
              marginTop: 20,
              maxWidth: hero ? 560 : 940,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
          <div style={{ position: "absolute", bottom: 64, left: 72, display: "flex", fontSize: 24, fontWeight: 500 }}>
            <span style={{ color: INK }}>Bobo Khat</span>
            <span style={{ color: MUTED, margin: "0 10px" }}>·</span>
            <span style={{ color: ACCENT }}>bobokhat.com</span>
          </div>
        </div>
        {hero && (
          <div style={{ display: "flex", width: 462, height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} width={462} height={630} style={{ width: 462, height: 630, objectFit: "cover" }} alt="" />
          </div>
        )}
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
