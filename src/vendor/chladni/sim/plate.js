// GENERATED from chladni@8a67cc5 (v5-portfolio). Do not edit here. Edit in ~/Desktop/chladni and re-sync.
// —— Plate eigenmode physics (extracted from ChladniVisualizer.jsx, verbatim). The free-edge
// circular-plate eigensolver, the solved mode table, the Bessel helpers for the nodal-line
// overlay, and the driving/selection/tone tuning constants. Pure JS — no THREE, no DOM.

const TEX = 256                    // texture edge; TEX² particles
const PARTICLE_COUNT = TEX * TEX   // 65,536
const PLATE_R = 1.8                // the plate's physical radius; the span the density map covers
const EDGE_R = 1.75                // grains are contained just inside the rim
const SPAWN_R = 1.70

// FIELD_R — the radius the mode field is normalised to, and it is deliberately NOT the plate radius.
//
// k is a zero of J_n, so J_n(k·r) vanishes at r = 1 BY CONSTRUCTION: whatever we divide by here becomes
// the figure's outermost nodal circle, and sand piles on it. Divide by PLATE_R and that circle lands at
// 1.8 — outside EDGE_R (1.75), where the position pass hard-clamps the grains. Every grain in the outer
// margin would then be seeking a nodal line it can never physically arrive at, and would spend the song
// pressed against the containment wall: a permanent smear of sand around the rim, on every track, eaten
// out of the figure.
//
// Set inside the rim's soft margin instead and the ring lands ON the plate. The outermost nodal circle
// becomes part of the figure rather than a wall artefact, and the margin beyond it stays dark — which is
// what the photographs of real circular plates look like.
const FIELD_R = 1.6
const DENSITY_TEX = 64             // density splat target; deliberately coarse — see DENSITY_VERT

// —— FORCED-PLATE DRIVING. The figure is no longer chosen from the track and held for the song; it is
// driven continuously by the audio spectrum, the way sand on a real plate reorganises as the
// frequencies shaking it change. The mode table is a real EIGENVALUE SOLVE for a free-edge circular
// plate (see solveModes, below the plate definition), so the resonances derive from the material and
// geometry below rather than from a chosen reference frequency. Every frame each mode's amplitude is
// set from how much audio energy sits at its resonant frequency, and the modes are summed into the
// displacement field.
//
// PLATE — the physical plate the resonances come from. Bending stiffness D = E·h³ / (12·(1−ν²)); a
//         mode's frequency is f = (λ² / (2π·a²))·√(D / (ρ·h)) where λ is the dimensionless eigenvalue
//         solved for that mode. Steel, 16 cm across, 1.2 mm thick.
const PLATE = {
  radius: 0.08,       // m — sized so the spread-selected (n,m) set lands in ~400 Hz–16 kHz
  thickness: 0.0012,  // m
  E: 200e9,           // Pa, steel
  nu: 0.30,
  rho: 7850,          // kg/m³
}

// Q  — resonance sharpness, derived from steel's loss factor η: a resonator's Q is 1/η. Q_SCALE is a
//      deliberate detune: the physically correct Q (η = 1e-4 → Q = 10 000) gives bands far narrower
//      than one FFT bin and is likely too selective for the look, so Q_SCALE < 1 broadens them.
// SHARPEN — a contrast exponent applied to each mode's raw energy before normalisation, so the
//      dominant mode dominates rather than every mode ringing faintly at once.
// TOP_K — after sharpening, only the K strongest modes survive; the rest are zeroed before
//      normalising, so the plate rings in a few sharp figures rather than a smear. The smoothing below
//      still eases amplitudes toward these targets, so a change in which modes win stays continuous.
// TOPK_HYST — hysteresis on that set so modes don't flicker at the boundary: a mode already in the set
//      holds until it drops below TOPK_HYST × the K-th threshold, while an outsider must exceed the
//      threshold outright to enter (so the set can briefly exceed K during a hand-off).
// TILT — a pink-noise correction. Music has a roughly 1/f energy slope, so bass dominates on every
//      track regardless of content; multiplying each mode's band energy by (freq/F_REF)^TILT before
//      SHARPEN cancels that universal bias, so mode selection reflects THIS section's spectral balance.
//      F_REF is just a scale (it cancels in the normalisation); the lowest resonance is used.
// SMOOTH_TAU — how fast the mode DISTRIBUTION (the relative weights that decide the figure's SHAPE)
//      chases the FFT. Slow on purpose: sand takes 1–2 s to cross a cell, so the figure's identity must
//      change gradually or it smears. Only the shape is on this path, not the intensity. SMOOTH_TAU is the
//      RISING rate; falling weights use RELEASE_TAU below (music mode only).
// RELEASE_TAU — the FALLING-edge time constant for the music-mode distribution (ASYMMETRIC smoothing).
//      Rising weights chase on SMOOTH_TAU; weights that are DROPPING relax on this instead. The symptom it
//      fixes: the top mode turns over ~2×/s but a loser fades over SMOOTH_TAU (~1.2 s), so recent winners
//      pile up as ghosts and a clean few-mode figure smears into 25–35 faint modes ringing at once. A
//      faster release clears a mode that just lost its energy before the next one piles on. Tuned to 0.20 s
//      and ON by default (RELEASE_ON) — the figure contracts to a few sharp modes instead of smearing. K
//      toggles the asymmetry off (back to symmetric SMOOTH_TAU) for A/B; H / J step this ×0.8 / ×1.25. Tone
//      mode (TONE_TAU) is untouched — this is the MUSIC path only.
// DIST_FLOOR — the exponential smoothing on st.dist means a mode dropped by TOP_K decays toward zero but
//      never reaches it, so the distribution grows a long tail of ghost modes that TOP_K already rejected.
//      After smoothing, any mode below DIST_FLOOR × the current max share is zeroed and the survivors are
//      renormalised — keeping the smooth crossfade between genuine winners while cutting the residual tail.
// DRIVE_TAU — how fast the overall LEVEL (the scalar that scales the whole amplitude vector and feeds
//      uAmplitude — the figure's INTENSITY, how violently the sand reacts) chases the drive. Fast, a
//      few frames, so a drop hits immediately even though the shape is still easing over ~SMOOTH_TAU.
// LEVEL_TAU — the time constant of the ROLLING baseline the drive level is measured against. It is
//      judged against the recent-past drive rather than an absolute scale, so a drop drives the plate
//      harder and a breakdown lets it fall quiet instead of looking identical. The baseline is tracked
//      in the LOG domain (a geometric mean): rawSum spans ~5 orders of magnitude, so an arithmetic mean
//      is dominated by the loudest moments and makes a later quiet passage read as silence.
const ETA = 1e-4
const Q_SCALE = 1.0
const Q = Q_SCALE / ETA
const SHARPEN = 12.0
const TOP_K = 2
const TOPK_HYST = 0.6   // a mode in the winning set stays until it falls below this × the K-th threshold
const TILT = 0.15
const SMOOTH_TAU = 1.2
const RELEASE_TAU = 0.20      // music-mode FALLING-edge time constant (see doc above); fast release, tuned default
const RELEASE_ON = true       // asymmetric release smoothing ON at load (K toggles it live)
const RELEASE_TAU_MIN = 0.1   // H / J live-tuning clamp range for RELEASE_TAU
const RELEASE_TAU_MAX = 5.0
const DIST_FLOOR = 0.04   // post-smoothing: zero any mode below this × the max share, then renormalise
const DRIVE_TAU = 0.15
const LEVEL_TAU = 4.0
const DRIVE_EPS = 1e-6   // seed the rolling drive baseline only from a frame whose rawSum exceeds this
// —— TONE BUTTONS. When a tone button is active (black-and-white mode only), the plate is driven by one
// pure tone instead of the music: each mode is weighted by the steady-state forced response of a damped
// oscillator at its eigenfrequency, w_n = 1/sqrt((f_n²−f²)² + (f·f_n/TONE_Q)²), normalised to sum 1, fed
// straight into the field (bypassing FFT/TILT/SHARPEN/TOP_K/DIST_FLOOR/baselines) at a constant level.
const TONE_Q = 500        // damping Q for the tone-button forced-response weights
const TONE_DRIVE = 1.2    // constant drive level while a tone is active (replaces the audio-derived level)

// —— THE MODE TABLE, from a free-edge circular-plate EIGENVALUE SOLVE. For a free edge the mode shapes
// are W(r) = J_n(λ·r/a) + c·I_n(λ·r/a) — a Bessel J plus a modified Bessel I — and the two free-edge
// conditions (zero radial bending moment and zero Kelvin–Kirchhoff shear at the rim r = a) form a 2×2
// system with a non-trivial solution only where its determinant vanishes. We root-find that determinant
// in λ for n = 0..12, keep the first SIX roots of each (n = 0 and n = 1 have rigid-body solutions at
// λ = 0 that are skipped by scanning from λ > 1), and turn each λ into a frequency via the PLATE above.
//
// Built ONCE at module load, then constant for the page. Verified against Leissa (Vibration of Plates,
// ν = 0.3): computed λ² of 9.00 / 5.36 / 12.44 / 38.44 for (0,1)/(2,1)/(3,1)/(0,2) against Leissa's
// 9.08 / 5.36 / 12.4 / 38.5 — all within ~1%.
function solveModes() {
  const { radius: a, thickness: h, E, nu, rho } = PLATE

  // Bessel J_n and modified Bessel I_n by ascending series (double precision). I_n is all-positive so
  // there is no cancellation; J_n is accurate well past the λ range we need. Derivatives via the
  // neighbour identities J_n' = (J_{n-1}−J_{n+1})/2, I_n' = (I_{n-1}+I_{n+1})/2.
  const bJ = (n, x) => { let t = 1; const g = x / 2; for (let i = 1; i <= n; i++) t *= g / i; let s = t; const g2 = g * g; for (let m = 1; m < 200; m++) { t *= -g2 / (m * (n + m)); s += t; if (Math.abs(t) < 1e-18 * Math.abs(s) && m > n) break } return s }
  const bI = (n, x) => { let t = 1; const g = x / 2; for (let i = 1; i <= n; i++) t *= g / i; let s = t; const g2 = g * g; for (let m = 1; m < 300; m++) { t *= g2 / (m * (n + m)); s += t; if (Math.abs(t) < 1e-18 * Math.abs(s) && m > n) break } return s }
  const dJ = (n, x) => n === 0 ? -bJ(1, x) : 0.5 * (bJ(n - 1, x) - bJ(n + 1, x))
  const dI = (n, x) => n === 0 ? bI(1, x) : 0.5 * (bI(n - 1, x) + bI(n + 1, x))

  // The free-edge determinant at λ = x (= k·a), with the J:I mode-shape mix c read off the same 2×2.
  // Divided by cosh(x) to tame I_n's exponential growth without moving the zeros.
  const om = 1 - nu
  const det = (n, x) => {
    const J = bJ(n, x), Jp = dJ(n, x), I = bI(n, x), Ip = dI(n, x)
    const x2 = x * x, n2 = n * n
    const a11 = (nu - 1) * x * Jp - (x2 - n2 * om) * J
    const a12 = (nu - 1) * x * Ip + (x2 + n2 * om) * I
    const a21 = -x * (x2 + om * n2) * Jp + om * n2 * J
    const a22 = x * (x2 - om * n2) * Ip + om * n2 * I
    const c = Math.abs(a12) > Math.abs(a22) ? -a11 / a12 : -a21 / a22
    return { d: (a11 * a22 - a12 * a21) / Math.cosh(x), c }
  }

  // Bending stiffness and the λ²→Hz factor (biharmonic plate, ω ∝ λ²).
  const D = E * h ** 3 / (12 * (1 - nu * nu))
  const fscale = Math.sqrt(D / (rho * h)) / (2 * Math.PI * a * a)

  const out = []
  for (let n = 0; n <= 12; n++) {
    const step = 0.002
    let px = 1.0, pd = det(n, px).d
    let found = 0
    for (let x = 1.0 + step; x <= 30 && found < 6; x += step) {
      const cur = det(n, x).d
      if ((pd < 0) !== (cur < 0)) {                 // sign change → a root in [px, x]; bisect
        let lo = px, hi = x, flo = pd
        for (let it = 0; it < 80; it++) {
          const mid = 0.5 * (lo + hi), fm = det(n, mid).d
          if ((flo < 0) !== (fm < 0)) hi = mid; else { lo = mid; flo = fm }
        }
        const lam = 0.5 * (lo + hi), c = det(n, lam).c
        // Peak of |W(r)| over the plate, so the field can be normalised to ~±1 as the old table was.
        let peak = 0
        for (let i = 0; i <= 400; i++) { const r = i / 400; peak = Math.max(peak, Math.abs(bJ(n, lam * r) + c * bI(n, lam * r))) }
        out.push({ n, m: found + 1, lambda: lam, c, peak, freq: lam * lam * fscale, phi: Math.random() * Math.PI * 2 })
        found++
      }
      px = x; pd = cur
    }
  }
  return out.sort((p, q) => p.freq - q.freq)
}

// —— SELECTION. The solver yields ~76 modes (n = 0..12 × up to 6 roots). The physical filter is the
// USABLE AUDIO WINDOW: a mode the FFT can never drive (below ~400 Hz or above ~16 kHz) is inert, so we
// keep every mode whose frequency lands inside it. Because f ∝ λ² the high-(n,m) modes climb out of the
// band fast, so the window alone does most of the culling (~76 → ~48). That is the table — UNLESS it
// exceeds `count`, in which case the field would be no denser (TOP_K still rings only a pair) but the
// catalogue would skew toward whatever (n,m) region is most crowded. So past `count` we fall back to
// farthest-point spread sampling in normalised (n,m) space, seeded from the four corners, to keep
// bullseyes (low n, low m), many-spoked stars (high n, low m), rings (low n, high m) and fine mesh (high
// n, high m) all represented. When the in-window pool is already ≤ count, every in-window mode is kept.
function selectSpread(modes, count) {
  const pool = modes.filter((m) => m.freq >= 400 && m.freq <= 16000)
  const maxN = Math.max(...modes.map((m) => m.n))
  const maxM = Math.max(...modes.map((m) => m.m))
  const nm = (a) => [a.n / maxN, (a.m - 1) / (maxM - 1)]   // normalise both axes to [0,1]
  const dist = (a, b) => { const [x1, y1] = nm(a), [x2, y2] = nm(b); return Math.hypot(x1 - x2, y1 - y2) }
  const chosen = []
  // seed with the in-window mode nearest each (n,m) corner, so the extremes are guaranteed present
  for (const [cn, cm] of [[0, 1], [maxN, 1], [0, maxM], [maxN, maxM]]) {
    let best = null, bd = Infinity
    for (const p of pool) { const d = Math.hypot(p.n - cn, p.m - cm); if (d < bd) { bd = d; best = p } }
    if (best && !chosen.includes(best)) chosen.push(best)
  }
  // farthest-point fill: repeatedly add the mode farthest (in (n,m)) from everything already chosen
  while (chosen.length < count && chosen.length < pool.length) {
    let best = null, bd = -1
    for (const p of pool) {
      if (chosen.includes(p)) continue
      let dmin = Infinity
      for (const c of chosen) dmin = Math.min(dmin, dist(p, c))
      if (dmin > bd) { bd = dmin; best = p }
    }
    if (!best) break
    chosen.push(best)
  }
  return chosen.sort((a, b) => a.freq - b.freq)
}

// Every in-window eigenmode kept (cap 48 ≥ the ~48 in-window modes, so the spread sampling never culls).
const ALL_MODES = solveModes()
const MODES = selectSpread(ALL_MODES, 48)   // the MUSIC set — the 400 Hz–16 kHz filter lives in selectSpread
const N_MUSIC = MODES.length                // music drives ONLY these; its FFT selection iterates N_MUSIC
// The (2,1) 244 Hz mode sits below selectSpread's 400 Hz window, so it is absent from the music set above.
// Append it for the TONE path (and so the field/overlay can show it) only — music never drives it, because
// the FFT band loop in the frame loop stops at N_MUSIC. Appended LAST, so MODES[0] (the TILT reference) and
// the whole music set are untouched.
MODES.push(...ALL_MODES.filter((m) => m.n === 2 && m.m === 1))
const MODE_COUNT = MODES.length             // field / uModes / state arrays / the tone-weight loop (N_MUSIC + extras)
const F_REF = MODES[0].freq   // lowest MUSIC resonance (410 Hz) — the TILT reference (cancels in the normalisation)

// —— TONE BUTTONS (black-and-white mode only; see the tone branch in the frame loop and App.jsx). Five
// eigenmodes, chosen to look clearly different — a two-diameter cross (the plate's lowest mode, 244 Hz,
// below the music window), a single ring, a many-spoked star, a double ring, and a cross-plus-rings lattice.
// Each button drives the plate with that one pure tone. Built from the solved table so the labels are real Hz.
const TONE_PRESET_NM = [[2, 1], [0, 1], [5, 1], [0, 2], [2, 3]]
export const TONE_PRESETS = TONE_PRESET_NM
  .map(([n, m]) => MODES.find((x) => x.n === n && x.m === m))
  .filter(Boolean)
  .map((mode) => ({ n: mode.n, m: mode.m, freq: mode.freq, hz: Math.round(mode.freq) }))

// Bessel J_n via the integral J_n(x) = (1/π)∫₀^π cos(nτ − x·sinτ) dτ, Simpson's rule, 64 intervals.
// Plenty accurate for the x ≤ ~18 range here, and only called to build a small radial lookup per mode.
function besselJ(n, x) {
  const N = 64, h = Math.PI / N
  let s = Math.cos(n * 0) + Math.cos(n * Math.PI - x * Math.sin(Math.PI))
  for (let i = 1; i < N; i++) {
    const t = i * h
    s += (i % 2 ? 4 : 2) * Math.cos(n * t - x * Math.sin(t))
  }
  return (s * h / 3) / Math.PI
}

// Modified Bessel I_n by ascending series (all-positive, no cancellation). Only used, with besselJ above,
// to find the nodal circles of the dominant mode for the O-key overlay — cheap and rebuilt rarely.
function besselI(n, x) {
  const g = x / 2
  let t = 1
  for (let i = 1; i <= n; i++) t *= g / i
  let s = t
  const g2 = g * g
  for (let m = 1; m < 300; m++) { t *= g2 / (m * (n + m)); s += t; if (Math.abs(t) < 1e-16 * Math.abs(s) && m > n) break }
  return s
}

// —— NODAL-LINE OVERLAY (O key). Build the line segments of one mode's theoretical nodal set, in world XZ
// at y = 0, so the same display camera projects them straight onto the sand. The field is
// W(r,θ) = [J_n(λr) + c·I_n(λr)]·cos(nθ + φ) with field-r = |xz| / FIELD_R, so the nodal set is the union
// of the radial zeros (concentric CIRCLES) and, for n ≥ 1, the zeros of cos(nθ+φ) (n DIAMETERS through the
// centre). Returns a flat [x,y,z, x,y,z, …] of segment endpoints for a THREE.LineSegments.
function nodalLineSegments(mode) {
  const { n, lambda: lam, c, phi } = mode
  const seg = []
  const push = (x1, z1, x2, z2) => seg.push(x1, 0, z1, x2, 0, z2)
  const rimField = EDGE_R / FIELD_R   // grains reach ~this field-radius; draw the figure out to here

  // Radial nodal circles: zeros of R(rf) = J_n(λ·rf) + c·I_n(λ·rf) for rf in (0, rimField).
  const R = (rf) => besselJ(n, lam * rf) + c * besselI(n, lam * rf)
  const SEGN = 128
  let prevRf = 1e-3, prev = R(prevRf)
  for (let s = 1; s <= 400; s++) {
    const rf = (s / 400) * rimField
    const cur = R(rf)
    if ((prev < 0) !== (cur < 0)) {
      let lo = prevRf, hi = rf, flo = prev
      for (let it = 0; it < 60; it++) { const mid = 0.5 * (lo + hi), fm = R(mid); if ((flo < 0) !== (fm < 0)) hi = mid; else { lo = mid; flo = fm } }
      const rw = 0.5 * (lo + hi) * FIELD_R   // world radius of this nodal circle
      for (let k = 0; k < SEGN; k++) {
        const a0 = (k / SEGN) * Math.PI * 2, a1 = ((k + 1) / SEGN) * Math.PI * 2
        push(rw * Math.cos(a0), rw * Math.sin(a0), rw * Math.cos(a1), rw * Math.sin(a1))
      }
    }
    prevRf = rf; prev = cur
  }

  // Angular nodal diameters: cos(nθ + φ) = 0 → θ = (π/2 + kπ − φ)/n, k = 0..n−1 (n full diameters).
  const L = rimField * FIELD_R   // world half-length — span the sand disc
  for (let k = 0; k < n; k++) {
    const th = (Math.PI / 2 + k * Math.PI - phi) / n
    push(-L * Math.cos(th), -L * Math.sin(th), L * Math.cos(th), L * Math.sin(th))
  }
  return new Float32Array(seg)
}

export {
  TEX, PARTICLE_COUNT, PLATE_R, EDGE_R, SPAWN_R, FIELD_R, DENSITY_TEX,
  Q, SHARPEN, TOP_K, TOPK_HYST, TILT, SMOOTH_TAU, RELEASE_TAU, RELEASE_ON, RELEASE_TAU_MIN, RELEASE_TAU_MAX,
  DIST_FLOOR, DRIVE_TAU, LEVEL_TAU, DRIVE_EPS,
  TONE_Q, TONE_DRIVE,
  MODES, N_MUSIC, MODE_COUNT, F_REF,
  besselJ, besselI, nodalLineSegments,
}
