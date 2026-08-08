"use client";

import { useEffect, useRef, useState } from "react";
import { Inter, Poppins, Plus_Jakarta_Sans } from "next/font/google";

/**
 * MyShake "Critical Alert Near You" — interactive prototype.
 * Recreated natively from the Figma frame (node 0:38) with the real exported
 * assets. Countdown ticks down to zero, then the card shakes and the
 * TAKE COVER / GET DOWN warnings pop out to either side, then it loops.
 */

const poppins = Poppins({ subsets: ["latin"], weight: ["700"], variable: "--msa-poppins" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["700", "800"], variable: "--msa-jakarta" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--msa-inter" });

const START = 6;
const END = -6;
const RADIUS = 68;
const CIRC = 2 * Math.PI * RADIUS;
const PHONE_W = 393;
const PHONE_H = 780;
const PAD = 40; // vertical breathing room around the scaled phone
const MAX_STAGE_H = 620; // cap the widget height so it isn't oversized

const ASSET = "/images/case-studies/myshake/alert";

// Inline icon paths — identical glyphs to the Figma info-row icons.
const ICON = {
  locPin:
    "M16.6667 8.33333C16.6667 12.4942 12.0508 16.8275 10.5008 18.1658C10.3564 18.2744 10.1807 18.3331 10 18.3331C9.81933 18.3331 9.64356 18.2744 9.49917 18.1658C7.94917 16.8275 3.33333 12.4942 3.33333 8.33333C3.33333 6.56522 4.03571 4.86953 5.28595 3.61929C6.5362 2.36905 8.23189 1.66667 10 1.66667C11.7681 1.66667 13.4638 2.36905 14.714 3.61929C15.9643 4.86953 16.6667 6.56522 16.6667 8.33333Z",
  locDot:
    "M10 10.8333C11.3807 10.8333 12.5 9.71405 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71405 8.61929 10.8333 10 10.8333Z",
  magnitude:
    "M20.8333 10.8333H18.3533C17.9163 10.8324 17.491 10.9746 17.1425 11.2383C16.7939 11.502 16.5413 11.8725 16.4233 12.2933L14.0733 20.6533C14.0582 20.7053 14.0266 20.7509 13.9833 20.7833C13.9401 20.8158 13.8874 20.8333 13.8333 20.8333C13.7792 20.8333 13.7266 20.8158 13.6833 20.7833C13.6401 20.7509 13.6085 20.7053 13.5933 20.6533L8.07333 1.01333C8.05819 0.961405 8.02661 0.915789 7.98333 0.883333C7.94006 0.850878 7.88743 0.833333 7.83333 0.833333C7.77924 0.833333 7.72661 0.850878 7.68333 0.883333C7.64006 0.915789 7.60848 0.961405 7.59333 1.01333L5.24333 9.37333C5.1258 9.79249 4.87471 10.1618 4.5282 10.4253C4.18168 10.6888 3.75865 10.8321 3.32333 10.8333H0.833333",
  distance:
    "M3.09383 0C1.74134 0 0.387151 1.02155 0.387151 3.06464L3.09383 8.5129L5.79882 3.06464C5.79882 1.02155 4.44632 0 3.09383 0ZM3.09383 1.70258C3.84193 1.70258 4.44632 2.31253 4.44632 3.06464C4.44632 3.81803 3.84193 4.42671 3.09383 4.42671C2.347 4.42671 1.74134 3.81803 1.74134 3.06464C1.74134 2.31253 2.347 1.70258 3.09383 1.70258ZM17.295 10.2155C15.9425 10.2155 14.59 11.237 14.59 13.2801L17.295 18.7284L20 13.2801C20 11.237 18.6475 10.2155 17.295 10.2155ZM17.295 11.9181C18.0431 11.9181 18.6475 12.5267 18.6475 13.2801C18.6475 14.0335 18.0431 14.6422 17.295 14.6422C16.5469 14.6422 15.9425 14.0335 15.9425 13.2801C15.9425 12.5267 16.5469 11.9181 17.295 11.9181Z",
};

function CountdownRing({ timeLeft }: { timeLeft: number }) {
  const progress = Math.max(0, Math.min(1, timeLeft / START));
  const prev = useRef(progress);
  const isReset = progress > prev.current;
  prev.current = progress;
  return (
    <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
      <svg
        className={"msa-ring absolute block h-full w-full" + (isReset ? " msa-ring-reset" : "")}
        style={{ transform: "rotate(-90deg)" }}
        fill="none"
        viewBox="0 0 150 150"
      >
        <circle cx="75" cy="75" r={RADIUS} stroke="#E5EBEB" strokeWidth="6" />
        <circle
          className="msa-ring-progress"
          cx="75"
          cy="75"
          r={RADIUS}
          stroke="#EB1000"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: "0 18px" }}>
        {timeLeft > 0 ? (
          <>
            <p style={{ fontFamily: "var(--msa-poppins)", fontWeight: 700, lineHeight: "54px", color: "#eb1000", fontSize: 48, margin: 0 }}>
              {timeLeft}
            </p>
            <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 600, lineHeight: "20px", color: "#90adad", fontSize: 12, margin: 0 }}>
              SECONDS
            </p>
          </>
        ) : (
          <p style={{ fontFamily: "var(--msa-poppins)", fontWeight: 700, lineHeight: "24px", color: "#eb1000", fontSize: 18, margin: 0 }}>
            SHAKING HAPPENING NOW
          </p>
        )}
      </div>
    </div>
  );
}

function IntensityBar({ height, label, active }: { height: number; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 8, width: 56 }}>
      <div style={{ height, width: "100%", borderRadius: 8, background: active ? "#eb1000" : "#e5ebeb" }} />
      <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 600, fontSize: 10, lineHeight: "12px", textAlign: "center", color: active ? "#435b5b" : "#becfcf", margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

function InfoCol({ children, value, label }: { children: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-end" style={{ gap: 8, width: 83.667 }}>
      {children}
      <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "#435b5b", margin: 0 }}>{value}</p>
      <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 400, fontSize: 12, lineHeight: "20px", color: "#90adad", margin: 0 }}>{label}</p>
    </div>
  );
}

function VDivider() {
  return <div style={{ width: 0, height: 76, borderLeft: "0.5px solid #CAD8D8" }} />;
}

const warnStyle: React.CSSProperties = {
  fontFamily: "var(--msa-jakarta)",
  fontWeight: 800,
  fontStyle: "italic",
  fontSize: 72,
  lineHeight: 0.8,
  color: "#fff",
  whiteSpace: "nowrap",
  margin: 0,
  textShadow: "6px 6px 0px #eb1000, 12px 12px 15px rgba(0,0,0,0.5)",
};

export default function MyShakeAlert() {
  const [timeLeft, setTimeLeft] = useState(START);
  const isShaking = timeLeft <= 0;
  const showGetDown = timeLeft <= -2;

  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p <= END ? START : p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Measure the stage width on mount and on viewport resize. We deliberately
    // avoid ResizeObserver here: the stage's own height is derived from `scale`,
    // so observing the stage would create a resize→setScale→resize feedback loop.
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const widthScale = (el.clientWidth - 16) / PHONE_W;
      const heightScale = (MAX_STAGE_H - PAD) / PHONE_H;
      const next = Math.min(1, Math.max(0.5, Math.min(widthScale, heightScale)));
      setScale((prev) => (Math.abs(prev - next) > 0.005 ? next : prev));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={stageRef}
      className={`${poppins.variable} ${jakarta.variable} ${inter.variable} flex w-full items-center justify-center overflow-hidden`}
      style={{ height: Math.round(PHONE_H * scale + PAD) }}
    >
      <div className="relative flex items-center justify-center" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        {isShaking && (
          <div className="msa-warn-left pointer-events-none absolute z-50 select-none" style={{ perspective: 1000 }}>
            <h1 className="msa-warn-text" style={warnStyle}>
              TAKE
              <br />
              COVER
            </h1>
          </div>
        )}
        {showGetDown && (
          <div className="msa-warn-right pointer-events-none absolute z-50 select-none" style={{ perspective: 1000 }}>
            <h1 className="msa-warn-text" style={{ ...warnStyle, textAlign: "right" }}>
              GET
              <br />
              DOWN
            </h1>
          </div>
        )}

        <div
          className={"relative z-10 overflow-hidden bg-white" + (isShaking ? " msa-shake" : "")}
          style={{ border: "3px solid #eb1000", borderRadius: 18, width: PHONE_W, height: PHONE_H, boxShadow: "0px 1px 4px 0px rgba(0,0,0,0.1)" }}
        >
          {/* Header */}
          <div className="absolute flex items-center justify-center" style={{ background: "#eb1000", gap: 10, left: -5, top: -9, width: 399, padding: "8px 10px" }}>
            <div style={{ fontFamily: "var(--msa-jakarta)", fontWeight: 700, color: "#f9fbfb", fontSize: 24, textAlign: "center", width: 263 }}>
              <p style={{ lineHeight: "36px", margin: 0 }}>Critical </p>
              <p style={{ lineHeight: "36px", margin: 0 }}>Alert Near You</p>
            </div>
            <div className="absolute" style={{ left: 347, top: 16, width: 36, height: 36 }}>
              <svg style={{ position: "absolute", inset: "38.89% 37.54% 37.54% 38.89%", overflow: "visible" }} viewBox="0 0 10.4853 10.4853" fill="none">
                <path d="M1 1L9.48528 9.48528" stroke="white" strokeLinecap="round" strokeWidth="2" />
                <path d="M1 9.48529L9.48528 1.00001" stroke="white" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Top section */}
          <div className="absolute flex flex-col items-center" style={{ left: "50%", transform: "translateX(-50%)", top: 95, width: 367, gap: 24 }}>
            <div className="flex w-full flex-col items-start" style={{ gap: 8 }}>
              <div className="w-full" style={{ background: "#f9fbfb", border: "1px solid #e5ebeb", borderRadius: 18, padding: 16, boxSizing: "border-box" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Drop, Cover, and Hold On — earthquake safety instructions"
                  src={`${ASSET}/drop-cover-hold-on.jpg`}
                  style={{ width: "100%", aspectRatio: "970/318", objectFit: "cover", display: "block" }}
                />
              </div>
              <div className="flex w-full items-center justify-center" style={{ gap: 205 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="ShakeAlert" src={`${ASSET}/shakealert-logo.png`} style={{ height: 20, width: 90.526, objectFit: "contain" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Earthquake Warning California" src={`${ASSET}/eq-warning-california-logo.png`} style={{ height: 20, width: 65.263, objectFit: "contain" }} />
              </div>
            </div>
            <div className="flex flex-col items-center" style={{ gap: 16, width: 254 }}>
              <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 600, fontSize: 12, lineHeight: "20px", color: "#90adad", textAlign: "center", margin: 0, minWidth: "100%" }}>
                {timeLeft > 0 ? "ESTIMATED SHAKING ARRIVAL" : " "}
              </p>
              <CountdownRing timeLeft={timeLeft} />
            </div>
          </div>

          {/* Bottom card */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: "50%", transform: "translateX(-50%)", top: 491, width: 367, gap: 24, background: "#f9fbfb", border: "1px solid #e5ebeb", borderRadius: 18, padding: 16, boxSizing: "border-box" }}
          >
            <div className="flex w-full flex-col items-center" style={{ gap: 8 }}>
              <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "#435b5b", textAlign: "center", margin: 0 }}>
                Strength : Moderate to Strong
              </p>
              <p style={{ fontFamily: "var(--msa-inter)", fontWeight: 400, fontSize: 12, lineHeight: "20px", color: "#90adad", textAlign: "center", margin: 0 }}>
                Noticeable shaking expected. Loose objects may fall
              </p>
              <div className="flex items-end" style={{ gap: 8 }}>
                <IntensityBar height={7} label="Light" active />
                <IntensityBar height={14} label="Moderate" active />
                <IntensityBar height={21} label="Strong" active />
                <IntensityBar height={28} label="Severe" active={false} />
              </div>
            </div>
            <div style={{ width: "100%", borderTop: "0.5px solid #CAD8D8" }} />
            <div className="flex items-center" style={{ gap: 21 }}>
              <InfoCol value="Burbank" label="Location">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d={ICON.locPin} stroke="#6A7282" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d={ICON.locDot} stroke="#6A7282" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </InfoCol>
              <VDivider />
              <InfoCol value="4.8" label="Magnitude">
                <svg width="20" height="20" viewBox="0 0 21.6667 21.6667" fill="none" style={{ overflow: "visible" }}>
                  <path d={ICON.magnitude} stroke="#6A7282" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </InfoCol>
              <VDivider />
              <InfoCol value="6.2 mi" label="Distance">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d={ICON.distance} fill="#435B5B" />
                </svg>
              </InfoCol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
