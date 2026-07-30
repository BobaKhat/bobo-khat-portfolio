import ProjectCard from "@/components/ProjectCard";
import MicroInteractions from "@/components/MicroInteractions";
import ArrowGlyph from "@/components/ArrowGlyph";

// Content per CLAUDE.md build spec. Drift, MyShake, and Group Canvas use
// screen-recorded video on the homepage instead of static screenshots.
const primaryProjects = [
  {
    index: "01",
    title: "Drift",
    subtitle: "Spatial music discovery map",
    tag: "Product Design · Interaction",
    href: "/work/drift",
    video: "/videos/drift-homepage.mp4",
    videoRadius: 5,
  },
  {
    index: "02",
    title: "MyShake",
    subtitle: "Earthquake awareness platform",
    tag: "Product Design · Research",
    href: "/work/myshake",
    video: "/videos/myshake.mp4",
    videoScale: 0.85,
    videoRadius: 15,
  },
  {
    index: "03",
    title: "Group Canvas",
    subtitle: "Real-time collaboration for GoodNotes",
    tag: "UX · Collaboration",
    href: "/work/group-canvas",
    video: "/videos/group-canvas-homepage.mp4",
  },
];

const visualExperimentsPreview = [
  "/images/visual-experiments/ve-01.jpg",
  "/images/visual-experiments/ve-03.jpg",
  "/images/visual-experiments/ve-06.jpg",
  "/images/visual-experiments/ve-09.jpg",
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-8 pt-[84px]">
      {/* HERO */}
      <section className="flex flex-col gap-8 py-16 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="t-display text-5xl text-text-primary md:text-6xl">
            Bobo Khat
          </h1>
          <p className="t-subtitle mt-3 text-sm italic text-text-secondary">
            I design digital things people can feel.
          </p>
        </div>
      </section>

      {/* PRIMARY CASE STUDIES + THE LAB — all equal-size cells in one grid */}
      <section id="work" className="scroll-mt-20">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {primaryProjects.map((p) => (
            <ProjectCard key={p.index} size="large" {...p} />
          ))}

          <MicroInteractions className="md:row-span-2" />

          <ProjectCard
            id="lab"
            index="04"
            title="Polaris"
            subtitle="Brand identity + landing page"
            tag="Brand · Landing Page"
            href="https://polaris-landing.vercel.app"
            image="/images/lab/polaris-landing.jpg"
            size="large"
          />

          <a
            href="/lab/visual-experiments"
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)] transition-transform duration-300 hover:-translate-y-1 md:col-span-2 md:p-8"
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  <span className="t-eyebrow text-text-secondary">
                    The Lab
                  </span>
                </div>
                <p className="t-subtitle mt-2 text-sm text-text-secondary">
                  Visual Experiments — Graphic design + 3D renders
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3">
                <span className="text-xs text-text-secondary">See the full gallery</span>
                <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-module text-lg text-text-primary shadow-[var(--shadow-raised-sm)] transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                  <ArrowGlyph />
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {visualExperimentsPreview.map((src) => (
                <div
                  key={src}
                  className="aspect-[4/3] overflow-hidden rounded-xl bg-well shadow-[var(--shadow-recessed)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt="Visual experiment preview"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-20 py-16">
        <div className="rounded-3xl bg-module p-8 shadow-[var(--shadow-raised)]">
          <span className="t-eyebrow text-text-secondary">
            About
          </span>
          <p className="t-body mt-4 max-w-2xl text-base text-text-primary">
            Product designer studying Cognitive Science at UC Berkeley. I&apos;m
            interested in interfaces that feel intuitive and considered — digital
            things people can actually feel.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-xs">
            <a
              href="mailto:williambkhat@gmail.com"
              className="text-text-primary transition-colors hover:text-accent"
            >
              Email
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary transition-colors hover:text-accent"
            >
              LinkedIn
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary transition-colors hover:text-accent"
            >
              Resume
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center text-[11px] text-text-secondary">
        © 2026 Bobo Khat · Built with care
      </footer>
    </main>
  );
}
