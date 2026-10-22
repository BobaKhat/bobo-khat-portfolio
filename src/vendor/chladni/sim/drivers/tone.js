// GENERATED from chladni@edc09cf (v5-portfolio). Do not edit here. Edit in ~/Desktop/chladni and re-sync.
// —— TONE DRIVER (extracted verbatim from the tone branch of ChladniVisualizer's frame loop). When a
// tone button is active (black-and-white mode only), each mode is weighted by the steady-state forced
// response of a damped oscillator at its eigenfrequency (TONE_Q), normalised to sum 1, and fed straight
// in — no FFT/TILT/SHARPEN/TOP_K/baseline. Writes st.targetAmp, pins st.audio, zeroes st.rawSum, and
// returns the constant drive level (TONE_DRIVE). The DRIVE_TAU level smoothing happens downstream.
import { MODES, MODE_COUNT, TONE_Q, TONE_DRIVE } from '../plate.js'

// —— TONE-MODE RING-DOWN. In tone mode the per-mode amplitude transition is the plate's PHYSICAL
// relaxation, not the flat cosmetic SMOOTH_TAU used for music. A driven resonator at frequency f_n with
// quality Q rings up and down with time constant tau_n = Q / (π·f_n): low modes are slow (244 Hz ≈ 0.65 s),
// high modes fast (1527 Hz ≈ 0.10 s). The step loop uses these (instead of SMOOTH_TAU) to relax st.dist[i]
// toward its new target while a tone drives the plate, so switching tones follows real physics — the new
// figure's high modes snap in while the old low modes linger, exactly as a struck plate behaves.
export const TONE_TAU = new Float64Array(MODE_COUNT)
for (let i = 0; i < MODE_COUNT; i++) TONE_TAU[i] = TONE_Q / (Math.PI * MODES[i].freq)

export function toneDriver(st, tone) {
  let sum = 0
  for (let i = 0; i < MODE_COUNT; i++) {
    const fn = MODES[i].freq
    const df = fn * fn - tone * tone
    const denom = Math.sqrt(df * df + (tone * fn / TONE_Q) ** 2)
    const w = denom > 1e-9 ? 1 / denom : 0
    st.targetAmp[i] = w
    sum += w
  }
  const inv = sum > 1e-12 ? 1 / sum : 0
  for (let i = 0; i < MODE_COUNT; i++) st.targetAmp[i] *= inv
  st.rawSum = 0
  st.audio = 1
  return TONE_DRIVE
}
