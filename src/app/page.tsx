import ProjectCard from "@/components/ProjectCard";
import MicroInteractions from "@/components/MicroInteractions";
import LabCard from "@/components/LabCard";
import MeetDesigner from "@/components/MeetDesigner";

// Content per CLAUDE.md build spec. Orion, MyShake, and Group Canvas use
// screen-recorded video on the homepage instead of static screenshots.
const primaryProjects = [
  {
    index: "01",
    title: "Orion",
    subtitle: "Spatial music discovery map",
    tag: "Product Design · 0 → 1 · Desktop",
    href: "/work/orion",
    video: "/videos/orion-homepage.mp4",
    videoRadius: 16,
  },
  {
    index: "02",
    title: "MyShake",
    subtitle: "Earthquake awareness platform",
    tag: "Product Design · Usability Testing · Mobile",
    href: "/work/myshake",
    video: "/videos/myshake.mp4",
    videoScale: 0.9775,
    videoRadius: 15,
    videoClipTop: 2,
  },
  {
    index: "03",
    title: "Group Canvas",
    subtitle: "Real-time collaboration for GoodNotes",
    tag: "Product Design · 3rd Place Winner · Tablet",
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
        <h1 className="t-display max-w-[14ch] text-[clamp(2.5rem,11vw,4rem)] text-text-primary">
          Bobo Khat is a Product Designer
        </h1>
        <div className="mt-5 max-w-3xl sm:mt-6">
          <p className="t-subtitle text-base text-text-secondary sm:text-lg">
            prev @ MyShake (4M Users) – UX-First With Motion and Visual
            Experiments – UC Berkeley – B.A. Cognitive Science
          </p>
        </div>
      </section>

      {/* PRIMARY CASE STUDIES + THE LAB — all equal-size cells in one grid */}
      <section id="work" className="scroll-mt-24 pb-16 sm:pb-24">
        {/*
          grid-flow-dense lets the tablet layout below work: when
          Microinteractions becomes full-width (col-span-2) at md, dense packing
          pulls Polaris up into the gap next to Group Canvas. At ≥1200px
          Microinteractions reverts to its row-span-2 column (no gaps, so dense
          is a no-op there and the desktop layout is unchanged).
        */}
        <div className="grid grid-cols-1 gap-5 sm:gap-7 md:grid-flow-row-dense md:grid-cols-2">
          {primaryProjects.map((p) => (
            <ProjectCard key={p.index} size="large" {...p} />
          ))}

          {/* Tablet: own full-width row (avoids the row-span white space when
              the narrow case-study cards are too short). Desktop: row-span-2. */}
          <MicroInteractions className="md:max-[1199px]:col-span-2 min-[1200px]:row-span-2" />

          <ProjectCard
            id="lab"
            index="04"
            title="Polaris"
            subtitle="Brand identity + landing page"
            href="https://polaris-landing.vercel.app"
            image="/images/lab/polaris-landing.jpg"
            hoverVideo="/videos/polaris-hover.mp4"
            size="large"
          />

          <LabCard previews={visualExperimentsPreview} />

          <ProjectCard
            index="05"
            title="Product Advertisement"
            subtitle="Concept ad campaign"
            href="/lab/product-advertisement"
            image="/images/lab/product-ad/phone-1.png"
            size="large"
          />

          {/* Tablet (md–1199): full-width row at the bottom. Desktop: sits
              beside Product Advertisement (default single cell). */}
          <MeetDesigner className="md:max-[1199px]:col-span-2" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center text-[11px] text-text-secondary">
        © 2026 Bobo Khat · Built with care
      </footer>
    </main>
  );
}
