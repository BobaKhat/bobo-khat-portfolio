// Shared building blocks for the arrow "spotlight" hover used across the
// project cards, the Microinteractions card, and the Lab card. Purely
// presentational (no hooks), so they can live inside any client card.

// Full-viewport wash that blows the rest of the page out to near-white
// (light) / near-black (dark) while an arrow is hovered. It must render at
// the bottom of the hovering card's stacking context (z-0) with the card
// body above it, and the card wrapper must NOT carry a transform or this
// fixed element would resolve against the card instead of the viewport.
export function SpotlightOverlay({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ease-out"
      style={{ background: "var(--spotlight)", opacity: active ? 0.92 : 0 }}
    />
  );
}

// Caption that reveals directly beneath the arrow, naming the section /
// case study. Positions itself against the nearest positioned ancestor,
// so wrap the arrow in a `relative` element.
export function SpotlightCaption({
  label,
  active,
  align = "center",
}: {
  label: string;
  active: boolean;
  // "center" hangs the pill centred under the arrow (bottom-corner arrows);
  // "right" pins its right edge to the arrow's, so a long label grows
  // leftward and stays inside cards whose arrow sits near the right edge.
  align?: "center" | "right";
}) {
  const positionClass = align === "right" ? "right-0" : "left-1/2";
  const translateX = align === "right" ? "0px" : "-50%";
  return (
    <span
      aria-hidden={!active}
      className={`pointer-events-none absolute ${positionClass} top-full z-[3] mt-3 whitespace-nowrap rounded-full bg-module px-3 py-1.5 t-eyebrow text-text-primary shadow-[var(--shadow-raised-sm)] transition-all duration-300 ease-out`}
      style={{
        opacity: active ? 1 : 0,
        transform: `translateX(${translateX}) translateY(${active ? "0px" : "-4px"})`,
      }}
    >
      {label}
    </span>
  );
}
