// Two stacked arrows that swap on hover: the visible one flies out toward the
// top-right while a second slides in from the bottom-left. Driven by a `group`
// ancestor's hover state, so the badge (or whole card) it lives in is the
// trigger. Wrap it in an element with `overflow-hidden` so the exiting arrow
// is clipped at the badge edge.
export default function ArrowGlyph() {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center transition-transform duration-300 ease-out group-hover:-translate-y-[150%] group-hover:translate-x-[150%]"
      >
        ↗
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 grid -translate-x-[150%] translate-y-[150%] place-items-center transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0"
      >
        ↗
      </span>
    </>
  );
}
