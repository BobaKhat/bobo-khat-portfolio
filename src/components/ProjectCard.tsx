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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-module p-6 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="font-mono text-sm text-accent">{index}</span>
        <span className="text-accent transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>

      {/* Screenshot slot */}
      <div
        className={`mb-5 w-full overflow-hidden rounded-xl border border-border bg-surface ${
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
      </div>

      <h3
        className={`font-mono ${
          size === "large" ? "text-2xl" : "text-xl"
        } text-text-primary`}
      >
        {title}
      </h3>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      <p className="mt-3 text-[11px] uppercase tracking-wider text-text-secondary">
        {tag}
      </p>
    </Link>
  );
}
