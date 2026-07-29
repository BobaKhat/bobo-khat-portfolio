import Link from "next/link";

export type CaseStudyLayoutProps = {
  title: string;
  subtitle: string;
  role: string;
  tools: string;
  timeline: string;
  next: { label: string; href: string };
  heroImage?: string;
  /** Optional hero video path in /public. Takes priority over heroImage when set. */
  heroVideo?: string;
  /** Corner radius (px) for the hero video. Defaults to the standard rounded-xl (12px). */
  heroVideoRadius?: number;
  children?: React.ReactNode;
};

export default function CaseStudyLayout({
  title,
  subtitle,
  role,
  tools,
  timeline,
  next,
  heroImage,
  heroVideo,
  heroVideoRadius,
  children,
}: CaseStudyLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-8 pt-[84px]">
      <div className="py-8">
        <Link
          href="/"
          className="text-xs text-text-secondary transition-colors hover:text-accent"
        >
          ← Back to home
        </Link>
      </div>

      <header className="pb-8">
        <h1 className="font-mono text-3xl text-text-primary md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-base text-text-secondary">{subtitle}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 text-xs sm:grid-cols-3">
          <div>
            <dt className="uppercase tracking-wider text-text-secondary">Role</dt>
            <dd className="mt-1 text-text-primary">{role}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-text-secondary">Tools</dt>
            <dd className="mt-1 text-text-primary">{tools}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-text-secondary">
              Timeline
            </dt>
            <dd className="mt-1 text-text-primary">{timeline}</dd>
          </div>
        </dl>
      </header>

      {/* Hero */}
      {heroVideo ? (
        <div className="mb-12 flex max-h-[720px] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-recessed)]">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="max-h-[688px] w-auto rounded-xl"
            style={
              heroVideoRadius != null
                ? { borderRadius: `${heroVideoRadius}px` }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-module shadow-[var(--shadow-recessed)]">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={`${title} — ${subtitle}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-text-secondary">
              {title} hero image
            </div>
          )}
        </div>
      )}

      <article className="prose-none flex flex-col gap-6 text-base leading-relaxed text-text-primary">
        {children ?? (
          <p className="text-text-secondary">
            Case study content will be migrated from the existing site.
          </p>
        )}
      </article>

      <footer className="mt-16 flex items-center justify-between border-t border-border py-8 text-sm">
        <Link
          href="/"
          className="text-text-secondary transition-colors hover:text-accent"
        >
          ← Home
        </Link>
        <Link
          href={next.href}
          className="text-text-primary transition-colors hover:text-accent"
        >
          Next: {next.label} →
        </Link>
      </footer>
    </main>
  );
}
