"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ArrowGlyph from "./ArrowGlyph";
import { SpotlightOverlay, SpotlightCaption } from "./Spotlight";

export type ProjectCardProps = {
  index: string;
  title: string;
  subtitle: string;
  tag?: string;
  href: string;
  image?: string;
  video?: string;
  /** Optional video that fades in and plays only while the card is hovered
   *  (over the static `image`, which acts as the resting poster). */
  hoverVideo?: string;
  videoScale?: number;
  videoRadius?: number;
  /** Clip N px off the top edge of the video (keeps the rounded corners). */
  videoClipTop?: number;
  size?: "large" | "small";
  id?: string;
};

export default function ProjectCard({
  title,
  subtitle,
  tag,
  href,
  image,
  video,
  hoverVideo,
  videoScale,
  videoRadius,
  videoClipTop,
  size = "large",
  id,
}: ProjectCardProps) {
  const isExternal = href.startsWith("http");
  const [arrowHover, setArrowHover] = useState(false);

  // Hover-to-play for `hoverVideo`: play on card enter, reset on leave.
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const playHover = () => {
    hoverVideoRef.current?.play().catch(() => {});
  };
  const stopHover = () => {
    const v = hoverVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  // The <a>/<Link> is only a positioning + stacking wrapper — it must NOT
  // carry a transform, or the fixed spotlight overlay below would resolve
  // against it instead of the viewport. The visual card styling (and the
  // hover lift) live on the inner div.
  const wrapperClassName = `group relative block scroll-mt-20 ${
    arrowHover ? "z-[70]" : ""
  }`;

  const content = (
    <>
      <SpotlightOverlay active={arrowHover} />

      <div className="relative z-[1] flex flex-col overflow-hidden rounded-3xl bg-module p-5 shadow-[var(--shadow-raised)] transition-transform duration-300 group-hover:-translate-y-1 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="min-w-0">
            <h3
              className={`t-heading ${
                size === "large" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              } text-text-primary`}
            >
              {title}
            </h3>
            <p className="t-subtitle mt-1 text-sm text-text-secondary">
              {subtitle}
            </p>
          </div>
          {/* Tag, with the arrow button below it. min-w-0 (not shrink-0) so on
              a narrow card the tag wraps instead of forcing the row wider than
              the card and bleeding out the side. */}
          <div className="ml-auto flex min-w-0 flex-col items-end gap-3">
            {tag && (
              <p className="text-right t-eyebrow text-text-secondary">{tag}</p>
            )}
            <div
              className="relative"
              onMouseEnter={() => setArrowHover(true)}
              onMouseLeave={() => setArrowHover(false)}
            >
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                <ArrowGlyph />
              </span>
              <SpotlightCaption label={title} active={arrowHover} align="right" />
            </div>
          </div>
        </div>

        {/* Divider between the header and the work */}
        <div className="my-5 border-t border-text-secondary/30" />

        <div
          className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl ${
            size === "large" ? "aspect-[16/10]" : "aspect-[16/11]"
          }`}
        >
          {video ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className={
                videoScale != null
                  ? "h-full w-auto object-contain"
                  : "h-full w-full object-contain"
              }
              style={{
                ...(videoScale ? { transform: `scale(${videoScale})` } : {}),
                ...(videoRadius != null ? { borderRadius: `${videoRadius}px` } : {}),
                ...(videoClipTop
                  ? {
                      clipPath: `inset(${videoClipTop}px 0 0 0 round ${
                        videoRadius ?? 0
                      }px)`,
                    }
                  : {}),
              }}
            />
          ) : image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${title} — ${subtitle}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {hoverVideo && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  ref={hoverVideoRef}
                  src={hoverVideo}
                  poster={image}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-text-secondary">
              {title} screenshot
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        id={id}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClassName}
        onMouseEnter={playHover}
        onMouseLeave={stopHover}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      id={id}
      className={wrapperClassName}
      onMouseEnter={playHover}
      onMouseLeave={stopHover}
    >
      {content}
    </Link>
  );
}
