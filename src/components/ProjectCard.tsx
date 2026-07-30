"use client";

import Link from "next/link";
import { useState } from "react";
import ArrowGlyph from "./ArrowGlyph";
import { SpotlightOverlay, SpotlightCaption } from "./Spotlight";

export type ProjectCardProps = {
  index: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  image?: string;
  video?: string;
  videoScale?: number;
  videoRadius?: number;
  size?: "large" | "small";
  id?: string;
};

export default function ProjectCard({
  index,
  title,
  subtitle,
  tag,
  href,
  image,
  video,
  videoScale,
  videoRadius,
  size = "large",
  id,
}: ProjectCardProps) {
  const isExternal = href.startsWith("http");
  const [arrowHover, setArrowHover] = useState(false);

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

      <div className="relative z-[1] flex flex-col overflow-hidden rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)] transition-transform duration-300 group-hover:-translate-y-1">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="t-stat text-sm text-accent">{index}</span>
              <h3
                className={`t-heading ${
                  size === "large" ? "text-2xl" : "text-xl"
                } text-text-primary`}
              >
                {title}
              </h3>
            </div>
            <p className="t-subtitle mt-1 text-sm text-text-secondary">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <p className="text-right t-eyebrow text-text-secondary">{tag}</p>
          </div>
        </div>

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
              }}
            />
          ) : image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={`${title} — ${subtitle}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-text-secondary">
              {title} screenshot
            </div>
          )}
        </div>
      </div>

      {/* Arrow + reveal caption. Kept outside the overflow-hidden card body
          so the caption can hang beneath the arrow without being clipped. */}
      <div className="absolute bottom-6 right-6 z-[2]">
        <span
          onMouseEnter={() => setArrowHover(true)}
          onMouseLeave={() => setArrowHover(false)}
          className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
        >
          <ArrowGlyph />
        </span>
        <SpotlightCaption label={title} active={arrowHover} />
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
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} id={id} className={wrapperClassName}>
      {content}
    </Link>
  );
}
