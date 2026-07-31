// A single arrow that gently nudges toward the top-right on hover. Driven by a
// `group` ancestor's hover state, so the badge (or whole card) it lives in is
// the trigger. Kept deliberately small — a subtle shift, not a fly-out swap.
export default function ArrowGlyph() {
  return (
    <span
      aria-hidden="true"
      className="grid place-items-center transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-1"
    >
      ↗
    </span>
  );
}
