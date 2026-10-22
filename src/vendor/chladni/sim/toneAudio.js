// GENERATED from chladni@edc09cf (v5-portfolio). Do not edit here. Edit in ~/Desktop/chladni and re-sync.
// —— Tone-button sine audio, standalone (owns its own AudioContext). This mirrors the behaviour of the
// tone oscillator in App.jsx — a quiet sine (gain TONE_VOL) through a gain node the mute toggle controls,
// with the AudioContext created/resumed only from a user gesture — extracted so ChladniTones can ring the
// same tones without a music graph. It is NOT wired into App.jsx: there the oscillator shares the music
// AudioContext (analyser + mediaElementSource), which must not be closed when a tone stops, so App keeps
// its own copy. Here dispose() stops the oscillator AND closes the context, since this module owns it.
const TONE_VOL = 0.04   // oscillator gain — deliberately quiet (matches App.jsx)

export function createToneAudio() {
  let ctx = null
  let osc = null
  let gain = null
  let muted = false
  // Every oscillator that has started and not yet been fully torn down — including ones mid fade-out. A plain
  // stop()/start() only tracks the CURRENT voice; this set is what lets dispose() also stop a still-fading one.
  const live = new Set()

  const killNode = (o, g) => {
    try { o.stop() } catch { /* already stopped */ }
    o.disconnect(); if (g) g.disconnect()
    live.delete(o)
  }

  // Must be called from a user gesture (click): the AudioContext is created lazily and resumed here,
  // never on load.
  const ensure = async () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') await ctx.resume()
    return ctx
  }

  // Stop and tear down the CURRENT oscillator immediately (audio only). Leaves the context open.
  const stop = () => {
    if (osc) killNode(osc, gain)
    osc = null; gain = null
  }

  // —— Fade the current tone out over ~tau seconds, then tear it down — the gentle counterpart to stop().
  // Used when a tone is deselected: ramping the gain to zero (exponential approach, time constant tau = the
  // tone's own physical ring-down) avoids the click a hard stop() makes. The voice is detached from osc/gain
  // right away so a fresh start() builds a new node and never disturbs this one, which its timer stops once
  // it is inaudible (~5·tau). No-op (plain stop) if nothing is playing.
  const fadeOut = (tau) => {
    if (!ctx || !osc || !gain) { stop(); return }
    const o = osc, g = gain
    const t = Math.max(tau, 0.01)
    try {
      const now = ctx.currentTime
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(Math.max(g.gain.value, 1e-4), now)
      g.gain.setTargetAtTime(0, now, t)   // exponential decay toward 0 with time constant t
    } catch { /* context closing */ }
    osc = null; gain = null               // release the current slot; this voice now lives only in `live`
    setTimeout(() => killNode(o, g), Math.min(t, 2) * 5 * 1000)
  }

  // Suspend / resume the owned context — used to silence the tone while the visual is offscreen or the tab
  // is hidden, WITHOUT tearing down the oscillator (so it comes back at the same frequency). Both are no-ops
  // until a tone has actually started (ctx null), so neither can create an AudioContext before a user gesture.
  const suspend = async () => { if (ctx && ctx.state === 'running') { try { await ctx.suspend() } catch { /* closing */ } } }
  const resume = async () => { if (ctx && ctx.state === 'suspended') { try { await ctx.resume() } catch { /* closing */ } } }

  // Start (or restart) the oscillator at freq. Quiet sine through a gain node the mute toggle controls.
  const start = (freq) => {
    if (!ctx) return
    stop()
    osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain = ctx.createGain()
    gain.gain.value = muted ? 0 : TONE_VOL
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start()
    live.add(osc)
  }

  const setMuted = (m) => {
    muted = m
    if (gain) gain.gain.value = m ? 0 : TONE_VOL
  }

  // Stop every oscillator (current AND any still fading out) and close the owned context.
  const dispose = () => {
    for (const o of [...live]) killNode(o, null)
    osc = null; gain = null
    if (ctx) { try { ctx.close() } catch { /* already closed */ } ctx = null }
  }

  return {
    ensure,
    start,
    stop,
    fadeOut,
    suspend,
    resume,
    setMuted,
    dispose,
    get muted() { return muted },
  }
}
