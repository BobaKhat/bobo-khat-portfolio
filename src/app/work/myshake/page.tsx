import CaseStudyLayout from "@/components/CaseStudyLayout";
import MyShakeAlert from "@/components/MyShakeAlert";

export const metadata = {
  title: "MyShake — Bobo Khat",
  description: "Earthquake awareness platform",
};

export default function MyShakePage() {
  return (
    <CaseStudyLayout
      title="MyShake"
      subtitle="From buried menus to one glanceable screen"
      role="Product Designer"
      tools="Figma"
      timeline="Jan 2024 – Dec 2024"
      heroVideo="/videos/myshake.mp4"
      heroVideoRadius={15}
      next={{ label: "Group Canvas", href: "/work/group-canvas" }}
    >
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-module p-6 text-center sm:grid-cols-4">
        <div>
          <p className="t-stat text-2xl text-accent">4/5</p>
          <p className="mt-1 text-xs text-text-secondary">
            Usability, tested with 16 users (up from a 2.8 App Store rating)
          </p>
        </div>
        <div>
          <p className="t-stat text-2xl text-accent">50%</p>
          <p className="mt-1 text-xs text-text-secondary">
            Fewer clicks to set up early warning — 5 steps down to 2–3
          </p>
        </div>
        <div>
          <p className="t-stat text-2xl text-accent">41%</p>
          <p className="mt-1 text-xs text-text-secondary">
            Faster key task time — 2:47 down to 1:38
          </p>
        </div>
        <div>
          <p className="t-stat text-2xl text-accent">2026</p>
          <p className="mt-1 text-xs text-text-secondary">
            Shipping — I&apos;m now sole designer on responsive + sensor work
          </p>
        </div>
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Introduction
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        With 4.4 million users, it&apos;s the only earthquake app that offers
        early warning — alongside post-quake reporting and preparedness
        tools.
      </p>
      <p>
        MyShake is built in partnership with USGS and UC Berkeley&apos;s
        Seismology Lab, delivering earthquake alerts seconds before shaking
        begins across California, Oregon, and Washington. I led a
        dashboard redesign alongside four other designers and a project
        manager, conceptualizing the new architecture and co-leading
        usability testing.
      </p>
      <div className="w-full overflow-hidden rounded-xl bg-module p-4">
        <MyShakeAlert />
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">The problem</h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Despite having life-saving technology, MyShake was losing users.
      </p>
      <p>
        Despite having life-saving technology, MyShake was losing users.
        There was only one access point for setting up an early warning
        alert or a custom earthquake notification — and each took five
        steps. That&apos;s far too complex for a safety app. Our business
        goal was to make MyShake the #1 earthquake app by increasing
        engagement and building trust during emergencies.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/myshake/problem.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
        />
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">Research</h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        The key insight: users didn&apos;t just want faster access — they
        wanted to feel like the app was looking out for them.
      </p>
      <p>
        We surveyed 30 users and analyzed two competitors. The competitive
        gap was stark, too: other earthquake apps had more users and higher
        reviews, even though MyShake was the only one offering early
        warning.
      </p>
      <p>
        Three needs came out of that research clearly. Users wanted alerts
        within reach — a way to set up early warnings quickly. They wanted
        to stay informed about the places that mattered to them, monitoring
        activity at a glance. And they wanted guidance when it actually
        mattered — clear, actionable information in the moment an earthquake
        happens. That last point was underscored by a deeper look at the
        existing alert: it provided the bare minimum, giving users no sense
        of when the earthquake would hit or how strong the shaking would
        be.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/case-studies/myshake/old-alert-screen.png"
          alt="The previous MyShake earthquake alert screen"
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Design process
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        I made the case that a dashboard would solve two pain points at
        once — faster access and standing out from competitors — and the
        team agreed to take the risk.
      </p>
      <p>
        The team started with lo-fi sketches, exploring ways to surface key
        features — alerts and earthquake information — in something both
        beautiful and powerful.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/case-studies/myshake/sketch-map-profile.png"
          alt="Team sketches exploring map and profile screens"
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </div>
      <p>
        I realized every earthquake app, including ours in the early
        sketches, defaulted to a map-first landing page — a pattern that
        assumes users want to explore. But our research showed the
        opposite: users wanted reassurance, not exploration. They wanted to
        know they were safe, and that the people they cared about were
        safe. That reframe changed everything, and it&apos;s where I
        proposed{" "}
        <strong className="font-semibold text-text-primary">
          making MyShake open to a personalized dashboard instead of a map
        </strong>
        .
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/case-studies/myshake/sketch-dashboard-concept.png"
          alt="Early sketch exploring a widget-based dashboard homepage"
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </div>
      <p>
        The dashboard introduced real risk. The team was impressed but
        hesitant — a larger design system would be required, the project
        timeline was tight, and there was a real risk the Seismology Lab
        would disapprove. Because of those concerns, the team initially
        leaned toward simply refining the existing map-first interface: a
        safer approach, familiar to users, that improved the UI without
        touching the app&apos;s underlying structure.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex h-[560px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/case-studies/myshake/option-a-refined-landing.png"
              alt="Option A — the team's refined, map-first landing page"
              className="max-h-full max-w-full w-auto rounded-lg object-contain"
              loading="lazy"
            />
          </div>
          <p className="pt-3 text-xs text-text-secondary">
            Option A — safer, familiar, visual improvements only
          </p>
        </div>
        <div className="flex h-[560px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/case-studies/myshake/option-b-dashboard-landing.png"
              alt="Option B — the proposed dashboard landing page"
              className="max-h-full max-w-full w-auto rounded-lg object-contain"
              loading="lazy"
            />
          </div>
          <p className="pt-3 text-xs text-text-secondary">
            Option B — innovative, personal, unprecedented for earthquake apps
          </p>
        </div>
      </div>
      <p>
        Done right, it would transform MyShake from a flat safety app into
        something that actually felt like it cared about its users. The new
        information architecture that followed simplified navigation so
        users could reach any key feature within one or two taps, instead
        of digging through menus.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/case-studies/myshake/information-architecture.png"
          alt="The simplified information architecture diagram"
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Final solution
      </h2>
      <h3 className="mt-4 t-heading text-xl text-text-primary">
        First impressions
      </h3>
      <p>
        First impressions mattered, so I designed a short tutorial that
        introduces the most important parts of the app through progressive
        disclosure.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/myshake/final-solution-first-impressions.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Early warning shortcuts
      </h3>
      <p>
        New users get two instant access points to enable an early warning.{" "}
        <strong className="font-semibold text-text-primary">
          Setup went from five steps to two
        </strong>{" "}
        — swipe right on the map, or tap the banner.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/myshake/final-solution-early-warning.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-lg object-contain"
        />
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Staying connected to what matters
      </h3>
      <p>
        The dashboard keeps users informed about the places that matter
        most to them — whether that&apos;s their own home or their
        mom&apos;s apartment across the state. I explored a contact-syncing
        system for safety confirmations early on, but the Seismology Lab
        ruled it out of scope: users didn&apos;t need MyShake to message
        family directly, they just needed to know if an earthquake had
        happened near someone they cared about.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/videos/case-studies/myshake/final-solution-staying-connected-1.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
          />
        </div>
        <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/videos/case-studies/myshake/final-solution-staying-connected-2.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
          />
        </div>
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Reimagining the critical alert
      </h3>
      <p>
        The alert itself is MyShake&apos;s core moment, and the original
        showed only basic detection info in an outdated UI. I redesigned
        both the pre-earthquake warning and the post-earthquake follow-up —
        adding countdown timers, intensity levels, safety actions, and
        clear next steps.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/myshake/critical-alert-1.png"
            alt="Redesigned pre-earthquake warning alert"
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
        <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/myshake/critical-alert-2.png"
            alt="Redesigned post-earthquake follow-up alert"
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
      </div>
      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Interface improvements
      </h3>
      <p>
        Navigation got more intuitive across the board, and the team
        reframed the settings screen as a profile page — a small shift that
        introduced a real sense of ownership and personalization.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex h-[160px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/myshake/new-navigation-1.png"
            alt="New, more intuitive navigation"
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
        <div className="flex h-[160px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/myshake/new-navigation-2.png"
            alt="New navigation, alternate view"
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">Validation</h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Task success for pinned locations jumped to 100%, up from frequent
        failures in round one, and ease of use improved to about 4.0 —
        matching the seniors&apos; round-one ratings.
      </p>
      <p>
        Three of us ran two rounds of usability testing across 16
        participants — young adults and seniors at the Rossmore retirement
        community — without the tutorial, and with tasks phrased to
        genuinely challenge users&apos; thinking. In round one, with 12
        participants split evenly between seniors and young adults, young
        adults averaged roughly 3.3 out of 5 for ease of use and seniors
        averaged around 4.0. Users struggled to create pinned locations,
        buttons were hard to see in some flows, and icons like layers and
        filters weren&apos;t intuitive.
      </p>
      <p>
        For round two, with 4 young-adult participants, I added visibility
        for pinned locations on the profile screen and improved the pinned
        location flow. One senior participant put it simply:
      </p>
      <blockquote className="border-l-2 border-accent pl-4 italic text-text-secondary">
        &ldquo;It is giving me immediate choices.&rdquo;
      </blockquote>
      <p>
        That comment directly validated the dashboard approach. Round-one
        testing had revealed that users couldn&apos;t find pinned locations
        even with the dashboard shortcuts in place — some clicked into
        profile and found it buried as a regular menu item. I designed an
        elevated, prominent banner card instead, making its purpose
        immediately clear.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/myshake/pinned-locations-banner.png"
            alt="Elevated pinned locations banner card"
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
        <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/myshake/pinned-locations-detail.png"
            alt="Pinned locations detail view"
            className="max-h-full max-w-full w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        What I learned
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        The hardest part of this project wasn&apos;t designing the
        dashboard — it was convincing the team to take the risk on it.
      </p>
      <p>
        The hardest part of this project wasn&apos;t designing the
        dashboard — it was convincing the team to take the risk on it. I
        made the case with research, and that shifted the conversation. I&apos;m
        currently the sole product designer on MyShake, continuing this work
        by expanding responsive design and building new features that make
        earthquake preparedness more accessible to everyone.
      </p>
    </CaseStudyLayout>
  );
}
