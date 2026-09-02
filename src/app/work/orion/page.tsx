import CaseStudyLayout from "@/components/CaseStudyLayout";

export const metadata = {
  title: "Orion — Bobo Khat",
  description: "Spatial music discovery map",
};

const semanticPoles = [
  { feature: "Energy", left: "Chill", right: "Intense" },
  { feature: "Mood", left: "Dark", right: "Bright" },
  { feature: "BPM", left: "Slow", right: "Fast" },
  { feature: "Danceability", left: "Mellow", right: "Groovy" },
  { feature: "Acousticness", left: "Electronic", right: "Acoustic" },
];

/**
 * Each row reads as a spectrum — the feature name is the quiet API label,
 * the two poles are the emphasis (that's the whole point: users see the
 * poles, never the API term). Poles stay visually opposed even when they
 * stack on narrow screens, via opposite text alignment.
 */
function SemanticVocabulary() {
  return (
    <div className="flex w-full flex-col gap-7 py-2">
      {semanticPoles.map(({ feature, left, right }) => (
        <div
          key={feature}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6"
        >
          <span className="t-eyebrow shrink-0 text-text-secondary sm:w-40">
            {feature}
          </span>
          <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="t-heading text-lg text-text-primary sm:text-xl">
              {left}
            </span>
            <span
              className="hidden h-px flex-1 bg-border sm:block"
              aria-hidden="true"
            />
            <span className="t-heading text-right text-lg text-text-primary sm:text-xl">
              {right}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrionPage() {
  return (
    <CaseStudyLayout
      title="Orion"
      subtitle="Spatial music discovery map"
      role="Product Design · Interaction"
      tools="Figma, React, React Flow, Three.js, Claude Code"
      timeline="2026"
      heroVideo="/videos/orion-homepage.mp4"
      heroVideoRadius={22}
      next={{ label: "MyShake", href: "/work/myshake" }}
    >
      <p>
        Music tools organize by metadata. Title, artist, date added. But
        that&apos;s not how we experience music — we experience it as
        feeling. This song is dark and driving, that one is bright and
        weightless. As an EDM listener I kept wanting to answer a question
        my library couldn&apos;t: what does my taste actually look like?
      </p>
      <p>
        Orion maps a music library spatially. Every song sits on a 2D
        canvas positioned by its audio features, so proximity means
        similarity. You explore by feeling, then build DJ sets by wiring
        songs into a route across that space.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Quantifying vibe
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        That single translation is what makes the map feel like taste
        instead of data.
      </p>
      <p>
        I started building against Spotify&apos;s audio features API and
        found out it no longer exists. Deprecated, and new developer apps
        are capped at five users, which kills any public product built on
        their data. I moved to SoundNet, a name-based analysis API, and
        cached every result so a track is only ever analyzed once.
      </p>
      <p>
        The more interesting decision was language. SoundNet hands back
        terms like <em>valence</em> and <em>danceability</em>, which are
        API words, not human words. Nobody hears a song and thinks
        &ldquo;high valence,&rdquo; so I made a rule that the interface
        would never show a single API term.
      </p>
      <SemanticVocabulary />
      <p>The axes read as vibes, not measurements.</p>
      <p>
        Name-based search doesn&apos;t resolve everything. On a 200-song
        import roughly forty tracks come back with no match — remixes,
        recent releases, messy metadata. I could have plotted those at a
        best guess and nobody would ever have caught it, but that&apos;s
        the one thing this product can&apos;t do. They route to their own
        panel with a count at the map&apos;s edge. A song is either where
        it belongs or it isn&apos;t on the map.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Making the map legible
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Songs always occupy their true positions. If the map lies about
        where a song lives, the thesis collapses.
      </p>
      <p>
        Then I loaded 150 house tracks, expecting to finally see the shape
        of my taste, and got a smudge.
      </p>
      <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/overplotting-before-clustered.png"
            alt="150 house tracks collapsed into a dense blob"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          150 house tracks, collapsed
        </p>
      </div>
      <p>
        House music clusters by nature — energy, mood, BPM and
        danceability all sit in narrow ranges. SoundNet also rounds every
        feature to an integer, so two songs at 75 and 76 energy ended up
        60px apart on a 6,000px canvas with nothing to break the tie.
      </p>
      <p>
        The standard fix is a force-directed layout: let the songs push
        each other apart until everything is readable. I couldn&apos;t use
        it. Force-directed layouts move points off their true positions,
        which is exactly the lie the map isn&apos;t allowed to tell.
        Random spread fails for the same reason. What I needed was
        legibility without fiction, in three layers.
      </p>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Stretch the crowded ranges
      </h3>
      <p>
        Eighty of the 150 tracks had energy between 65 and 85, so more
        than half the library was fighting over a fifth of the canvas
        while empty ranges got the same space. Histogram equalization
        gives crowded ranges more room and sparse ranges less. Order never
        changes, and the scaling is pinned at the quadrant boundary so the
        four vibe zones stay put.
      </p>
      <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/overplotting-after-equalized.png"
            alt="The same house library with the crowded energy band stretched"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          The same library, crowded band stretched
        </p>
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Separate the ties
      </h3>
      <p>
        Rounding means two genuinely different songs both land on 75, and
        on the same pixel. Each one gets a small offset inside its
        rounding window, never enough to cross into the next value, seeded
        by its <em>other</em> features. Even the nudge carries
        information, and it&apos;s identical on every reload.
      </p>
      <p>
        Songs whose features really are identical don&apos;t get separated
        at all. Those group into a stack badge: counted, expandable, never
        hidden.
      </p>
      <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/stack-badge.png"
            alt="Identical songs grouped into a stack badge instead of overlapping"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          Identical songs group rather than overlap
        </p>
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Make zoom a control for separation
      </h3>
      <p>
        Zooming in doesn&apos;t grow the songs. They hold a constant screen
        size while the canvas spreads beneath them, so pinching adds
        breathing room instead of magnifying the crowding along with
        everything else. Overtone solved this in 3D by pairing camera zoom
        with an inverse image shrink, and I adapted the idea to a 2D
        canvas.
      </p>
      <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/node-zoom-states.png"
            alt="The three node zoom states — dot, pill, and card — from the Figma spec"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          The three node states, specified before they were built.
        </p>
      </div>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/orion/counter-scaling-zoom.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
        />
      </div>
      <p>Every song still sits exactly where its features put it.</p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Sets as routes
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Songs are places, the chain is the path, and you can see at a
        glance whether your set climbs steadily or whiplashes across
        quadrants.
      </p>
      <p>
        Exploring wasn&apos;t enough on its own. DJs don&apos;t just find
        songs, they sequence them, and a sequence has a shape — which a
        playlist UI throws away the moment you commit a song to a list. So
        I moved set building onto the map itself. Google Maps for a DJ
        set.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/orion/wire-routing.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
        />
      </div>
      <p>
        Wires immediately created a problem playlists never face. What
        happens when you cut one? Deleting everything downstream punishes
        people for experimenting, so cutting a wire orphans those songs
        instead: dimmed, dashed, internal wires intact, collected in a
        Disconnected panel. Even deleting the head just orphans the chain
        and offers song #2 as the new anchor.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/orion/wire-orphan.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
        />
      </div>
      <p>
        There isn&apos;t a confirmation modal anywhere in the app, because
        no action can lose your work. The same instinct kept Deck View as
        a side panel rather than its own page.
      </p>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Two modes, two jobs
      </h3>
      <p>
        Build mode is about decisions. Every wire wears its compatibility
        color and every candidate glows. But once the set exists, all of
        that decision-support turns into noise — you don&apos;t want to
        evaluate the set anymore, you want to see it.
      </p>
      <p>
        Flow mode strips it back. Non-chain songs fade out, wires turn
        into dark physical cable, and a single pulse of light travels head
        to tail, tracing the journey in order across vibe space.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/orion/flow-toggle.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
        />
      </div>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Making it speak
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        Three times, Orion knew something true about a song and said it
        badly.
      </p>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Red became coral
      </h3>
      <p>
        I implemented the real DJ compatibility formula — Camelot key
        relationships plus BPM deltas, weakest-link rule — wired the tiers
        to green, amber and red, then built my first set and looked at a
        map that was almost entirely red.
      </p>
      <div className="flex h-[340px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/wire-color-red.png"
            alt="An early set almost entirely red under the real compatibility formula"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          Accurate scoring, alarming output
        </p>
      </div>
      <p>
        The scoring was right. The color was telling people they&apos;d
        made a mistake. Red means danger, and a weak key transition
        isn&apos;t danger, it&apos;s a characteristic — DJs make distinct
        key changes on purpose all the time.
      </p>
      <p>
        So the formula stayed exactly as strict and the visual language
        softened instead. Red became a muted coral, and the compatibility
        card started describing rather than grading: a strong pair is a
        &ldquo;smooth harmonic blend,&rdquo; a weak one a &ldquo;distinct
        key change.&rdquo;
      </p>
      <div className="flex h-[340px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/wire-color-coral.png"
            alt="The same connection rendered in coral instead of red"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          Same information, without the alarm
        </p>
      </div>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        The visualizer meant nothing
      </h3>
      <p>
        The particle visualizer in Deck View started as decoration. Play
        two completely different songs and you&apos;d get the same
        animation with the colors swapped, which bothered me more the
        longer it sat there.
      </p>
      <p>
        I spent a weekend building it as a ferrofluid simulation. It
        looked good in stills, but it never moved like a fluid — the
        tendrils popped in and out like an urchin instead of flowing, and
        it barely responded to the track underneath it.
      </p>
      <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/ferrofluid.webp"
            alt="The ferrofluid visualizer, spiky tendrils rather than flowing fluid"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          It looked good in stills, but never moved like a fluid
        </p>
      </div>
      <p>
        The fix came from a different physical system. Chladni patterns
        are the figures that form when sand sits on a vibrating plate:
        change the frequency, get a different figure. That&apos;s a
        system where the sound genuinely produces the form, rather than
        one where I&apos;m pushing shapes around and hoping they feel
        musical. I rebuilt the visualizer as a Chladni simulation driven
        by each song&apos;s cached features, so every track settles into
        its own figure. BPM drives motion, energy drives amplitude, mood
        shifts color.
      </p>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/orion/chladni-visualizer-intro.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
        />
      </div>
      <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-xl bg-module p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/videos/case-studies/orion/chladni-fingerprints.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
        />
      </div>
      <p>The decoration became identity.</p>

      <h3 className="mt-4 t-heading text-xl text-text-primary">
        Naming the shape
      </h3>
      <p>
        I put Orion in front of friends before launching it. Flow mode
        landed — people watched the pulse travel their set and said some
        version of &ldquo;oh, that&apos;s the shape.&rdquo; Then I&apos;d
        ask what the shape was, and they couldn&apos;t tell me.
      </p>
      <p>
        That gap became Journey, a short written summary of a set&apos;s
        trajectory assembled from the same feature data the map already
        runs on. No language model involved, so the same chain always
        produces the same sentence.
      </p>
      <div className="flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-module p-4">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/case-studies/orion/journey-pill.png"
            alt="The Journey pill open with a written summary of the set's arc"
            className="max-h-full max-w-full w-auto rounded-[22px] object-contain"
            loading="lazy"
          />
        </div>
        <p className="pt-3 text-xs text-text-secondary">
          The set&apos;s arc, in words
        </p>
      </div>
      <p>
        Writing it was mostly subtraction. My first version sounded like a
        weather report — &ldquo;moderate energy, balanced mood&rdquo; —
        accurate and completely dead. It took a list of banned words and
        one rule: every sentence has to sound like a person describing a
        set out loud.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Reflection
      </h2>
      <p className="t-lead text-[28px] md:text-[32px] text-text-primary">
        The through-line is translation. Valence becomes Dark and Bright,
        a rounding error becomes jitter, a setlist becomes a route, a
        song&apos;s audio becomes a resonance pattern.
      </p>
      <p>
        Almost none of these problems had a solution I could look up.
        Overplotting under a truthfulness constraint, non-destructive
        graph editing, honest scoring that doesn&apos;t alarm anyone —
        they only exist because Orion treats music as space, and each one
        had to be found before it could be solved.
      </p>
      <p>
        Turning abstract qualities into things you can see and touch is
        the work I want to keep doing.
      </p>
    </CaseStudyLayout>
  );
}
