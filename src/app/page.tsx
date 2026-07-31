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
    <main className="mx-auto w-full max-w-[1800px] flex-1 px-5 sm:px-8">
      {/* Design-tool dot grid behind everything (landing page only). */}
      <div aria-hidden="true" className="dot-grid pointer-events-none fixed inset-0 -z-10" />
      {/* HERO — centered intro, no card. First name, memoji, last name in a
          row, with the bio beneath. Sits directly on the surface. */}
      <section className="flex flex-col items-center pt-28 pb-16 text-center sm:pt-32 sm:pb-24 md:pt-36">
        <h1 className="t-display text-[clamp(2.75rem,11vw,4rem)] text-text-primary">
          Bobo Khat
        </h1>
        <p className="t-subtitle mt-5 max-w-3xl text-base text-text-secondary sm:mt-6 sm:text-lg">
          Product Designer prev @ MyShake (4M Users) – UX-First With Motion
          and Visual Experiments – UC Berkeley – B.A. Cognitive Science
        </p>
        <WidgetBar />
      </section>

      {/* PRIMARY CASE STUDIES + THE LAB — all equal-size cells in one grid */}
      <section id="work" className="scroll-mt-24 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 gap-5 sm:gap-7 md:grid-cols-2">
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

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center text-[11px] text-text-secondary">
        © 2026 Bobo Khat · Built with care
      </footer>
    </main>
  );
}
