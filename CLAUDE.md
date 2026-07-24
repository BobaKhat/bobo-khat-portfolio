Got it — that's the doc you pasted at the very start of our conversation (the "Portfolio Site Build Spec"). Here it is in full — copy everything in the box below.
markdown# Bobo Khat — Portfolio Site Build Spec
## Claude Code Handoff Document

---

## What This Is
A complete project brief for migrating bobokhat.com from Figma Sites to a coded, deployed portfolio. This is the canonical reference for Claude Code. Figma mockups (lo-fi/mid-fi) are the source of truth for layout. This doc covers architecture, content, interactions, and design direction.

---

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + custom CSS for neomorphic effects
- **Animations:** Framer Motion (subtle hover states, page transitions, scroll reveals)
- **Deployment:** Vercel (connect bobokhat.com domain)
- **APIs:** Spotify Web API (Now Playing widget)
- **Font loading:** Google Fonts or self-hosted (monospace TBD — Space Mono, B612 Mono, or JetBrains Mono)

---

## Design Direction

### Aesthetic: Tactile Neomorphism
The site should feel like a single physical device — like looking down at a beautifully designed consumer electronics product. Every module is raised off a shared surface. Nothing is flat. Nothing is decorative without function.

### References
- Teenage Engineering OP-1 / TP-7 (surface material, control layout)
- Nothing Phone (clean white/gray, restrained accent)
- Marco Cornacchia's portfolio — marcofyi (card layout, personality touches, bento-style but not overcrowded)
- Dieter Rams / Braun (precision, restraint, functional beauty)

### Color System
Surface (background):     #D0CEC9 → #D5D2CD range (muted cool gray, like raw concrete or matte plastic)
Modules (raised cards):   #E2E0DC → #E8E6E3 range (slightly lighter than surface)
Accent:                   #E85D2C (burnt orange — used sparingly)
Text Primary:             #1A1A1A
Text Secondary:           #777777
Borders:                  Subtle, 1px, #C5C3BE range

### Dark Mode (toggled via physical switch widget)
Surface:                  #1A1A1A
Modules:                  #242424
Accent:                   #E85D2C (same orange)
Text Primary:             #E8E6E3
Text Secondary:           #888888

### Neomorphic Shadow System
Raised modules:
```css
box-shadow:
  6px 6px 12px rgba(0, 0, 0, 0.08),
  -4px -4px 10px rgba(255, 255, 255, 0.5);
border-radius: 16px;
```

Recessed elements (search bars, slider wells, widget insets):
```css
box-shadow:
  inset 4px 4px 8px rgba(0, 0, 0, 0.06),
  inset -3px -3px 6px rgba(255, 255, 255, 0.4);
```

Add a subtle CSS noise texture overlay on the background surface for grain.

### Typography
- **Name/Hero:** Bold sans-serif (Inter Black, or similar)
- **Everything else:** Monospace — Space Mono, B612 Mono, or JetBrains Mono
- **Type scale:** 
  - Name: 48-56px
  - Project titles: 24-28px
  - Body/descriptions: 14-16px
  - Labels/tags: 11-12px uppercase tracking

---

## Page Structure

### Single-page layout
Everything lives on one scrollable page. Nav items are anchor links that smooth-scroll to sections. No separate routes for Work/Lab/About (except case study detail pages which open as separate routes).

### Layout Grid
Max-width container: ~1200px, centered. CSS Grid for the main layout. Generous gaps between modules (24-28px).

---

## Content Sections (Top to Bottom)

### 1. FIXED WIDGET BAR (always visible)
Position: fixed top or bottom of viewport (decide during build — try both).
Height: ~52-60px.
Contains small functional modules in a horizontal row:

| Widget | Details | Implementation |
|--------|---------|---------------|
| Spotify Now Playing | Tiny album art (32px), track name, artist, progress bar (orange fill) | Spotify Web API — `/v1/me/player/currently-playing`. Requires OAuth. Fallback: "Nothing playing" state. |
| Dark/Light Toggle | Physical sliding switch with LIGHT / DARK labels | CSS custom properties swap. Persist preference in localStorage. Styled as a recessed track with a sliding knob. |
| Live Clock | Monospace time (HH:MM AM) + date below | JS `setInterval`, updates every minute. Small, understated. |
| Scroll Progress | Thin horizontal track, orange fill, percentage label | `window.scrollY / documentHeight`. Styled as a recessed slider rail. |
| Availability | Green dot + "Open to new work" | Static text, manually updated. Green = available, orange = busy. |

The widget bar should feel like the status/control strip at the edge of a device. Recessed into the surface, not floating on top.

### 2. HERO SECTION (name + nav)
- Left: "Bobo Khat" in large bold type
- Below name: Tagline in monospace italic — "I design digital things people can feel."
- Right: Navigation pill — Work · Lab · About · Resume
  - Styled as a raised segment control
  - Active section has orange dot indicator
  - Resume link opens PDF in new tab

### 3. PRIMARY CASE STUDIES (Row of 2 large cards)
Two equal-width raised cards. These dominate the page — tallest elements, largest screenshots.

**Card 01 — Drift**
- Label: "01" in orange
- Title: "Drift" in monospace
- Subtitle: "Spatial music discovery map"
- Tag: PRODUCT DESIGN · INTERACTION
- Screenshot: The dark galaxy/spatial map view with glowing album art circle nodes (use the zoomed-out full-library screenshot)
- Arrow link → `/work/drift` (case study page)

**Card 02 — MyShake**
- Label: "02" in orange
- Title: "MyShake"
- Subtitle: "Earthquake awareness platform"
- Tag: PRODUCT DESIGN · RESEARCH
- Screenshot: Two mobile screens side by side — earthquake map dashboard + pinned locations
- Arrow link → `/work/myshake` (case study page)

### 4. SECONDARY WORK (Row: smaller card + Lab grid)

**Left (~40% width) — Group Canvas**
- Label: "03" in orange
- Title: "Group Canvas"
- Subtitle: "Real-time collaboration for GoodNotes"
- Tag: UX · COLLABORATION
- Screenshot: The GoodNotes collaboration interface with timer, tasks, participant avatars
- Arrow link → `/work/group-canvas`
- Noticeably smaller card than Row 3 — clear hierarchy

**Right (~60% width) — THE LAB**
- Section label: "● THE LAB" with orange dot
- A raised module containing a horizontal row of 4 square thumbnails:
  1. **Polaris** — Brand identity + landing page (show the landing page hero)
  2. **Graphic Design** — Posters, REGEN branding (show a poster or REGEN product)
  3. **Micro-interactions** — MoceanVault components (show a component screenshot or GIF)
  4. **3D Experiments** — Blender renders (show a render)
- Each thumbnail: image, label below, small arrow
- "See all →" link if there's a dedicated Lab page, or each links to its own lightbox/detail view
- These are clearly tertiary — smallest content elements

### 5. ABOUT SECTION (brief, scrolls to from nav)
- Small raised module
- Photo (not stock — a real one, or skip it)
- 2-3 sentences: Product designer, UC Berkeley Cognitive Science, interested in interfaces that feel intuitive and considered
- Links: Email, LinkedIn, Resume PDF

### 6. FOOTER
Minimal: © 2026 Bobo Khat · Built with care
If widget bar is at bottom, footer content can merge into it.

---

## Case Study Pages (separate routes)

Each case study opens as its own page: `/work/drift`, `/work/myshake`, `/work/group-canvas`

### Structure per case study:
1. **Hero:** Full-width screenshot or short video, project title, subtitle, role, tools, timeline
2. **Content:** Alternating sections of text (prose, not bullets) and full-width or inline images/videos
3. **Navigation:** Back to home (top), Next project link (bottom)

### Content migration:
All case study text, images, and videos will be migrated from the existing Figma Sites pages. The content itself doesn't change — only the presentation layer.

**Asset handling:**
- Export all images from Figma Sites as optimized PNGs/WebP
- Videos: host on Cloudinary or similar, or embed as MP4s in `/public`
- Use Next.js `<Image>` component for automatic optimization
- All images should have loading="lazy" except hero images

---

## Interactive Elements

### Hover States
- Project cards: subtle lift (translate Y -4px) + shadow increase on hover. 300ms ease.
- Arrow buttons: orange fill on hover (outline → filled).
- Lab thumbnails: slight scale (1.02) + brightness increase.

### Scroll Animations (Framer Motion)
- Modules fade in + translate up slightly on scroll into view
- Staggered: cards animate in sequence (100ms delay between each)
- Keep it subtle — this isn't a motion portfolio page, it's a portfolio with good motion

### Dark/Light Mode
- CSS custom properties for all colors
- Toggle animates smoothly (not instant swap)
- Persist in localStorage
- Respect `prefers-color-scheme` on first load

### Spotify Widget
- Spotify Web API integration
- Show currently playing or recently played track
- Refresh every 30 seconds
- Fallback state: "Not playing" with a pause icon
- Auth: Use refresh token flow (server-side route in Next.js API routes)

---

## Responsive Behavior

### Breakpoints:
- Desktop: 1200px+ (full grid as designed)
- Tablet: 768-1199px (2-column, stack secondary row)
- Mobile: <768px (single column, stack everything)

### Mobile specifics:
- Widget bar becomes a collapsible drawer or moves to bottom with only 2-3 widgets visible
- Project cards stack vertically
- Lab thumbnails become a horizontal scroll strip
- Navigation becomes a hamburger or bottom tab bar

---

## File Structure (suggested)
/app
/page.tsx                    # Home (single page with all sections)
/work/drift/page.tsx         # Drift case study
/work/myshake/page.tsx       # MyShake case study
/work/group-canvas/page.tsx  # Group Canvas case study
/api/spotify/route.ts        # Spotify token refresh + currently playing
/layout.tsx                  # Root layout with widget bar, fonts, theme
/components
/WidgetBar.tsx               # Fixed widget strip
/ProjectCard.tsx             # Reusable project card (large + small variants)
/LabThumbnail.tsx            # Small exploration thumbnail
/SpotifyWidget.tsx           # Now playing widget
/ThemeToggle.tsx             # Dark/light physical switch
/ScrollProgress.tsx          # Scroll indicator
/Clock.tsx                   # Live clock
/Navigation.tsx              # Nav pill with anchor links
/CaseStudyLayout.tsx         # Shared layout for case study pages
/styles
/globals.css                 # CSS custom properties, neomorphic mixins, noise texture
/public
/images                     # All exported assets
/fonts                      # Self-hosted monospace font
/resume.pdf                 # Downloadable resume

---

## Build Sequence (vertical slices)

### Phase 1: Scaffold + Homepage Shell
- Next.js project setup with Tailwind
- CSS custom properties for color system + neomorphic shadows
- Layout with placeholder cards
- Navigation with smooth scrolling
- Dark/light mode toggle (functional)
- Deploy to Vercel

### Phase 2: Content Population
- Export all assets from Figma Sites
- Build ProjectCard component with real screenshots
- Build LabThumbnail grid
- Hero section with real copy
- About section

### Phase 3: Case Study Pages
- CaseStudyLayout component
- Migrate MyShake content first (flagship)
- Migrate Group Canvas
- Drift case study (write fresh once build is demo-able)

### Phase 4: Interactive Polish
- Framer Motion scroll animations
- Hover states
- Spotify API integration
- Clock + scroll progress widgets
- Responsive testing + mobile adjustments

### Phase 5: Launch
- Connect bobokhat.com domain
- Performance audit (Lighthouse)
- OG image + meta tags for social sharing
- Final QA across browsers + devices

---

## What Figma Provides
Visual layout, spacing proportions, component hierarchy, typography sizes, module arrangements. Claude Code reads the Figma mockup as the design source of truth. This document provides everything the static mockup can't show: interaction behavior, API integration, responsive rules, animation specs, and build sequence.

---

## Design Decision Log

| # | Decision | Choice | Reason |
|---|----------|--------|--------|
| 1 | Single page vs multi-page | Single page home, separate case study routes | Work visible at a glance like Theo's site; case studies need their own space | inspo - https://design.theo.photo/ , and https://www.marco.fyi/
| 2 | Widget bar position | Fixed (top or bottom — decide in build) | Personality elements always visible without competing with work |
| 3 | Primary case studies | 2 large cards (Drift + MyShake) | These are the strongest pieces — equal visual weight |
| 4 | Secondary case study | Smaller card (Group Canvas) next to Lab grid | Clear hierarchy: primary > secondary > explorations |
| 5 | Decorative elements | None — every non-content element must be functional | Decorative props look cool in renders but are bad UX on a real site |
| 6 | Color palette | Muted cool gray surface, not white, not tan | Between the warmth of workshop renders and the clarity of clean layouts |
| 7 | Dark mode | Yes, toggled via physical switch widget | Demonstrates interaction design; Drift lives in dark aesthetic |


---

## Content Source
Current live site (bobokhat.com, via Figma Sites) is the source for case study 
text, images, and copy — content only. Its visual design (dark background, 
current layout) should NOT be referenced or carried over; the Design Direction 
section above is the only design source of truth for the new build.

## Reference Sites (inspiration, not templates)
- https://design.theo.photo/ — see the Spotify Now Playing widget and its 
  "Not Playing" fallback / iPod styling specifically, close to what's spec'd here
- https://www.marco.fyi/ — more maximalist/interactive than our direction; 
  reference for personality touches, not layout

## Environment Variables (Spotify API)
Server-side route at /api/spotify needs:
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- SPOTIFY_REFRESH_TOKEN
These go in .env.local (gitignored) — not obtained yet, build the route to read 
from env and fail gracefully to the "Not playing" state until they're added.

## Open Decisions (not yet finalized)
- Monospace font: Space Mono vs B612 Mono vs JetBrains Mono — pick one during 
  build and stay consistent, can change later
- About section photo: real photo not yet sourced — use a placeholder/skip 
  for now, don't block on this