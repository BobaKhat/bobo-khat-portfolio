import Link from "next/link";

export type ProjectCardProps = {
  index: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  /** Optional screenshot path in /public. Placeholder shown when absent. */
  image?: string;
  /** "large" dominates the page; "small" is the secondary variant. */
  size?: "large" | "small";
};

export default function ProjectCard({
  index,
  title,
  subtitle,
  tag,
  href,
  image,
  size = "large",
}: ProjectCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm text-accent">{index}</span>
            <h3
              className={`font-mono ${
                size === "large" ? "text-2xl" : "text-xl"
              } text-text-primary`}
            >
              {title}
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        </div>
        <p className="shrink-0 text-right text-[11px] uppercase tracking-wider text-text-secondary">
          {tag}
        </p>
      </div>

      {/* Screenshot slot */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-recessed)] ${
          size === "large" ? "aspect-[16/10]" : "aspect-[16/11]"
        }`}
      >
        {image ? (
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

        {/* Floating launch button */}
        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-module text-text-primary shadow-[var(--shadow-raised)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}
