import CaseStudyLayout from "@/components/CaseStudyLayout";
import AssetPlaceholder from "@/components/AssetPlaceholder";

export const metadata = {
  title: "Orion — Bobo Khat",
  description: "Spatial music discovery map",
};

export default function OrionPage() {
  return (
    <CaseStudyLayout
      title="Orion"
      subtitle="Spatial music discovery map"
      role="Product Design · Interaction"
      tools="Figma, React, React Flow, Three.js, Claude Code"
      timeline="2025"
      heroVideo="/videos/orion-homepage.mp4"
      heroVideoRadius={22}
      next={{ label: "MyShake", href: "/work/myshake" }}
    >
      <p>
        Music tools organize by metadata — title, artist, date added. But
        that&apos;s not how we experience music. We experience it as
        feeling: this song is dark and driving, that one is bright and
        weightless. As an EDM listener, I kept wanting to answer questions
        my library couldn&apos;t:{" "}
        <em>
          what does my taste actually look like? Which songs live near each
          other in vibe, not in a folder?
        </em>
      </p>
      <p>
        Orion maps a music library spatially. Every song is plotted on a 2D
        canvas by its audio features — energy, mood, BPM, key — so
        proximity means similarity. You explore your library by feeling,
        then build DJ sets by wiring songs together into a route across
        that space.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Quantifying vibe
      </h2>
      <p>
        The obvious data source was Spotify&apos;s audio features API. It no
        longer exists — Spotify deprecated it, and capped new developer
        apps at five users, killing any public product built on their data.
        I found a replacement in SoundNet, a name-based audio analysis API,
        and built a caching layer so every track is analyzed exactly once.
        A reconciliation pipeline handles the messiness of name-based
        search: retry cascades, duration cross-checks, corroboration
        against a second source.
      </p>
      <p>
        But the more important decision was one of language. SoundNet
        returns terms like <em>valence</em> and <em>danceability</em> — API
        vocabulary, not human vocabulary. Nobody hears a song and thinks
        &ldquo;high valence.&rdquo; So the interface never shows a single
        API term. Every feature is expressed as a pair of semantic poles:
      </p>
      <AssetPlaceholder note="GRAPHIC — semantic vocabulary table as a designed visual, not a screenshot: Energy → Chill / Intense · Mood → Dark / Bright · BPM → Slow / Fast · Danceability → Mellow / Groovy · Acousticness → Electronic / Acoustic" />
      <p>
        The axes read as vibes, not measurements. That single translation
        is what makes the map feel like taste instead of data.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        The overplotting problem
      </h2>
      <p>
        The map has one non-negotiable rule:{" "}
        <strong>songs always occupy their true positions.</strong> If the
        map lies about where a song lives, the entire thesis collapses.
      </p>
      <p>
        Then I loaded 150 house tracks and watched the map collapse anyway
        — into a single dense blob. House music clusters: energy, mood,
        BPM, and danceability all sit in narrow ranges, and SoundNet rounds
        every feature to an integer, so songs with energy 75 and 76 sat
        60px apart on a 6,000px canvas with nothing to break the tie.
      </p>
      <p>
        The standard fix is a force-directed layout — let songs push each
        other apart until everything is legible. I rejected it
        immediately. Force-directed layouts displace points from their
        true positions, which is exactly the lie the product can&apos;t
        tell. Random spread was rejected for the same reason. This
        constraint made the problem genuinely hard: I had to add
        legibility without adding fiction.
      </p>
      <p>
        What shipped is a three-layer system, and every layer is truthful:
      </p>
      <p>
        <strong>Density-based axis scaling.</strong> Each half-axis is
        histogram-equalized, so concentrated value ranges get more canvas.
        The transformation is monotonic — order is always preserved — and
        pinned at the quadrant boundary so the four vibe zones hold. For
        the house library, this stretched the crowded energy 65–85 band
        from ~1,080px to ~1,900px.
      </p>
      <p>
        <strong>Jitter as measurement uncertainty.</strong> SoundNet&apos;s
        integer rounding hides real sub-integer differences between songs.
        So each song gets a deterministic offset within ±0.5 — inside its
        own integer cell, seeded by a hash of its features, identical
        across reloads. This isn&apos;t fake positioning; it&apos;s
        visualizing the uncertainty the data source introduced. Secondary
        features (danceability, acousticness, BPM) blend into the offset,
        so the separation within a cell is itself meaningful.
      </p>
      <p>
        <strong>Stack badges</strong> for songs with genuinely identical
        features — grouped honestly, never hidden, expandable via popover.
      </p>
      <p>
        The result on the 150-song house library: zero order violations,
        minimum separation up from 0px to 3.8px, and no song ever
        displaced from where it truly belongs.
      </p>
      <AssetPlaceholder note="IMAGE — before/after: the clustered house-library blob vs. the equalized map. Side by side." />
      <p>
        The final layer is interaction. Zooming in doesn&apos;t grow the
        songs — they counter-scale, holding constant screen size while the
        canvas spreads beneath them. Zoom becomes a control for{" "}
        <em>separation</em> rather than magnification: pinch in and songs
        gain breathing room while keeping their exact positions, the same
        technique map tools use for POI markers. I found it by accident,
        testing the app at 175% browser zoom and noticing the spacing
        suddenly felt right.
      </p>
      <AssetPlaceholder note="VIDEO — 10s: zooming into the dense cluster, nodes counter-scaling, space opening up between them, then a node morphing circle → pill → card." />

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Sets as routes, not playlists
      </h2>
      <p>
        Exploration alone wasn&apos;t the product. DJs don&apos;t just find
        songs — they sequence them, and a sequence has a shape: where it
        starts, how it builds, where it peaks. A playlist UI (search, add,
        reorder rows) throws all of that spatial information away the
        moment you commit a song to a list.
      </p>
      <p>
        So set building happens <em>on the map</em>. You wire songs
        together node-to-node, and the set becomes a literal route across
        vibe space — songs are places, the chain is the path, and you can
        see at a glance whether your set climbs steadily into intensity or
        whiplashes across quadrants. Google Maps for a DJ set.
      </p>
      <AssetPlaceholder note="VIDEO — 12s: dragging a wire from a socket, the dashed wire flashing compatibility color on target hover, latching, then two more connections forming a visible route across the map." />
      <p>
        Wires created a design problem playlists never face: what happens
        when you cut one? A destructive delete punishes exploration — cut
        one connection mid-experiment and downstream work vanishes.
        Instead, cutting is non-destructive: downstream songs orphan as a
        group, dimmed with dashed borders, their internal wires intact,
        collected in a Disconnected panel. Re-wire them back anytime. Even
        deleting the head song just orphans the whole chain and offers
        song #2 as the new anchor, one tap to recover. No confirmation
        modals anywhere, because no action can lose work.
      </p>
      <p>
        The same principle — never leave spatial context — shaped the Deck
        View. I explored a dedicated playback page and killed it:
        navigating away breaks the mental model of{" "}
        <em>being somewhere</em> in your library. Deck View is a side
        panel; the map stays under your feet.
      </p>

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Seeing the journey
      </h2>
      <p>
        Build mode is about decisions — every wire wears its compatibility
        color, every candidate song glows. But once a set exists, all that
        decision-support becomes noise. You don&apos;t want to evaluate the
        set; you want to <em>see</em> it.
      </p>
      <p>
        Flow mode strips everything back. Non-chain songs fade away, wires
        turn to dark physical cable, and a single pulse of light travels
        from the head of the set through every song to the tail, tracing
        the journey in order across vibe space. It&apos;s the payoff moment
        of the whole product: the shape of your set, drawn as light,
        moving through the map of your taste.
      </p>
      <p>
        Two modes, two jobs. Build mode informs the next decision; Flow
        mode shows you what you made.
      </p>
      <AssetPlaceholder note="VIDEO — 12s: toggling Flow on, the map dimming, the strobe pulse traveling head-to-tail along the chain. This is the most cinematic capture in the case study — worth extra takes." />

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Informing, not alarming
      </h2>
      <p>
        Compatibility scoring produced my favorite failure. I implemented
        the real DJ-standard formula — Camelot wheel key relationships plus
        BPM deltas, weakest-link rule — and wired the tiers to green,
        amber, and red. Then I built a set and watched the map turn
        overwhelmingly red. Accurate harmonic mixing rules are strict; most
        song pairs genuinely are weak matches.
      </p>
      <p>
        The tempting fix was loosening the thresholds until the map looked
        friendlier. But then &ldquo;musically accurate compatibility&rdquo;
        would be a claim I couldn&apos;t stand behind. The scoring
        wasn&apos;t wrong — the <em>communication</em> was. Red means
        danger, and a weak key transition isn&apos;t danger; it&apos;s a
        characteristic. DJs make distinct key changes on purpose.
      </p>
      <p>
        So the formula stayed strict and the visual language softened. Red
        became a muted coral. The compatibility card frames each tier as a
        description rather than a grade: a strong pair is a &ldquo;smooth
        harmonic blend,&rdquo; a weak one a &ldquo;distinct key
        change.&rdquo; The map went from alarming to informative without a
        single dishonest number.
      </p>
      <AssetPlaceholder note="IMAGE — side-by-side: the same set with red wires vs. coral, plus a close-up of the compatibility card." />

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        From eye candy to identity
      </h2>
      <p>
        The Deck View&apos;s particle visualizer started as decoration — a
        Three.js flourish to make the playback panel feel alive. It
        bothered me that it meant nothing.
      </p>
      <p>
        The answer came from physics. Chladni patterns are the geometric
        figures that form when a surface vibrates at a resonant frequency
        — different frequencies, different figures. I rebuilt the
        visualizer as a Chladni simulation driven by each song&apos;s
        cached audio features: the features set the pattern&apos;s
        complexity, and a hash of the track selects its specific mode, so
        every song resolves into its own stable figure. BPM drives motion,
        energy drives amplitude, mood shifts color.
      </p>
      <p>
        The decoration became identity. Every song in Orion has a visual
        fingerprint derived from its actual sound — play two songs and
        you&apos;re looking at two different objects, not one animation
        with the colors swapped.
      </p>
      <AssetPlaceholder note="VIDEO — 10s: the particle field forming a pattern as a song plays." />
      <AssetPlaceholder note="IMAGE — 2×3 grid: six different songs' Chladni patterns, side by side. This is the money shot — it proves &quot;fingerprint&quot; instantly." />

      <h2 className="mt-8 t-heading text-2xl text-text-primary md:text-3xl">
        Reflection
      </h2>
      <p>
        Almost none of these problems had existing solutions to reference.
        Overplotting under a truthfulness constraint, non-destructive
        graph editing, honest scoring with humane communication — they
        only exist because Orion treats music as space, and they had to
        be identified before they could be solved.
      </p>
      <p>
        The through-line is translation: valence becomes Dark/Bright,
        uncertainty becomes jitter, a setlist becomes a route, a
        song&apos;s audio becomes a resonance pattern. Turning abstract
        qualities into things you can see and touch is the design work I
        want to keep doing.
      </p>
    </CaseStudyLayout>
  );
}
