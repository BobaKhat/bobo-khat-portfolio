import CaseStudyLayout from "@/components/CaseStudyLayout";

export const metadata = {
  title: "Group Canvas — Bobo Khat",
  description: "Real-time collaboration for GoodNotes",
};

export default function GroupCanvasPage() {
  return (
    <CaseStudyLayout
      title="Group Canvas"
      subtitle="A real-time collaborative note-taking experience built into GoodNotes"
      role="Product Designer · UX Flows · Interaction Design"
      tools="Figma, FigJam, Google Forms, Figma Make"
      timeline="UC Berkeley designathon + independent continuation"
      heroVideo="/videos/case-studies/group-canvas/hero.mp4"
      next={{ label: "Orion", href: "/work/orion" }}
    >
      <p>
        After placing 3rd at a UC Berkeley designathon sponsored by
        GoodNotes, I continued developing this concept independently —
        exploring how real-time collaboration could live directly inside the
        note-taking experience.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Introduction
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        GoodNotes excels at individual note-taking, but when students need
        to collaborate during class, they&apos;re forced to leave their
        notes and switch to separate tools — Google Docs for synthesis,
        messaging apps for coordination — all while trying to maintain
        their personal work.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/case-studies/group-canvas/introduction-context.png"
          alt="GoodNotes, the individual note-taking app this concept extends"
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </div>
      <p>
        What if collaboration happened directly inside GoodNotes? This
        concept focuses on real-time, in-class collaboration during
        breakout sessions — whether students are working together in
        person or joining remotely during hybrid learning.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        The problem
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        The result: too many context switches, personal work disconnected
        from the group, and no way to see individual contributions.
      </p>
      <p>
        In-class group work asks students to think independently,
        coordinate with peers, contribute visibly, and synthesize ideas
        quickly — all at once. Most digital tools aren&apos;t designed for
        that reality. During a typical 45-minute breakout, students juggle
        three disconnected surfaces:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <span className="font-semibold text-text-primary">iPad – GoodNotes</span> for
          personal notes and work — but that work stays isolated and
          doesn&apos;t integrate with the group, forcing constant switching.
        </li>
        <li>
          <span className="font-semibold text-text-primary">Laptop – Google Doc</span> for
          group synthesis and editing — but it gets cluttered fast, with
          unclear ownership and edit collisions.
        </li>
        <li>
          <span className="font-semibold text-text-primary">Verbal discussion</span> while
          managing both screens — ideas get lost as focus splits between
          talking and typing.
        </li>
      </ul>
      <p>
        Collaboration ends up feeling uneven and inefficient, even when
        students want to participate.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">Research</h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        I synthesized the survey findings through affinity mapping, which
        surfaced four key insights that shaped everything downstream.
      </p>
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-module p-6 text-center sm:grid-cols-2">
        <div>
          <p className="t-stat text-2xl text-accent">20+</p>
          <p className="mt-1 text-xs text-text-secondary">
            Students surveyed across lecture and discussion classes
          </p>
        </div>
        <div>
          <p className="t-stat text-2xl text-accent">5</p>
          <p className="mt-1 text-xs text-text-secondary">
            Educators surveyed across lecture and discussion classes
          </p>
        </div>
      </div>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/case-studies/group-canvas/affinity-mapping.png"
          alt="Affinity mapping synthesis of student and educator survey findings"
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </div>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <span className="font-semibold text-text-primary">Collaboration is fragmented</span>{" "}
          — students frequently switch between note apps, shared docs, and
          chat tools during a single class session.
        </li>
        <li>
          <span className="font-semibold text-text-primary">
            One shared page doesn&apos;t scale
          </span>{" "}
          — groups larger than 3–4 struggle with clutter, edit collisions,
          and unclear ownership.
        </li>
        <li>
          <span className="font-semibold text-text-primary">
            Independent thinking still matters
          </span>{" "}
          — students prefer to work through ideas privately before
          contributing to shared space.
        </li>
        <li>
          <span className="font-semibold text-text-primary">
            Visibility changes behavior — but adds pressure
          </span>{" "}
          — seeing progress encourages participation, but constant
          visibility increases anxiety.
        </li>
      </ul>
      <blockquote className="border-l-2 border-accent pl-4 italic text-text-secondary">
        &ldquo;I like working things out on my own first. Once it&apos;s on
        the main page, it feels permanent.&rdquo;
        <span className="mt-1 block text-xs not-italic">
          — Student participant
        </span>
      </blockquote>
      <blockquote className="border-l-2 border-accent pl-4 italic text-text-secondary">
        &ldquo;There are too many tools that I have to juggle with if I
        want to create, track, and grade work.&rdquo;
        <span className="mt-1 block text-xs not-italic">
          — Educator participant
        </span>
      </blockquote>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Design process
      </h2>
      <h3 className="mt-4 t-heading text-xl text-text-primary">
        I killed my team&apos;s designathon idea
      </h3>
      <p>
        Our designathon concept placed 3rd with a student archetype
        system — roles and personalities that shaped how students
        collaborated. When I continued the project independently, I
        pressure-tested that direction and realized archetypes solved for
        identity, not workflow. The real friction was structural: too many
        tools, no shared space, no synthesis path.
      </p>
      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Reframing around collaboration mechanics
      </h3>
      <p>
        Rather than designing systems to manage student behavior, I
        focused on the mechanics: how students enter a session, how they
        work independently, how they coordinate, and how they synthesize
        ideas. I intentionally scoped this to real-time, in-class
        collaboration with student-to-student coordination — lightweight
        structure over enforcement, which kept the concept aligned with
        GoodNotes&apos; canvas-first identity and avoided over-engineering.
      </p>
      <h3 className="mt-4 t-heading text-xl text-text-primary">
        What I chose not to solve
      </h3>
      <p>
        Some findings — like the lack of in-person energy, no
        ice-breaking opportunities, and the desire for casual chat —
        reflect social and behavioral dynamics that a tool can&apos;t
        fully address. I kept this concept focused on the structural
        problems: fragmented tools, unclear contributions, and chaotic
        synthesis.
      </p>
      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Feature prioritization
      </h3>
      <p>
        Core experience: individual work tabs and a shared synthesis
        canvas. Supporting features: presence indicators, contextual
        comments, and a focus timer with tasks. An opt-in contribution
        visibility toggle came last, as an optional enhancement — the
        foundation needed to be solid before adding any accountability
        layer on top.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Final solution
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Group Canvas is a live, in-class collaborative note experience
        designed around presence, structure, and synthesis, all within the
        GoodNotes canvas.
      </p>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Land on the shared workspace
      </h3>
      <p>
        Students accept a Group Canvas invite and land on the shared
        workspace, immediately seeing their group members and the main
        canvas — establishing context from the start.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/group-canvas/final-solution-land-workspace.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Set a timer, assign tasks
      </h3>
      <p>
        The group sets a timer and assigns tasks with clear ownership.
        Self-pacing was considered, but 50-minute class windows mean groups
        need structure to stay on track — they can set a duration, add
        tasks, assign them to individuals or the group, then start.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/group-canvas/final-solution-timer-tasks.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Work in individual tabs
      </h3>
      <p>
        Each student works in their own tab — visible but protected from
        others editing. Presence indicators show who&apos;s active (green
        = online, yellow = idle). Research insight: students prefer
        working through ideas privately before sharing, while still
        maintaining group awareness.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/group-canvas/final-solution-individual-tab.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Coordinate with contextual comments
      </h3>
      <p>
        Students use comments to coordinate without interrupting each
        other&apos;s flow. Comments are anchored to specific work — on
        tabs or the main canvas — keeping coordination contextual rather
        than scattered across chat threads. All members can see and
        resolve comments once they&apos;re addressed.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/group-canvas/final-solution-comments.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Synthesize onto the shared canvas
      </h3>
      <p>
        Students complete tasks and move their contributions to the shared
        canvas: mark complete → select key content → add to canvas.
        Contributions appear in real time as others finish. Research
        insight: &ldquo;one shared page gets chaotic past 3–4
        people&rdquo; — work stays organized because students synthesize
        intentionally rather than everyone editing simultaneously.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/group-canvas/final-solution-complete-canvas.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Reveal authorship, opt-in
      </h3>
      <p>
        An opt-in toggle reveals color-coded authorship when needed — off
        by default for a unified view, on for clear attribution when
        accountability matters. Research insight: visibility encourages
        participation but creates pressure, so making it opt-in balances
        both needs. Teachers can use it for grading and students can
        verify contributions, without constant social pressure.
      </p>
      <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/group-canvas/final-solution-contribution-toggle.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto object-contain"
        />
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Design decisions
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Intentional choices were made to balance collaboration
        effectiveness with user comfort — prioritizing user agency over
        behavioral enforcement, reflecting the research finding that
        students need both structure and autonomy.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <span className="font-semibold text-text-primary">Privacy by default</span> —
          contribution visibility defaults to off. Students control when
          attribution matters.
        </li>
        <li>
          <span className="font-semibold text-text-primary">Flexible structure</span> —
          tasks can be assigned individually or to groups. The timer
          provides pacing without enforcement.
        </li>
        <li>
          <span className="font-semibold text-text-primary">Selective transparency</span>{" "}
          — presence indicators show activity, not surveillance. The
          contribution toggle only activates when needed.
        </li>
      </ul>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Next steps
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        If taken further, I&apos;d validate this concept through classroom
        testing with 10–15 students completing real group assignments,
        including a few open questions I&apos;d want to answer:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Does opt-in visibility reduce pressure while maintaining accountability?</li>
        <li>Do individual tabs support diverse working styles effectively?</li>
        <li>Does the shared canvas stay organized as contributions accumulate?</li>
        <li>Which features get adopted versus ignored?</li>
        <li>
          When contribution is unequal, does privacy-by-default hide the
          problem — or does the system surface it constructively?
        </li>
        <li>
          Students noted that typing feels like extra work — would voice
          notes or quick reactions reduce friction in coordination?
        </li>
      </ul>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Industry insight
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        A user researcher at GoodNotes drew a direct comparison between
        Group Canvas and their education product: their product uses a
        teacher-hierarchy model, while Group Canvas takes a peer-to-peer
        approach — a deliberate choice based on how students actually
        collaborate in breakout sessions.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Reflection
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Moving from &ldquo;how do we get students to contribute?&rdquo; to
        &ldquo;how do we support independent thinking within group
        work?&rdquo; changed everything — and it taught me to design for
        how people actually collaborate, not how I think they should.
      </p>
      <p>
        This project reinforced that collaboration isn&apos;t just about
        connecting people — it&apos;s about designing how they work
        together. Early iterations focused on encouraging participation
        through gamification and visibility, but research revealed
        students didn&apos;t need motivation; they needed structure that
        respected how they actually think and work.
      </p>
    </CaseStudyLayout>
  );
}
