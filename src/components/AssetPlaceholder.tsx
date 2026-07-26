type AssetPlaceholderProps = {
  /** The original bracketed asset note, shown verbatim as a caption. */
  note: string;
  className?: string;
};

/**
 * Stand-in for an unfinished case-study asset (image, video, or graphic).
 * Renders a dashed, muted block labeling what still needs to be dropped in,
 * so it reads clearly as "not done yet" rather than a broken media tag.
 */
export default function AssetPlaceholder({
  note,
  className = "",
}: AssetPlaceholderProps) {
  return (
    <div
      className={`flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center shadow-[var(--shadow-recessed)] ${className}`}
    >
      <span className="text-[10px] uppercase tracking-wider text-text-secondary">
        Asset needed
      </span>
      <p className="max-w-md text-xs text-text-secondary">{note}</p>
    </div>
  );
}
