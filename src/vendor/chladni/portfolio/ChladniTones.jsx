// GENERATED from chladni@1151010 (v5-portfolio). Do not edit here. Edit in ~/Desktop/chladni and re-sync.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChladniSim } from '../sim/ChladniSim.js'
import { toneDriver } from '../sim/drivers/tone.js'
import { createToneAudio } from '../sim/toneAudio.js'
import { TONE_PRESETS, TONE_Q, TONE_DRIVE } from '../sim/plate.js'

// —— ChladniTones: a self-contained, portfolio-ready Chladni plate. It stands entirely on the extracted
// engine (ChladniSim) + the tone driver + the standalone tone oscillator — NOTHING from the music pipeline
// (no analyser, no FFT selection, no App wiring). It drives the plate with one pure tone at a time, chosen
// from five buttons, and NEVER installs a window/document keyboard listener — so Space still scrolls the
// page the component is embedded in. The parent gives it a sized box; it fills it and manages its own
// lifecycle (resize via ChladniSim's ResizeObserver, pause when offscreen/hidden, full teardown on unmount).
//
// LOOK: plain black-on-white only. arrival=false selects the engine's plain ink composite (white fog, black
// ink, no haze/atmos/wisps/veil); wisp/veil are off so none of the Arrival-only code paths ever run. This
// object is a module constant with a stable identity — the frame loop passes the same reference every frame.
const LOOK = Object.freeze({ arrival: false, inkGamma: 1.0, wisp: false, wispEmit: 0, veil: false, veilAmt: 0, atmos: 0 })

// —— IDLE SHIMMER defaults (render-only; see IDLE SHIMMER in POINTS_VERT). While idle the physics is frozen,
// so a tiny per-grain wander is added at DRAW time to keep the disc alive. Amp is a world-unit amplitude ≈ one
// grain diameter (uSize = 0.006); speed scales time (slow organic wander). These are the LOCKED portfolio
// values; ?portfolio-preview can still override them live via props (dev-only — it does not ship).
export const DEFAULT_SHIMMER_AMP = 0.006    // LOCKED
export const DEFAULT_SHIMMER_SPEED = 0.8    // LOCKED
const SHIMMER_FADE_IN = 0.5    // seconds, 0→1 on entering idle
const SHIMMER_FADE_OUT = 0.3   // seconds, 1→0 when a tone starts

// —— TONE-OFF TRANSITION. Three modes cycled on the preview page (D); default HYBRID.
//
// HYBRID (default): a physical spread THEN a render-only dissolve that lands exactly on a fresh sprinkle.
//   (1) RING-DOWN — the field decays over the tone's own ring-down time TONE_TAU = Q/(π·f) (per-mode relaxation
//       + an exp level envelope), audio fading over the same time.
//   (2) SPREAD — field zero; the granular sim runs with agitation, density spreading (×SPREAD_GAIN) and the rim
//       force for SPREAD_DUR; grain velocities ease to zero over the last SPREAD_EASE so they decelerate first.
//   (3) HANDOFF — snapshot the spread positions, full re-sprinkle in the sim, uStill on; then the existing
//       render-only dissolve cross-fades from that snapshot to the fresh sprinkle over DISSOLVE_DUR.
//   (4) shimmer fades in. The sim ends on a TRUE fresh sprinkle (what the first tone click from idle relies on).
// SPREAD-only: ring-down + spread + ease, no dissolve/re-sprinkle — ends uneven, so st.sandFresh is false and
//   the next tone re-sprinkles. DISSOLVE-only: the old path — snapshot the figure, instant re-sprinkle, cross-
//   fade figure→fresh over DISSOLVE_DUR. Both DISSOLVE stages leave the sim fresh (render-only over a re-sprinkle).
// Default mode is HYBRID and the values below are the LOCKED portfolio values. ?portfolio-preview can still
// tune them live (SPREAD_DUR , . / SPREAD_GAIN ; ' / DISSOLVE_DUR 9 0) and cycle the mode (D), but that HUD +
// key scaffolding is dev-only — it does not ship; production runs on these constants.
export const DEFAULT_SPREAD_DUR = 0.6    // LOCKED — physical-spread length (ring-down precedes it)
export const DEFAULT_SPREAD_GAIN = 3     // LOCKED — density-spreading boost (see the CV measurement)
export const DEFAULT_DISSOLVE_DUR = 0.6  // LOCKED — render-only cross-fade onto the fresh sprinkle
const SPREAD_EASE = 0.15                  // seconds of velocity ramp-to-zero at the tail of the spread
const RINGDOWN_MAX = 0.8                  // cap on the ring-down phase (low tones ring longest)
const DISSOLVE_JITTER = 0.004
const TURNOFF_MODES = ['hybrid', 'spread', 'dissolve']   // D cycles through these (default = hybrid)

// prefers-reduced-motion, read on demand (no listener) — gates the shimmer, the dissolve AND the spread.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

// —— Parse any CSS colour string to raw sRGB [r,g,b] in 0..1, via a cached 1×1 2D canvas — the browser resolves
// hex / rgb() / named colours to the exact sRGB bytes it would paint, so a flat fill matches the host surface to
// the byte. Returns null for an unparseable value (caller falls back to the default look).
let _ccvs, _cctx
function cssToSRGB(str) {
  if (typeof document === 'undefined' || !str) return null
  if (!_cctx) { _ccvs = document.createElement('canvas'); _ccvs.width = _ccvs.height = 1; _cctx = _ccvs.getContext('2d') }
  _cctx.fillStyle = '#000'; _cctx.fillStyle = str
  if (_cctx.fillStyle === '#000' && !/^#0{3,8}$|black|rgba?\(\s*0\b/i.test(str.trim())) return null  // fillStyle unchanged ⇒ invalid
  _cctx.fillRect(0, 0, 1, 1)
  const d = _cctx.getImageData(0, 0, 1, 1).data
  return [d[0] / 255, d[1] / 255, d[2] / 255]
}

// Parse a { bg, ink } colours prop into { bg:[r,g,b], ink:[r,g,b] } (raw sRGB) for the engine, or null (default
// look) when the prop is absent or unparseable. Called only when the prop changes — cheap.
function parseColors(colors) {
  if (!colors || !colors.bg || !colors.ink) return null
  const bg = cssToSRGB(colors.bg), ink = cssToSRGB(colors.ink)
  return bg && ink ? { bg, ink } : null
}

// WebGL availability probe, re-exported so a parent can branch before mounting (rule 8).
export { canRunChladni } from '../sim/ChladniSim.js'

export default function ChladniTones({ onFailure, shimmerAmp, shimmerSpeed, turnoffMode = 'hybrid', spreadDur, spreadGain, dissolveDur, unstyled = false, className, colors }) {
  const hostRef = useRef(null)
  const simRef = useRef(null)
  const audioRef = useRef(null)

  // Active tone + math-overlay, each mirrored in a ref so the frame-loop driver and the (re)build effects read
  // the live value without re-running, while React state drives the button rendering (aria-pressed + styling).
  // IDLE ON MOUNT: no tone is selected (activeHz = null, activeToneRef = null). An undriven plate doesn't move
  // sand, so the driver drives nothing and the fresh sprinkle sits still (reads as one even disc) until the
  // first click. All five buttons are aria-pressed=false and "Show the math" is disabled (no figure to prove).
  const [activeHz, setActiveHz] = useState(null)
  const activeToneRef = useRef(null)
  const [mathOn, setMathOn] = useState(false)
  const mathOnRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const mutedRef = useRef(false)

  // onFailure can change identity across renders; the mount-once effects capture it via a ref so they don't
  // need it in their dep arrays (keeping them true mount-once, which matters for the leak/teardown guarantees).
  const onFailureRef = useRef(onFailure)
  onFailureRef.current = onFailure

  // Shimmer amp/speed are props (the preview page tunes them live), mirrored into refs so the mount-once frame
  // loop reads the live value every frame without re-running. Undefined props fall back to the module defaults.
  const shimmerAmpRef = useRef(shimmerAmp ?? DEFAULT_SHIMMER_AMP)
  shimmerAmpRef.current = shimmerAmp ?? DEFAULT_SHIMMER_AMP
  const shimmerSpeedRef = useRef(shimmerSpeed ?? DEFAULT_SHIMMER_SPEED)
  shimmerSpeedRef.current = shimmerSpeed ?? DEFAULT_SHIMMER_SPEED
  const turnoffModeRef = useRef(turnoffMode)
  turnoffModeRef.current = turnoffMode
  const spreadDurRef = useRef(spreadDur ?? DEFAULT_SPREAD_DUR)
  spreadDurRef.current = spreadDur ?? DEFAULT_SPREAD_DUR
  const spreadGainRef = useRef(spreadGain ?? DEFAULT_SPREAD_GAIN)
  spreadGainRef.current = spreadGain ?? DEFAULT_SPREAD_GAIN
  const dissolveDurRef = useRef(dissolveDur ?? DEFAULT_DISSOLVE_DUR)
  dissolveDurRef.current = dissolveDur ?? DEFAULT_DISSOLVE_DUR
  // Host matte colours: parse the { bg, ink } prop to raw sRGB (null ⇒ default look). useMemo keyed on the
  // actual strings re-parses only on a real change; mirroring into a ref (every render, idempotent) lets the
  // mount-once build effect read the CURRENT value without a render-phase stale-check — concurrent/StrictMode
  // safe. The sim is handed these via setColors (on build AND on change), never via per-frame look data.
  const parsedColors = useMemo(() => parseColors(colors), [colors?.bg, colors?.ink])
  const colorsRef = useRef(parsedColors)
  colorsRef.current = parsedColors
  // Turn-off transition state. null when idle/driving; else a live clock the frame loop advances through its
  // phases (ring-down → spread → handoff → dissolve, per mode). `cmd` is the per-frame driver command the tick
  // computes; `look.dissolve*` for the render-only cross-fade is set alongside it. See runTransition() below.
  const transitionRef = useRef(null)

  // —— Build the engine once per mount. ChladniSim owns its own canvas, ResizeObserver and WebGL teardown; a
  // construction failure (renderer create / shader compile / context loss) is reported via its onFailure, which
  // we forward to the prop so the parent can show a fallback. A hard synchronous throw is caught here too.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let sim
    try {
      sim = new ChladniSim(host, { onFailure: (fl) => onFailureRef.current?.(fl) })
    } catch (e) {
      console.error('[ChladniTones] ChladniSim construction threw:', e)
      onFailureRef.current?.({ reason: 'construct-throw', detail: String(e?.message || e) })
      return
    }
    if (sim.failed) return   // onFailure already fired inside the constructor; nothing usable to keep
    simRef.current = sim
    // Fully apply the CURRENT props to THIS sim instance, up front — so every (re)mount's sim renders correctly
    // from its first frame, never depending on a later frame to pick up the host colours or overlay state.
    sim.setColors(colorsRef.current)
    sim.setOverlay(mathOnRef.current)   // re-apply the "Show the math" state across a (StrictMode) rebuild
    return () => {
      simRef.current = null
      sim.dispose()
    }
  }, [])

  // —— Live host-colour updates (e.g. a theme toggle) without a remount: push the new colours to the current
  // sim. Render only — no re-sprinkle, no sim reset. On a (re)mount this also runs, but the build effect above
  // has already applied the colours, so this is a harmless no-op re-apply then.
  useEffect(() => { simRef.current?.setColors(parsedColors) }, [parsedColors])

  // —— The tone oscillator (standalone AudioContext, created lazily on the first click — never on mount). Built
  // once per mount and disposed on unmount (closes the context). Re-apply the mute state across a rebuild.
  useEffect(() => {
    const audio = createToneAudio()
    audio.setMuted(mutedRef.current)
    audioRef.current = audio
    return () => {
      audioRef.current = null
      audio.dispose()
    }
  }, [])

  // —— rAF loop + pause control. The loop runs ONLY while the plate is both on-screen (IntersectionObserver)
  // and the tab is visible (visibilitychange); otherwise the loop is cancelled and the tone is suspended. The
  // driver pins the plate into tone mode every frame: it weights the modes by the forced response at the active
  // tone (toneDriver), marks st.toneActive (so the engine uses the physical per-mode ring-down and the amplitude
  // hop), and zeroes every audio-band / ambient input (this plate is driven by a pure tone, not by analysed
  // audio — toneDriver pins st.audio to 1, so we clear it AFTER the call). No keyboard listeners anywhere.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const zeroTarget = (st) => { for (let i = 0; i < st.targetAmp.length; i++) st.targetAmp[i] = 0 }

    const driver = (st) => {
      st.bass = 0; st.mids = 0; st.highs = 0          // no analysed audio drives this plate
      st.audio = 0                                    // pure tone / idle, never the live-audio blend
      st.ambient = 0                                  // no paused-tremble depth
      st.spreadGain = 1                               // boosted only in the SPREAD phase (set via tr.cmd)
      st.velScale = 1                                 // eased to 0 only at the tail of the SPREAD (via tr.cmd)

      // —— TURN-OFF TRANSITION. The tick (runTransition, below) advances the phase clock, handles the handoff,
      // and writes tr.cmd for this frame; the driver just applies it. zeroTarget keeps every mode weight 0 so
      // the field is only ever the ring-down's natural per-mode decay (toneActive) or nothing.
      const tr = transitionRef.current
      if (tr && tr.active && tr.cmd) {
        const c = tr.cmd
        st.toneActive = c.toneActive
        st.still = c.still
        st.spreadGain = c.spreadGain
        st.velScale = c.velScale
        zeroTarget(st)
        return c.level
      }

      const tone = activeToneRef.current
      if (!tone) {
        // IDLE: no tone selected. Nothing drives the plate — every mode weight 0, st.toneActive unset — so
        // the sand doesn't move. st.still gates the velocity/position passes to a true standstill (no agitation
        // floor, no density spreading, no rim settling), matching the physics: an undriven plate is silent.
        st.toneActive = 0
        st.still = 1
        zeroTarget(st)
        return 0                                      // zero drive level
      }
      st.still = 0
      const level = toneDriver(st, tone)              // writes st.targetAmp (unit-sum forced-response weights)
      st.toneActive = tone                            // truthy ⇒ physical ring-down + amplitude hop (not music)
      st.audio = 0                                    // override toneDriver's st.audio = 1 (pure tone, no live blend)
      return level
    }

    // A mutable per-instance look: same reference every frame (stable identity), with the render-only shimmer
    // and dissolve fields updated below. Built from the plain LOOK template so the ink/arrival settings stay.
    const look = { ...LOOK, shimmerAmp: 0, shimmerSpeed: 0, shimmerEnv: 0, dissolveOn: 0, dissolveProgress: 0, dissolveJitter: 0 }
    let shimmerEnv = 0   // 0..1 fade envelope: ramps toward 1 once fully idle, toward 0 otherwise

    // —— Advance an in-flight turn-off transition by dt: pick the phase, write tr.cmd (the driver applies it)
    // and look.dissolve* (the render-only cross-fade), and perform the hybrid HANDOFF (snapshot + re-sprinkle)
    // at the spread→dissolve boundary. Centralised here (not in the driver) so the handoff and the dissolve
    // uniforms line up on the same frame with no cross-frame lag. `sim` is the live engine.
    const runTransition = (tr, sim, dt) => {
      tr.elapsed += dt
      const t = tr.elapsed
      const cmd = { toneActive: 0, still: 1, spreadGain: 1, velScale: 1, level: 0 }
      let dissolveOn = 0, dissolveProgress = 0
      if (tr.mode === 'dissolve') {
        // Snapshot + re-sprinkle already done in goIdle; just run the render-only cross-fade (sim frozen fresh).
        dissolveOn = 1
        dissolveProgress = Math.min(1, t / tr.dissolveDur)
        if (t >= tr.dissolveDur) tr.active = false
      } else if (t < tr.ringdownDur) {
        // (1) RING-DOWN — the field decays over the tone's TONE_TAU (per-mode) under an exp level envelope.
        cmd.toneActive = tr.freq; cmd.still = 0; cmd.level = TONE_DRIVE * Math.exp(-t / tr.tau)
      } else if (t - tr.ringdownDur < tr.spreadDur) {
        // (2) SPREAD (+ (3) EASE in the last easeDur): field zero, boosted spreading, velocities ramp to rest.
        const sT = t - tr.ringdownDur
        cmd.toneActive = 0; cmd.still = 0; cmd.spreadGain = tr.gain
        const easeStart = tr.spreadDur - tr.easeDur
        cmd.velScale = sT > easeStart ? Math.max(0, (tr.spreadDur - sT) / tr.easeDur) : 1
      } else if (tr.mode === 'spread') {
        tr.active = false   // spread-only: end uneven (sandFresh stays false → next tone re-sprinkles)
      } else {
        // HYBRID HANDOFF → DISSOLVE. Snapshot the spread result, re-sprinkle the sim to a TRUE fresh sprinkle,
        // then cross-fade (render-only, sim frozen fresh) from that snapshot onto the sprinkle.
        if (!tr.handoffDone) { sim.snapshot(); sim.resprinkle(1.0); tr.handoffDone = true }
        const dT = t - tr.ringdownDur - tr.spreadDur
        dissolveOn = 1
        dissolveProgress = Math.min(1, dT / tr.dissolveDur)
        if (dT >= tr.dissolveDur) tr.active = false
      }
      tr.cmd = cmd
      look.dissolveOn = (tr.active && dissolveOn) ? 1 : 0
      look.dissolveProgress = dissolveProgress
    }

    let raf = 0
    let last = 0
    let onscreen = false
    let visible = typeof document === 'undefined' || !document.hidden

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const s = simRef.current
      if (!s) return
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
      last = now
      const reduce = prefersReducedMotion()

      look.dissolveOn = 0
      look.dissolveProgress = 0
      look.dissolveJitter = reduce ? 0 : DISSOLVE_JITTER
      const tr = transitionRef.current
      if (tr && tr.active) runTransition(tr, s, dt)

      // —— Idle shimmer envelope: fade in over SHIMMER_FADE_IN, out over SHIMMER_FADE_OUT (linear, so durations
      // are exact). Held at 0 while a tone drives OR while a turn-off transition is running, so the shimmer only
      // begins once the plate is fully idle (after the dissolve). Amp is zeroed under reduced-motion.
      const transitioning = !!(tr && tr.active)
      const target = (!activeToneRef.current && !transitioning) ? 1 : 0
      if (target > shimmerEnv) shimmerEnv = Math.min(1, shimmerEnv + dt / SHIMMER_FADE_IN)
      else if (target < shimmerEnv) shimmerEnv = Math.max(0, shimmerEnv - dt / SHIMMER_FADE_OUT)
      look.shimmerAmp = reduce ? 0 : shimmerAmpRef.current
      look.shimmerSpeed = shimmerSpeedRef.current
      look.shimmerEnv = shimmerEnv
      s.step(dt, { driver, look })   // host colours are a sim property (setColors), not per-frame look data
    }
    const startLoop = () => {
      if (raf) return
      last = 0
      raf = requestAnimationFrame(tick)
      audioRef.current?.resume()
    }
    const stopLoop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
      audioRef.current?.suspend()
    }
    const sync = () => { if (onscreen && visible) startLoop(); else stopLoop() }

    // IntersectionObserver fires once right after observe() with the real state, so it (not a manual call) is
    // what starts the loop initially — a plate mounted below the fold stays paused until it scrolls into view.
    const io = new IntersectionObserver((entries) => {
      const next = entries[entries.length - 1].isIntersecting
      if (next === onscreen) return
      onscreen = next
      console.log(`[ChladniTones] intersection: ${onscreen ? 'on-screen — resuming rAF' : 'off-screen — pausing rAF'}`)
      sync()
    }, { threshold: 0 })
    io.observe(host)

    const onVis = () => {
      visible = !document.hidden
      console.log(`[ChladniTones] visibility: ${visible ? 'visible — resuming rAF' : 'hidden — pausing rAF'}`)
      sync()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      audioRef.current?.suspend()
    }
  }, [])

  // —— Return to the idle state (the undriven, still, shimmering disc). Reached by clicking the already-active
  // tone (a plain toggle-off). The sound always fades out over that tone's own physical ring-down TONE_TAU =
  // Q/(π·f) so it dies away rather than clicking off, and "Show the math" turns off and disables again. The
  // visual depends on the turn-off mode (see the TONE-OFF TRANSITION note). Under reduced-motion, every mode
  // skips straight to the fresh even dot with an instant re-sprinkle (no animation) so idle is always fresh.
  const goIdle = useCallback(() => {
    const freq = activeToneRef.current
    if (freq) audioRef.current?.fadeOut(TONE_Q / (Math.PI * freq))
    const reduce = prefersReducedMotion()
    const mode = turnoffModeRef.current
    if (reduce || !freq) {
      simRef.current?.resprinkle(1.0)   // instant fresh dot (no animation)
      transitionRef.current = null
    } else if (mode === 'dissolve') {
      // Old render-only path: snapshot the FIGURE, instant re-sprinkle, cross-fade figure→fresh. Sim ends fresh.
      simRef.current?.snapshot()
      simRef.current?.resprinkle(1.0)
      transitionRef.current = { active: true, mode: 'dissolve', elapsed: 0, dissolveDur: dissolveDurRef.current, cmd: { toneActive: 0, still: 1, spreadGain: 1, velScale: 1, level: 0 } }
    } else {
      // HYBRID (default) or SPREAD-only: start the ring-down→spread transition. The handoff + dissolve (hybrid
      // only) happen inside runTransition at the spread's end. No snapshot/re-sprinkle here.
      const tau = TONE_Q / (Math.PI * freq)
      const sd = Math.max(0.1, spreadDurRef.current)
      transitionRef.current = {
        active: true, mode, elapsed: 0, freq, tau,
        ringdownDur: Math.min(RINGDOWN_MAX, Math.max(0.15, 2.3 * tau)),
        spreadDur: sd, gain: spreadGainRef.current, easeDur: Math.min(SPREAD_EASE, sd * 0.5),
        dissolveDur: dissolveDurRef.current, handoffDone: false, cmd: null,
      }
    }
    activeToneRef.current = null
    setActiveHz(null)
    if (mathOnRef.current) {           // no figure to prove anymore → turn the overlay off and disable it
      mathOnRef.current = false
      simRef.current?.setOverlay(false)
      setMathOn(false)
    }
  }, [])

  // —— Tone button. Clicking the CURRENTLY ACTIVE tone toggles it off → idle (goIdle). Otherwise the click
  // starts the tone (creating/resuming the AudioContext on the gesture). FRESHNESS RULE: a click may skip the
  // re-sprinkle ONLY when the click is from idle AND the sim is still a true fresh sprinkle (st.sandFresh) — on
  // load, or after a hybrid/dissolve turn-off. Otherwise it re-sprinkles: a tone CHANGE, a click mid-spread
  // (grains have moved, not fresh), or a click after a spread-only turn-off (ended uneven). A click mid-dissolve
  // is fresh (the sim was already re-sprinkled) so it skips and the tone forms from the live sprinkle. This is
  // the fix for a leftover figure becoming the next figure's starting load.
  const selectTone = useCallback((preset) => {
    if (activeToneRef.current === preset.freq) { goIdle(); return }
    if (transitionRef.current) transitionRef.current.active = false   // a tone click cancels any turn-off transition
    const audio = audioRef.current
    if (audio) audio.ensure().then(() => audio.start(preset.freq)).catch(() => { /* context blocked */ })
    const fromIdle = activeToneRef.current == null
    const fresh = !!simRef.current?.st?.sandFresh
    activeToneRef.current = preset.freq
    setActiveHz(preset.hz)
    if (!(fromIdle && fresh)) simRef.current?.resprinkle(1.0)
  }, [goIdle])

  // Mute toggles SOUND ONLY — it never touches the simulation, so the figure keeps forming and switching while
  // muted. It does not create an AudioContext (setMuted only flips a flag + any live gain), so muting before the
  // first tone click stays silent-by-default and the "no AudioContext until first click" rule holds.
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    audioRef.current?.setMuted(next)
    setMuted(next)
  }, [])

  // "Show the math": the engine's theoretical nodal-line overlay of the dominant mode (sim.setOverlay).
  const toggleMath = useCallback(() => {
    const next = !mathOnRef.current
    mathOnRef.current = next
    simRef.current?.setOverlay(next)
    setMathOn(next)
  }, [])

  return (
    <div className={className} style={ROOT_STYLE}>
      {/* Default control styling: ONE low-specificity :where() block (see CONTROL_CSS). Omitted entirely when
          `unstyled`, so a host styles the stable class names from scratch. It is global by class name — that is
          the point: hosts target .chladni-controls / -tone / -mute / -math and the [aria-pressed] / :disabled
          state hooks. The canvas/sim and root layout stay inline below (they are not controls). */}
      {!unstyled && <style>{CONTROL_CSS}</style>}

      {/* ChladniSim appends its canvas here imperatively (position:absolute; inset:0). */}
      <div ref={hostRef} style={HOST_STYLE} />

      {/* Controls. Real <button>s only — focusable, space/enter activate the focused control natively, and NO
          global key handler is installed, so Space with nothing focused scrolls the page. No inline styles:
          the look lives in CONTROL_CSS, and aria-pressed / disabled stay the state hooks (hosts style those). */}
      <div className="chladni-controls">
        <div className="chladni-row">
          {TONE_PRESETS.map((p) => {
            const active = activeHz === p.hz
            return (
              <button
                key={p.hz}
                type="button"
                className="chladni-tone"
                aria-pressed={active}
                aria-label={`${p.hz} hertz tone`}
                onClick={() => selectTone(p)}
              >
                {p.hz} Hz
              </button>
            )
          })}
        </div>
        <div className="chladni-row">
          <button
            type="button"
            className="chladni-mute"
            aria-pressed={muted}
            onClick={toggleMute}
          >
            {muted ? 'Muted' : 'Mute'}
          </button>
          <button
            type="button"
            className="chladni-math"
            aria-pressed={mathOn}
            onClick={toggleMath}
            disabled={activeHz === null}
          >
            Show the math
          </button>
        </div>
      </div>
    </div>
  )
}

// —— Root + canvas-host layout. This is sim/layout, NOT controls, so it stays inline (the component is a
// drop-in that fills its parent; the white backdrop is the plate's). Control styling lives in CONTROL_CSS.
const ROOT_STYLE = { position: 'relative', width: '100%', height: '100%', background: '#fff', overflow: 'hidden' }
const HOST_STYLE = { position: 'absolute', inset: 0 }

// —— DEFAULT CONTROL STYLING (one plain CSS block, injected via <style> unless `unstyled`). Every selector is
// wrapped in :where() so it carries ZERO specificity — any host rule on the same class or state (even a bare
// element selector) overrides it with NO !important. The look is the original monochrome pill set, so
// ?portfolio-preview is pixel-identical: outlined white pills; the active one (aria-pressed="true" — a selected
// tone, Muted, or math-on) inverts to a filled black chip; "Show the math" before any tone is :disabled (dimmed).
const CONTROL_CSS = `
:where(.chladni-controls){position:absolute;left:0;right:0;bottom:16px;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
:where(.chladni-row){display:flex;gap:8px;flex-wrap:wrap;justify-content:center;pointer-events:none}
:where(.chladni-tone,.chladni-mute,.chladni-math){pointer-events:auto;font:600 13px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111;background:rgba(255,255,255,0.72);border:1px solid #111;border-radius:999px;padding:8px 14px;cursor:pointer;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
:where(.chladni-tone[aria-pressed="true"],.chladni-mute[aria-pressed="true"],.chladni-math[aria-pressed="true"]){color:#fff;background:#111}
:where(.chladni-tone:disabled,.chladni-mute:disabled,.chladni-math:disabled){color:#aaa;border-color:#ccc;cursor:not-allowed;opacity:0.6}
`
