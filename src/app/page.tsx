import ProjectCard from "@/components/ProjectCard";
import LabThumbnail from "@/components/LabThumbnail";
import MicroInteractions from "@/components/MicroInteractions";

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

const labItems = [
  {
    title: "Polaris",
    caption: "Brand identity + landing page",
    image: "/images/lab/polaris-landing.jpg",
    href: "https://polaris-landing.vercel.app",
  },
  {
    title: "Visual Experiments",
    caption: "Graphic design + 3D renders",
    image: "/images/lab/visual-experiments.jpg",
    href: "/lab/visual-experiments",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-8 pt-[84px]">
      {/* HERO */}
      <section className="flex flex-col gap-8 py-16 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-sans text-5xl font-black tracking-tight text-text-primary md:text-6xl">
            Bobo Khat
          </h1>
          <p className="mt-3 font-mono text-sm italic text-text-secondary">
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

          <div
            id="lab"
            className="scroll-mt-20 flex h-full flex-col rounded-3xl bg-module p-6 shadow-[var(--shadow-raised)]"
          >
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-wider text-text-secondary">
                  The Lab
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Explorations and experiments
              </p>
            </div>
            <div className="grid flex-1 grid-cols-2 content-center gap-4">
              {labItems.map((item) => (
                <LabThumbnail key={item.title} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MICROINTERACTIONS */}
      <div className="mt-7">
        <MicroInteractions />
      </div>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-20 py-16">
        <div className="rounded-3xl bg-module p-8 shadow-[var(--shadow-raised)]">
          <span className="text-[11px] uppercase tracking-wider text-text-secondary">
            About
          </span>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-primary">
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
