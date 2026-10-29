import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared Open Graph / Twitter card renderer. Used by every opengraph-image /
// twitter-image route. Each card is built to read as a crop of the actual
// site: light surface + dotted grid, the hero's heavy Inter headline, and the
// site's neomorphic pills/panels — all pulled from globals.css tokens.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ─── Site tokens (light mode, from globals.css :root) ───────────────────
const SURFACE = "#f6f6f5";
const MODULE = "#e4e4e6";
const INK = "#1a1a1a";
const MUTED = "#777777";
const ACCENT = "#e85d2c";

// --shadow-raised-sm (light) — used on the cursor pills.
const SHADOW_SM =
  "3px 3px 6px rgba(0,0,0,0.22), 8px 8px 15px rgba(0,0,0,0.07), -3px -3px 8px rgba(255,255,255,0.95), inset 1px 1px 1.5px rgba(255,255,255,1), inset -1px -1px 2px rgba(0,0,0,0.07)";
// --shadow-raised (light) — used on the project visual panel.
const SHADOW =
  "5px 5px 10px rgba(0,0,0,0.22), 14px 14px 28px rgba(0,0,0,0.08), -6px -6px 15px rgba(255,255,255,0.95), inset 2px 2px 3px rgba(255,255,255,1), inset -2px -2px 4px rgba(0,0,0,0.07)";

// .dot-grid — radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1.5px) on a
// 24px grid, as a tiled SVG data URI (reliable in Satori).
const DOT_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='1.2' cy='1.2' r='1.2' fill='rgba(0,0,0,0.07)'/></svg>\")";

async function fonts() {
  const [black, extraBold, medium] = await Promise.all([
    readFile(join(process.cwd(), "src/lib/fonts/Inter-Black.woff")),
    readFile(join(process.cwd(), "src/lib/fonts/Inter-ExtraBold.woff")),
    readFile(join(process.cwd(), "src/lib/fonts/Inter-Medium.woff")),
  ]);
  return [
    { name: "Inter", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Inter", data: extraBold, weight: 800 as const, style: "normal" as const },
    { name: "Inter", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

// Read a /public image as a data URI (embeds at build time). null if missing.
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

// The site's floating cursor: an arrow (SVG) + a neomorphic color pill. `color`
// tints the arrow fill and the pill text; the pill uses the module surface +
// shadow-raised-sm, exactly like .cursor-label.
function Cursor({
  label,
  color,
  left,
  top,
}: {
  label: string;
  color: string;
  left: number;
  top: number;
}) {
  return (
    <div style={{ position: "absolute", left, top, display: "flex" }}>
      {/* 28x30 arrow, scaled up ~1.9x to read at OG size */}
      <svg width={53} height={57} viewBox="0 0 28 30" fill="none">
        <path
          d="M5 3.5 L5 22 L10.2 17.2 L13.6 24.6 L16.7 23.1 L13.1 15.9 L20.4 15.9 Z"
          fill={color}
          stroke="#fff"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 32,
          display: "flex",
          padding: "6px 18px",
          borderRadius: 999,
          backgroundColor: MODULE,
          boxShadow: SHADOW_SM,
          color,
          fontSize: 24,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: SURFACE,
        backgroundImage: DOT_TILE,
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        fontFamily: "Inter",
      }}
    >
      {children}
    </div>
  );
}

export async function homeImage() {
  return new ImageResponse(
    (
      <Surface>
        {/* Centered hero headline, three lines, filling most of the height */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: 108,
              fontWeight: 900,
              color: INK,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
            }}
          >
            <span>Bobo Khat is a</span>
            <span>Product Designer</span>
            <span>and Builder</span>
          </div>
        </div>

        {/* Floating cursor tags — frame the headline like the site: Design
            top-right, Interaction mid-left, Visual lower-right */}
        <Cursor label="Interaction" color="#8b5cf6" left={60} top={352} />
        <Cursor label="Design" color="#ec4899" left={946} top={92} />
        <Cursor label="Visual" color="#22c55e" left={988} top={398} />

        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 54,
            display: "flex",
            fontSize: 26,
            fontWeight: 500,
            color: MUTED,
          }}
        >
          bobokhat.com
        </div>
      </Surface>
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
  // Shrink the title just enough that its longest (unbreakable) word fits the
  // left column, so a long name like "Advertisement" can't overflow into the
  // panel. Short names keep the big 82px size. ~0.56em/char for Inter Black.
  const colText = (hero ? 600 : 1200) - 64 * 2;
  const longestWord = Math.max(...title.split(" ").map((w) => w.length));
  const titleSize = Math.min(82, Math.floor(colText / (longestWord * 0.56)));
  return new ImageResponse(
    (
      <Surface>
        {/* Left: project name (heavy, tight) + subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: hero ? 600 : 1200,
            padding: "72px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 900,
              color: INK,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 500,
              color: MUTED,
              marginTop: 22,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 56,
              left: 64,
              display: "flex",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            <span style={{ color: INK }}>Bobo Khat</span>
            <span style={{ color: MUTED, margin: "0 10px" }}>·</span>
            <span style={{ color: ACCENT }}>bobokhat.com</span>
          </div>
        </div>

        {/* Right: the visual inside a neomorphic panel, like the homepage cards */}
        {hero && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 60,
              right: 56,
              bottom: 60,
              width: 500,
              padding: 18,
              borderRadius: 28,
              backgroundColor: MODULE,
              boxShadow: SHADOW,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              width={464}
              height={474}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
              alt=""
            />
          </div>
        )}
      </Surface>
    ),
    { ...size, fonts: await fonts() },
  );
}
