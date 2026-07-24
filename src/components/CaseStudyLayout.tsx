import Link from "next/link";

export type CaseStudyLayoutProps = {
  title: string;
  subtitle: string;
  role: string;
  tools: string;
  timeline: string;
  next: { label: string; href: string };
  children?: React.ReactNode;
};

export default function CaseStudyLayout({
  title,
  subtitle,
  role,
  tools,
  timeline,
  next,
  children,
}: CaseStudyLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-6 pt-[56px]">
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

      {/* Hero image placeholder */}
      <div className="mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-module">
        <div className="grid h-full w-full place-items-center text-xs text-text-secondary">
          {title} hero image
        </div>
      </div>

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
