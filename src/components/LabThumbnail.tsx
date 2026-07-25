export type LabThumbnailProps = {
  title: string;
  caption: string;
  image?: string;
  href?: string;
};

export default function LabThumbnail({
  title,
  caption,
  image,
  href = "#lab",
}: LabThumbnailProps) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex flex-col"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface transition-transform duration-300 group-hover:scale-[1.02]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${title} — ${caption}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center px-2 text-center text-[10px] text-text-secondary">
            {title}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-text-primary">{title}</span>
        <span className="text-text-secondary transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </div>
      <span className="text-[10px] text-text-secondary">{caption}</span>
    </a>
  );
}
