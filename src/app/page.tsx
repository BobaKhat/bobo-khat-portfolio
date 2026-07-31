import ProjectCard from "@/components/ProjectCard";
import MicroInteractions from "@/components/MicroInteractions";
import LabCard from "@/components/LabCard";
import WidgetBar from "@/components/WidgetBar";

// Content per CLAUDE.md build spec. Drift, MyShake, and Group Canvas use
// screen-recorded video on the homepage instead of static screenshots.
const primaryProjects = [
  {
    index: "01",
    title: "Drift",
    subtitle: "Spatial music discovery map",
    tag: "Product Design · Case Study · Desktop",
    href: "/work/drift",
    video: "/videos/drift-homepage.mp4",
    videoRadius: 22,
  },
  {
    index: "02",
    title: "MyShake",
    subtitle: "Earthquake awareness platform",
    tag: "Product Design · Case Study · Mobile",
    href: "/work/myshake",
    video: "/videos/myshake.mp4",
    videoScale: 0.9775,
    videoRadius: 15,
  },
  {
    index: "03",
    title: "Group Canvas",
    subtitle: "Real-time collaboration for GoodNotes",
    tag: "Product Design · Case Study · Tablet",
    href: "/work/group-canvas",
    video: "/videos/group-canvas-homepage.mp4",
    videoScale: 1,
    videoRadius: 10,
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
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-8">
      {/* HERO — centered intro, no card. First name, memoji, last name in a
          row, with the bio beneath. Sits directly on the surface. */}
      <section className="flex flex-col items-center pt-36 pb-24 text-center">
        <h1 className="t-display text-[4rem] text-text-primary">
          Bobo Khat
        </h1>
        <p className="t-subtitle mt-6 max-w-2xl text-base text-text-secondary">
          Product Designer prev @ MyShake (4M Users) – UX-First With Motion
          and Visual Experiments – UC Berkeley – B.A. Cognitive Science
        </p>
        <WidgetBar />
      </section>

      {/* PRIMARY CASE STUDIES + THE LAB — all equal-size cells in one grid */}
      <section id="work" className="scroll-mt-20 pb-24">
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

          <LabCard previews={visualExperimentsPreview} />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-20 pb-24">
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
