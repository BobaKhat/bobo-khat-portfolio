import Image from "next/image";
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
    tag: "Product Design · Interaction · Desktop",
    href: "/work/drift",
    video: "/videos/drift-homepage.mp4",
    videoRadius: 22,
  },
  {
    index: "02",
    title: "MyShake",
    subtitle: "Earthquake awareness platform",
    tag: "Product Design · Research · Mobile",
    href: "/work/myshake",
    video: "/videos/myshake.mp4",
    videoScale: 0.9775,
    videoRadius: 15,
  },
  {
    index: "03",
    title: "Group Canvas",
    subtitle: "Real-time collaboration for GoodNotes",
    tag: "UX · Collaboration · Tablet",
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
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-8 pt-10">
      {/* HERO — name card on the left (matching Drift's width), the split
          widget stack on the right. Same 2-col grid as the work section so
          the left card lines up exactly with the Drift card below it. */}
      <section className="grid grid-cols-1 gap-7 pt-16 pb-6 md:grid-cols-2">
        <div className="flex items-center gap-9 rounded-3xl bg-module p-12 shadow-[var(--shadow-raised)]">
          {/* Memoji self-portrait — static, keyed to a transparent PNG. */}
          <Image
            src="/images/memoji-avatar-v3.png"
            alt="Bobo Khat memoji self-portrait"
            width={344}
            height={440}
            priority
            className="h-42 w-auto shrink-0"
          />
          <div>
            <h1 className="t-display text-[4rem] text-text-primary">
              Bobo Khat
            </h1>
            <p className="t-subtitle mt-4 max-w-xl text-base text-text-secondary">
              Product Designer prev @ MyShake (4M Users) – UX-First With Motion
              and Visual Experiments – UC Berkeley – B.A. Cognitive Science
            </p>
          </div>
        </div>
        <WidgetBar />
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

          <LabCard previews={visualExperimentsPreview} />
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
