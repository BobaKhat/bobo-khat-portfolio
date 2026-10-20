// GENERATED from chladni@8a67cc5 (v5-portfolio). Do not edit here. Edit in ~/Desktop/chladni and re-sync.
// —— GPU shaders + render/look constants (extracted from ChladniVisualizer.jsx, verbatim). All the
// GLSL for the GPGPU simulation (field, velocity, position, density), the lit-grain render, the ink
// composite and the wisp passes, plus the constants those shaders bake in or use as uniform defaults.

import * as THREE from 'three'
import { MODE_COUNT, FIELD_R, EDGE_R, PLATE_R } from './plate.js'

const FALLBACK_RGB = [0.5, 0.53, 0.62] // neutral slate when no album colour is available
const BG = 0x0a0a0a                    // matches the panel; there is no plate, so this IS the backdrop

// GLOW — flat across the catalogue. It used to scale with the track's cached energy, and that is
// deliberately gone: the sand should read as luminous on every record, not just the loud ones. The
// song is still legible in the FIGURE (mode selection is energy- and hash-driven and untouched) and
// in how hard the plate is being shaken; it is no longer legible in how brightly the grains burn.
//
// This drives the grains' own emission — the emissive term and the edge softness. It does NOT set the
// bloom any more; see below.
const GLOW = 0.7

// BLOOM — hand-tuned, and deliberately NOT derived from GLOW. Emission and bloom pull in opposite
// directions here and the single knob was hiding that. Emission is what makes a GRAIN look hot; bloom
// is what smears that heat into the black between the nodal lines, and past a certain strength it
// fills the cells and the figure stops being readable at all. The pattern is the subject, so the
// bloom is set to whatever still leaves the gaps empty, and the grains are made hot by the emissive
// instead — where the light stays ON the sand rather than spilling off it.
//
// Threshold stays low (only the brightest cores bloom at all); strength and radius are what got pulled
// back. Strength gets a small live-audio term on top of this each frame.
const BLOOM_STRENGTH = 0.15   // pulled back from 0.228: dense regions were overrunning the knee to white
const BLOOM_RADIUS = 0.04375
const BLOOM_THRESHOLD = 0.3   // set against the grain luminance (TARGET_LUMA 0.55) so the grains still bloom

// —— THE BASS PULSE. Two terms, fired off the same decaying transient that already drives the hop, so a
// kick lands as ONE event: the sand jumps, the grains warm, and the glow breathes out around them.
//
// These are deliberately set for a LONG SIT. The brief is a breath of light on the kick, not a camera
// flash — this thing is on screen for the length of a record, and a hard strobe at 120bpm is 2Hz of
// full-frame luminance swing straight into the viewer's eyes for half an hour. Anything that reads as
// impressive in a five-second demo is the wrong answer here.
//
// BLOOM_PULSE lifts the strength 0.228 → 0.288 at the peak of a kick (+26%), decaying out over ~0.37s. It
// stays close to the baseline on purpose: 0.228 is not an arbitrary number but the level tuned to leave
// the gaps between the nodal lines EMPTY (see BLOOM_STRENGTH), and a bloom that closes those gaps does
// not merely look bright, it erases the figure. This brushes past that line for a moment rather than
// vaulting over it.
//
// BASS_FLASH is the same event on the grains themselves. It emits the ALBUM'S colour, not white — see
// the note where it is applied. It compounds with the bloom by design, and where it actually lands is
// not where you would expect.
const BLOOM_PULSE = 0.06
const BASS_FLASH = 0.08

// —— INK MODE. Formerly a CSS `invert(1) grayscale(1)` on the canvas; now a fullscreen shader composite
// placed LAST in the pass chain, after OutputPass (tone mapping + sRGB encode), so it reads the exact
// sRGB-encoded values the CSS filter saw. It is ALWAYS ON — the whole look is black-on-white now. The pass
// computes a luma of the scene and composites it over a fog colour:
//     ink = clamp(luma(scene) * INK_GAIN, 0, 1)   // Rec. 709 luma: 0.2126, 0.7152, 0.0722
//     out = mix(fogColor, INK, ink)
// L switches between two settings. PLAIN (default): FOG_CENTER = FOG_EDGE = white, INK = black, γ = 1,
// HAZE_AMP = 0, ATMOS = 0, no wisps/veil — the original flat CSS-invert look (black sand on white, grey
// bloom aura). ARRIVAL: the tuned fog — fogColor lit by an off-centre soft light (FOG_CENTER at LIGHT_POS →
// FOG_EDGE at the corners, bottom a little darker), carrying large slow fog masses caught by that light
// (ATMOS) and the small slow-drifting 2-octave haze (HAZE_AMP·n), plus the ink wisps and the front veil.
//
// These colours live in the SAME sRGB-encoded domain the compositing happens in (not linear-light) — the
// mix matches what CSS did pixel-for-pixel — so they are fed to the shader as raw sRGB components, NOT run
// through three's colour management. At the identity values below the output is `1 - luma` in every
// channel, bit-for-bit the old invert+grayscale (both luma weight sets sum to 1, so invert-then-grayscale
// and this formula coincide).
const FOG_CENTER = 0xdfe5e6
const FOG_EDGE   = 0xa9b5b9
const INK        = 0x0d1215
const INK_GAIN   = 1.0
const INK_GAMMA  = 1.0   // contrast curve on the ink coverage (ink = coverage^INK_GAMMA); [ and ] step it 0.3–1.0
const HAZE_AMP   = 0.06
// —— ATMOSPHERE (background fog only). The fog is lit by an off-centre soft source at LIGHT_POS (uv, with
// y=0 at the bottom — so [0.5, 0.7] is horizontally centred, ~30% down from the top) and carries slow, large
// fog masses caught by that light (strongest near it, fading at the corners). LIGHT_POS is fixed; ATMOS is
// the mass strength, stepped by ; and ' (0.0–0.4). See the InkShader background block.
const LIGHT_POS  = [0.5, 0.7]
const ATMOS      = 0.33
const ATMOS_MIN  = 0.0
const ATMOS_MAX  = 0.4
// —— FOG VEIL (V key, ink mode only). A render-only layer laid OVER the combined sand+wisp ink: thin,
// drifting patches of the SAME fog colour, so the fog reads as being both behind and in front of the ink.
// The front layer drifts ~2× faster than the background haze, in a different direction — the parallax is
// what sells the depth. VEIL_AMT is the max coverage; , and . step it 0.0–0.6. See the InkShader veil block.
const VEIL_AMT   = 0.6
const VEIL_MIN   = 0.0
const VEIL_MAX   = 0.6

// —— INK WISPS (W key, ink mode only). A render-only layer: each frame the moving grains are splatted,
// weighted by speed, into a full-res buffer that then advects along a curl-noise flow and decays, leaving
// smoky threads trailing the sand a kick throws off the plate. It reads grain positions/speeds but never
// writes back to the simulation — the physics, audio, bloom and colour ramp are untouched.
//
// SPEED_LO/HI gate the source weight = smoothstep(SPEED_LO, SPEED_HI, grainSpeed), in the world-units/frame
// units of length(velocity). Measured ranges (see the probe used to pick these): settled/idle sand sits at
// ~0.001–0.0015; under heavy drive the moving bulk is ~0.015, the kick-thrown fast tail ~0.03–0.04, peaks
// ~0.046. LO = 0.012 sits in the gap above settled sand, so resting grains weight ~0 and general agitation
// only a light base; HI = 0.040 is the thrown-grain peak, so only kick-thrown/airborne grains weight ~1.
const SPEED_LO = 0.012
const SPEED_HI = 0.040
const WISP_TAU = 1.0       // seconds — wisp decay time constant (buffer *= exp(-dt/WISP_TAU) each frame)
const WISP_EMIT = 5.24     // per-SECOND source gain (STARTING value): wisp += source·WISP_EMIT·dt, so emission
                           // is rate-based and fps-independent (a fixed amount of ink per second, not per frame).
                           // Live-tunable with - / = (step ×1.25, clamped WISP_EMIT_MIN..MAX); fed to the sim
                           // shader via the uWispEmit uniform. At the old per-frame `+ source` the buffer saturated.
const WISP_EMIT_MIN = 0.5  // - / = clamp range for the live WISP_EMIT tuning
const WISP_EMIT_MAX = 20.0
const WISP_FLOW = 0.15     // curl-noise advection speed, in UV/second
const WISP_OUTWARD = 0.03  // outward radial drift from the plate centre, in UV/second
const WISP_OPACITY = 0.5   // opacity of the wisp ink layer when composited under the sand ink
const WISP_DT_CLAMP = 0.1  // s — cap on dt for wisp advect/decay, so a backgrounded tab can't wipe/blow up the buffer

// hex → raw sRGB components (0..1). Deliberately bypasses THREE.Color, which would linearise under colour
// management: the ink composite happens in the sRGB-encoded domain, so its colours must stay encoded.
const srgbVec = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255)

// Ink-mode composite (see INK MODE, above). Fed the OutputPass result — already tone-mapped and sRGB-
// encoded — so luma and the mix run in the same gamut the old CSS filter operated on.
const InkShader = {
  name: 'InkComposite',
  uniforms: {
    tDiffuse:   { value: null },
    uAspect:    { value: 1 },        // width/height, so the gradient/noise stay round on a wide canvas
    uTime:      { value: 0 },        // elapsed SECONDS, for the drift (not a frame counter)
    uFogCenter: { value: srgbVec(FOG_CENTER) },
    uFogEdge:   { value: srgbVec(FOG_EDGE) },
    uLightPos:  { value: new THREE.Vector2(LIGHT_POS[0], LIGHT_POS[1]) },  // off-centre soft light (see ATMOSPHERE)
    uAtmos:     { value: ATMOS },            // strength of the large, slow fog masses; ; and ' step it
    uInk:       { value: srgbVec(INK) },
    uInkGain:   { value: INK_GAIN },
    uInkGamma:  { value: INK_GAMMA },
    uHazeAmp:   { value: HAZE_AMP },
    uWisp:      { value: null },             // the wisp buffer (render-only; see INK WISPS)
    uWispOpacity: { value: WISP_OPACITY },
    uWispOn:    { value: 0 },                // 0/1 — W toggle; 0 makes the wisp term vanish exactly
    uVeilAmt:   { value: VEIL_AMT },         // max coverage of the front fog veil (see FOG VEIL); , and . step it
    uVeilOn:    { value: 0 },                // 0/1 — V toggle; 0 makes the veil term vanish exactly
    uAtmosOn:   { value: 0 },                // 0/1 — Arrival (L) gate for the bottom-darken; 0 keeps plain fog flat
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uAspect, uTime, uInkGain, uInkGamma, uHazeAmp, uWispOpacity, uWispOn, uVeilAmt, uVeilOn, uAtmos, uAtmosOn;
    uniform vec3 uFogCenter, uFogEdge, uInk;
    uniform vec2 uLightPos;
    uniform sampler2D uWisp;

    // Ashima simplex noise (2D), returns ~[-1, 1].
    vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // 3-octave fbm, normalised to ~[0,1] — the coverage field for the front fog veil (see FOG VEIL).
    float fbm(vec2 p){
      float s = 0.0, a = 0.5, norm = 0.0;
      for (int o = 0; o < 3; o++) { s += a * snoise(p); norm += a; p *= 2.0; a *= 0.5; }
      return 0.5 + 0.5 * (s / norm);
    }

    void main() {
      vec3 scene = texture2D(tDiffuse, vUv).rgb;
      float luma = dot(scene, vec3(0.2126, 0.7152, 0.0722));
      float sandInk = pow(clamp(luma * uInkGain, 0.0, 1.0), uInkGamma);

      // Wisp layer composited UNDER the sand as a second translucent ink (screen/over union), so the sand
      // stays crisp on top. uWispOn (W key) gates it to exactly zero when off.
      float wisp = clamp(texture2D(uWisp, vUv).r, 0.0, 1.0) * uWispOpacity * uWispOn;
      float ink = 1.0 - (1.0 - sandInk) * (1.0 - wisp);

      // Off-centre key light: fog is brightest at uLightPos (a soft source ~30% down from the top), falling
      // off toward FOG_EDGE at the corners. Aspect-correct so the falloff is circular; normalise by the
      // farthest corner so the corners read as edge. t = 0 at the light, ~1 at the far corners.
      vec2 d = (vUv - uLightPos) * vec2(uAspect, 1.0);
      float maxd = length(vec2(0.5 * uAspect, max(uLightPos.y, 1.0 - uLightPos.y)));
      float t = smoothstep(0.0, 1.0, length(d) / maxd);
      vec3 fog = mix(uFogCenter, uFogEdge, t);
      // Bottom of the screen a little darker than the top (vUv.y = 0 is the bottom). Arrival-only (uAtmosOn),
      // so the plain mode's flat white fog stays flat. The off-centre light itself self-neutralises in plain
      // because uFogCenter == uFogEdge == white there; masses and haze are already gated by uAtmos/uHazeAmp.
      fog *= mix(1.0, mix(0.92, 1.0, vUv.y), uAtmosOn);

      // Large fog masses: one much bigger, very-slow noise layer (~1 patch across), a different seed from the
      // haze/veil so they don't line up. Lightens/darkens by up to uAtmos, but CAUGHT BY THE LIGHT — scaled by
      // (1.0 - t) so the big soft regions of light and shadow are strongest near uLightPos and fade to nothing
      // at the corners, reading as fog lit from behind. Drifts slower than the small haze below.
      vec2 pm = vUv * vec2(uAspect, 1.0) * 0.8 + vec2(-19.3, 51.7);
      float masses = snoise(pm + vec2(0.008, 0.005) * uTime);
      fog *= 1.0 + uAtmos * masses * (1.0 - t);

      // Existing small 2-octave simplex haze, -1..1, low frequency (~2-3 blobs across) and slow drift. UNCHANGED.
      vec2 p = vUv * vec2(uAspect, 1.0) * 2.5;
      vec2 drift = vec2(0.02, 0.015) * uTime;
      float n = (2.0 * snoise(p + drift) + snoise(p * 2.0 + drift * 1.7)) / 3.0;
      fog *= 1.0 + uHazeAmp * n;

      vec3 inkResult = mix(fog, uInk, ink);

      // FOG VEIL: a thin layer of the SAME fog laid in FRONT of the combined ink. Low-frequency 3-octave
      // fbm (~1–2 patches across) with a different seed from the haze above, drifting ~2× faster and in a
      // different direction — the front layer outrunning the back is what reads as depth. smoothstep keeps
      // most of the screen clear, so only drifting patches partly cover the ink and the sand never vanishes.
      // uVeilOn (V key) gates it to exactly zero; uVeilAmt (, and .) is the max coverage.
      vec2 vp = vUv * vec2(uAspect, 1.0) * 1.2 + vec2(37.2, 11.5);   // seed offset ≠ haze
      vec2 veilDrift = vec2(-0.03, 0.04) * uTime;                    // ~2× the haze speed, different direction
      float veil = uVeilAmt * uVeilOn * smoothstep(0.35, 0.85, fbm(vp + veilDrift));
      vec3 outColor = mix(inkResult, fog, veil);

      gl_FragColor = vec4(outColor, 1.0);
    }
  `,
}

// —— WISP SOURCE. The moving grains, splatted into a full-res buffer through the SAME display camera as the
// sand, each weighted by smoothstep(SPEED_LO, SPEED_HI, speed). Additive, soft radial footprint, no depth —
// the thrown grains sum into bright threads; settled grains contribute ~0. Reads pos/vel; writes nothing back.
const WISP_SOURCE_VERT = /* glsl */ `
precision highp float;
uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform float uSizeScale;   // viewportHeightPx / (2 tan(fov/2)), as for the grains
uniform float uSize;        // grain diameter in world units
attribute vec2 aRef;
varying float vW;
void main() {
  vec4 posData = texture2D(uPositionTexture, aRef);
  vec4 velData = texture2D(uVelocityTexture, aRef);
  float speed = length(velData.xyz);
  vW = smoothstep(${SPEED_LO.toFixed(4)}, ${SPEED_HI.toFixed(4)}, speed);

  vec4 mv = modelViewMatrix * vec4(posData.xyz, 1.0);
  float depth = -mv.z;
  // A touch larger than a grain, and swelling with speed, so a thrown grain lays down a wisp, not a dot.
  float world = uSize * (2.0 + speed * 6.0);
  gl_PointSize = clamp(world * uSizeScale / max(depth, 0.001), 2.0, 28.0);
  gl_Position = projectionMatrix * mv;
}
`

const WISP_SOURCE_FRAG = /* glsl */ `
precision highp float;
varying float vW;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(vW * smoothstep(0.5, 0.0, d)), 1.0);
}
`

// —— WISP ADVECT + DECAY + SOURCE. wisp = advect(prev, flow)·exp(-dt/TAU) + source·WISP_EMIT·dt. flow =
// 3-octave curl noise (slowly evolving) + a small outward radial drift. Emission is per-SECOND (scaled by
// dt), so a fixed amount of ink lands per second regardless of frame rate — at high fps the old per-frame
// `+ source` summed hundreds of splats a second and the buffer saturated. All motion/decay in real seconds.
const WISP_SIM_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;     // last frame's (blurred) wisp buffer
uniform sampler2D uSource;   // this frame's grain splat
uniform float uDt, uAspect, uTime, uWispEmit;

vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
// 3-octave fbm used as a scalar flow potential; curl of it gives a divergence-free (swirling) flow.
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int o = 0; o < 3; o++) { s += a * snoise(p); p *= 2.0; a *= 0.5; }
  return s;
}
vec2 curl(vec2 p){
  float e = 0.012;
  float dx = fbm(p + vec2(e, 0.0)) - fbm(p - vec2(e, 0.0));
  float dy = fbm(p + vec2(0.0, e)) - fbm(p - vec2(0.0, e));
  return vec2(dy, -dx) / (2.0 * e);
}

void main() {
  // Aspect-corrected coords so the flow is isotropic on a wide canvas.
  vec2 ac = (vUv - 0.5) * vec2(uAspect, 1.0);
  // ~3 swirls across the plate; the whole field drifts slowly so it reads as evolving, not static.
  vec2 cn = curl(ac * 3.0 + vec2(0.03, 0.021) * uTime);
  vec2 radial = ac / (length(ac) + 1e-4);
  vec2 flow = ${WISP_FLOW.toFixed(3)} * cn + ${WISP_OUTWARD.toFixed(3)} * radial;
  // flow is in aspect-corrected UV/second; undo the x stretch to get back to raw UV before advecting.
  vec2 flowUv = flow * vec2(1.0 / uAspect, 1.0);

  float prev = texture2D(uPrev, vUv - flowUv * uDt).r;
  float decay = exp(-uDt / ${WISP_TAU.toFixed(3)});
  float src = texture2D(uSource, vUv).r;
  gl_FragColor = vec4(vec3(prev * decay + src * uWispEmit * uDt), 1.0);
}
`

// —— WISP BLUR. A very light 1-pixel tent (centre 4, 4-neighbours 1), so the field diffuses slightly each
// frame without losing the fine threads.
const WISP_BLUR_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
void main() {
  float c = texture2D(uTex, vUv).r * 4.0;
  c += texture2D(uTex, vUv + vec2(uTexel.x, 0.0)).r;
  c += texture2D(uTex, vUv - vec2(uTexel.x, 0.0)).r;
  c += texture2D(uTex, vUv + vec2(0.0, uTexel.y)).r;
  c += texture2D(uTex, vUv - vec2(0.0, uTexel.y)).r;
  gl_FragColor = vec4(vec3(c / 8.0), 1.0);
}
`

// —— GRAIN TONE. The grains render as a flat neutral grey at a fixed luminance (TARGET_LUMA). The colour
// system is gone — the per-grain hue ramp, its spatial modes (radius/speed/density, the G key), the hue
// drift and the bass-pulse offset, and the toTargetLuma per-hue luminance normalisation. A grey is used
// (rather than dropping the colour term) so the lit grain, its emissive, and therefore the bloom and the
// ink composite's luma input are UNCHANGED from the hue version: every ramp stop was already luminance-
// equalised to TARGET_LUMA, so a grey at the same luminance renders identically through bloom and ink.
const TARGET_LUMA = 0.55   // Rec. 601 luminance of the grey grains; the single point of grain-luminance control

const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

// Seeds a target from a CPU-built DataTexture (used once, to prime pos/vel A and B).
const COPY_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uSource;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(uSource, vUv); }
`

// —— THE RE-SPRINKLE (tone mode only; see ChladniSim.resprinkle). A ONE-SHOT event fired when the active
// tone changes. Switching tones can strand sand in the new figure's quiet zones — the central blob of a
// (5,1) star, say — where grad(W²) ≈ 0 and |W| sits under HOP_THRESHOLD, so neither the drift nor the
// amplitude hop can move it; a fresh page load never shows this because the grains start scattered and
// settle in. The re-sprinkle reproduces a fresh load directly: a random RESPRINKLE_MIX fraction of grains
// are RE-SPAWNED through the exact fresh-load spawn (new scattered position + phase, velocity zeroed, new
// mass), the rest are left untouched. MIX = 1.0 → the whole plate becomes a fresh load. The CPU builds a
// full fresh-spawn texture (reusing the spawn code path); this shader is the per-grain selector that, for
// each texel, either keeps the current value or takes the fresh one — used once for positions and once for
// velocities with the SAME mix and seed, so a chosen grain is re-spawned in BOTH.
const RESPRINKLE_MIX = 1.0   // default fraction re-spawned; live-tunable with 9 / 0 (±0.1, clamped 0–1).

const RESPRINKLE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uCurrent;   // the grain's current pos (or vel) texture
uniform sampler2D uFresh;     // a full fresh-load spawn pos (or vel) texture
uniform float uMix;           // fraction of grains to re-spawn, 0..1
uniform float uSeed;          // per-event random seed, so successive re-sprinkles pick different grains
varying vec2 vUv;

// Single hash in [0, 1), decorrelated per texel.
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float r = hash21(vUv + uSeed);
  float keep = step(uMix, r);   // r >= uMix → 1 (keep current); r < uMix → 0 (take fresh)
  gl_FragColor = mix(texture2D(uFresh, vUv), texture2D(uCurrent, vUv), keep);
}
`

// The mode field, shared by BOTH simulation passes.
//
// The figure is a SUPERPOSITION of the solved free-edge mode table. Each mode's SHAPE is constant and
// packed into a vec4 as (n, λ, φ, c); its live amplitude rides a parallel float array:
//   n  angular mode number — the spoke count. Integer, 0..6.
//   λ  the plate eigenvalue — the radial argument is λ·r, so r = 1 is the physical rim.
//   φ  phase — rotates the term around the disc; a fixed per-mode orientation set on the CPU.
//   c  the J:I mix of the free-edge shape W(r) = J_n(λr) + c·I_n(λr); solved on the CPU.
//   uAmp[i]  LIVE amplitude — how hard mode i is being driven RIGHT NOW, written every frame from the
//      FFT, already normalised across the table and divided by each mode's own peak, so the summed
//      field comes back in -1..1 with no amplitude uniform for the shader to divide out.
//
// A real forced plate rings in whatever modes the driving frequencies excite; summing the table with
// audio-driven amplitudes is exactly that. Most amplitudes are ~0 at any instant — fieldAt skips them.
const FIELD = /* glsl */ `
#define MODE_COUNT ${MODE_COUNT}
uniform vec4 uModes[MODE_COUNT];    // (n, λ, φ, c) per mode — constant mode shape
uniform float uAmp[MODE_COUNT];     // per-mode live amplitude — rewritten every frame

// —— BESSEL J_n, and it is the entire reason this file exists in its current form. A circular plate's
// eigenmodes are Bessel functions of the radius, not sines of x and y, and no amount of tuning a sin·sin
// field will bend its nodal set into rings — that field is separable in x and y, so its nodal lines are
// stuck on a rectangular lattice however the mode numbers are moved.
//
// J0 and J1 are the standard Abramowitz & Stegun rational approximations: a polynomial in x² below
// x = 8, an asymptotic amplitude/phase form above it. Everything up to J12 is built off them.
float besselJ0(float x) {
  float ax = abs(x);
  if (ax < 8.0) {
    float y = x * x;
    float ans1 = 57568490574.0 + y * (-13362590354.0 + y * (651619640.7
              + y * (-11214424.18 + y * (77392.33017 + y * (-184.9052456)))));
    float ans2 = 57568490411.0 + y * (1029532985.0 + y * (9494680.718
              + y * (59272.64853 + y * (267.8532712 + y * 1.0))));
    return ans1 / ans2;
  }
  float z = 8.0 / ax;
  float y = z * z;
  float xx = ax - 0.785398164;
  float p0 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4
           + y * (-0.2073370639e-5 + y * 0.2093887211e-6)));
  float q0 = -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5
           + y * (0.7621095161e-6 - y * 0.934935152e-7)));
  return sqrt(0.636619772 / ax) * (p0 * cos(xx) - z * q0 * sin(xx));
}

float besselJ1(float x) {
  float ax = abs(x);
  if (ax < 8.0) {
    float y = x * x;
    float ans1 = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1
              + y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))));
    float ans2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74
              + y * (99447.43394 + y * (376.9991397 + y * 1.0))));
    return ans1 / ans2;
  }
  float z = 8.0 / ax;
  float y = z * z;
  float xx = ax - 2.356194491;
  float p1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4
           + y * (0.2457520174e-5 + y * (-0.240337019e-6))));
  float q1 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5
           + y * (-0.88228987e-6 + y * 0.105787412e-6)));
  float ans = sqrt(0.636619772 / ax) * (p1 * cos(xx) - z * q1 * sin(xx));
  return x < 0.0 ? -ans : ans;
}

// The ascending series. This is NOT a fast path — it is the only thing that makes the recurrence below
// usable at all, and leaving it out is the single easiest way to wreck this shader.
//
// The recurrence J_{n+1} = (2n/x)·J_n - J_{n-1} multiplies its input error by 2n/x at every step. For
// x >= n that factor is ≤ 2 and it is harmless. For x << n — which is the whole MIDDLE OF THE PLATE,
// where the argument k·r goes to zero — it is a catastrophic-cancellation machine: at x = 0.1 it turns
// the ~1e-7 error in a float32 J0 into an O(0.1) answer for J6, whose true value is 1e-11. That is not a
// rounding artefact you can squint past. It is a large false displacement painted over the centre of
// every high-order figure, and the sand would dutifully organise around it.
//
// So: recurrence only where it is stable, and the series everywhere else. The series converges fast and
// without cancellation exactly where the recurrence does not (18 terms hold float precision out to the
// worst case x = n = 12), and the two agree across the x = n handover, so the field is continuous there.
float besselSeries(float n, float x) {
  float h = x * 0.5;
  float term = 1.0;
  for (int i = 1; i <= 12; i++) {         // term = h^n / n! (n now runs 0..12, was 0..6)
    if (float(i) > n) break;
    term *= h / float(i);
  }
  float sum = term;
  float h2 = h * h;
  for (int m = 1; m <= 18; m++) {         // T_m = T_{m-1} · -h² / (m(m+n)); 18 terms converge to float
    term *= -h2 / (float(m) * (n + float(m)));
    sum += term;
  }
  return sum;
}

// n is an integer 0..12 and x = k·r is never negative, so there is no sign or high-order handling here
// beyond the stability split. The upward recurrence is used only where it is stable (x ≥ n), so its
// 2n/x growth factor is ≤ 2 even at n = 12; below that the series branch takes over (see besselSeries).
float besselJ(float n, float x) {
  if (n < 0.5) return besselJ0(x);
  if (n < 1.5) return besselJ1(x);
  if (x < n) return besselSeries(n, x);

  float jPrev = besselJ0(x);
  float jCurr = besselJ1(x);
  for (int i = 1; i < 12; i++) {
    if (float(i) >= n) break;
    float jNext = (2.0 * float(i) / x) * jCurr - jPrev;
    jPrev = jCurr;
    jCurr = jNext;
  }
  return jCurr;
}

// MODIFIED BESSEL I_n — the second half of the free-edge mode shape. Unlike J, there is no recurrence
// games to play here: I_n's ascending series is ALL-POSITIVE, so it never cancels and is stable at
// every argument, and a fixed 64-term sum is accurate to float precision across the whole λ range in
// this table (verified against a reference up to λ ≈ 18.7 at n up to 12). It grows like e^x, which is
// exactly why the field clamps the radius to the plate before calling this — see fieldAt.
float besselI(float n, float x) {
  float h = x * 0.5;
  float term = 1.0;
  for (int i = 1; i <= 12; i++) {         // term = h^n / n! (n now runs 0..12, was 0..6)
    if (float(i) > n) break;
    term *= h / float(i);
  }
  float sum = term;
  float h2 = h * h;
  for (int m = 1; m <= 64; m++) {          // T_m = T_{m-1} · h² / (m(m+n))  — all positive; 64 for x≤18.7
    term *= h2 / (float(m) * (n + float(m)));
    sum += term;
  }
  return sum;
}

// Plate displacement at a point: the whole mode table summed. Each mode is a free-edge radial shape
// W(r) = J_n(λr) + c·I_n(λr) times an angular cosine, weighted by its live amplitude. Interference
// between the modes ringing at once gives the curved, interlocking figures. A linear combination of
// eigenmodes is itself a valid displacement field, so every frame is a shape a real plate could hold;
// the field moves continuously as the audio moves the amplitudes.
//
// The radius is CLAMPED to the rim (r ≤ 1) before the radial evaluation: I_n grows exponentially, and
// beyond the physical plate the mode shape is undefined anyway, so the field just holds its rim value
// out across the containment margin rather than blowing up. The angle still comes from the true p.
//
// The amplitude < epsilon skip is what keeps this affordable: at any instant only a handful of modes
// are being driven hard, and the rest cost a single compare instead of a full Bessel evaluation. The
// atan guard is kept exactly as before — atan(0,0) is a NaN that would poison a grain's velocity for
// good, and at the centre an n >= 1 term is ~0 and n = 0 has no angle anyway.
float fieldAt(vec2 p) {
  float rr = length(p);
  float th = rr > 1e-4 ? atan(p.y, p.x) : 0.0;
  float r = min(rr, 1.0);

  float sum = 0.0;
  for (int i = 0; i < MODE_COUNT; i++) {
    float amp = uAmp[i];
    if (amp < 1e-4) continue;
    float n = uModes[i].x, lam = uModes[i].y, phi = uModes[i].z, c = uModes[i].w;
    float radial = besselJ(n, lam * r) + c * besselI(n, lam * r);
    sum += radial * cos(n * th + phi) * amp;
  }
  return sum;
}

// Height of the sand pile at a point. Grains that reach a nodal line don't all lie flat at y=0 —
// they stack, and the stack is what turns a line into a RIDGE you can read from a raked camera.
// Per-grain phase scatters the rest height so the ridge has a rough, granular top instead of a
// moulded plastic one.
float pileHeight(float disp, float phase) {
  float nearNode = 1.0 - smoothstep(0.0, 0.12, abs(disp));
  return nearNode * 0.05 * (0.35 + phase * 1.3);
}
`

// VELOCITY PASS — every force lives here. Reads pos/vel, writes the new velocity.
const VELOCITY_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform sampler2D uDensityTexture;  // 64×64 splat of where the grains currently are
uniform float uTime;
uniform float uDeltaTime;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uAmplitude;     // overall audio energy 0..1 — how hard the plate is being driven
uniform float uBassImpulse;   // decaying bass-transient burst 0..1
uniform float uAmbient;       // cached-energy tremble for when nothing is playing
uniform float uIdle;          // 1 = silent, 0 = playing
uniform float uFieldChange;   // 0..1 — how fast the mode amplitudes are moving right now (the figure reorganising)
uniform float uToneActive;    // 1 only when a tone button drives the plate (black-and-white mode); gates the amplitude hop
uniform float uStill;         // 1 only on the undriven idle plate (tone mode, no tone selected) — see the early-out in main()
uniform float uSpreadGain;    // multiplies the density-spreading force (1 normally; boosted during a tone-off SPREAD)
uniform float uVelScale;      // final velocity scale (1 normally; ramps 1→0 to ease the SPREAD into stillness)

${FIELD}

#define FIELD_R ${FIELD_R.toFixed(2)}
#define EDGE_R ${EDGE_R.toFixed(2)}
#define PLATE_SPAN ${(PLATE_R * 2).toFixed(2)}

// Migration: acceleration toward the nodal lines, per frame at 60fps. Budget from the TARGET SPEED,
// not from the force: xz damping keeps 97% per frame, so a constant force compounds to F/(1-0.97) =
// 33F. A grain crossing a cell in a couple of seconds wants ~0.012 units/frame, which is F ≈ 0.0004.
//
// This runs at 1.5× that. The extra is bought to CLEAR THE CELLS: migration and AGITATION are in
// equilibrium, and the balance point sets both how wide a nodal line is and how much loose sand hangs
// between the lines. At the budgeted force the figure was legible but hazy — enough strays mid-cell to
// grey out the gaps, and with the bloom on, that haze filled them in. Winding migration up biases the
// equilibrium toward the lines: they tighten and the cells empty.
//
// What this does NOT fix is the grains stranded at the antinode PEAKS, where grad(d²) vanishes and
// STICTION pins them regardless of how strong this is (see STICTION — those strays are on purpose).
// If the cells still are not clean enough, STICTION is the knob, not this one.
#define MIGRATE 0.0006

// AGITATION — the plate is shaking, so grains random-walk. This is not a garnish: without it every
// grain settles onto the mathematical zero of the field and the plate renders as clean one-pixel
// vector curves — a diagram, not an experiment. A line's WIDTH is the equilibrium between the
// migration force pulling grains in and this jitter pushing them out, which is exactly how it works
// on a real plate. Scaled by amplitude, so loud passages throw up dust and quiet ones sharpen.
#define AGITATION 0.0026

// STICTION — a grain won't slide until the force on it beats friction. The payoff is the strays:
// grad(d²) = 2d·grad(d) vanishes at the antinode PEAKS as well as on the nodal lines, so grains
// stranded mid-cell have almost nothing pushing them anywhere and simply sit there, which is where
// the scattered grains between the lines come from. Drop this to 0 and the cells go sterile; push it
// past ~0.35 and so many grains strand that the cells fog over and the figure loses its edge.
#define STICTION 0.24

// AMPLITUDE HOP (tone mode only). Real Chladni sand is thrown off the loud spots of the plate: where |W|
// is large the surface shakes hard and grains hop, near the nodal lines they don't. The only lateral force
// here is the grad(W²) drift, which also VANISHES at an antinode peak (grad(W²) = 2W·grad(W), and grad(W)=0
// there), so sand a previous tone left on an antinode has nothing acting on it and stays stuck. This adds a
// random lateral hop scaled by the local amplitude |W|/W_peak above HOP_THRESHOLD — nothing on the lines,
// most at the antinodes — which unsticks it so the drift can carry it to a line. See the hop term in main().
#define HOP 0.012              // calibrated so antinode sand clears in ~2 s (see the note where it's applied)
#define HOP_THRESHOLD 0.15     // |W|/W_peak below this doesn't hop — grains near a nodal line stay put

// GRAD_SAT — the half-saturation point of the migration force (see MIGRATION below, where the raw
// gradient is turned into a 0..1 magnitude by gm/(gm + GRAD_SAT)). It was 4.0 under the old field and
// it CANNOT stay there, because the two fields' gradients are not on remotely the same scale.
//
// The gradient of a sin·sin field scales with π·n, so with mode numbers in 2…8 it never fell below ~6.
// The gradient of a Bessel field scales with k, and k is a zero of J_n — which for the simplest figure
// this thing can draw, a single bare ring (n = 0, m = 1), is 2.4. A field that gentle produces grad(d²)
// under 1.0, which at the old half-saturation lands at sat ≈ 0.2: BELOW the stiction gate for most of
// the grains. The simple figures — exactly the ones a chill record gets, and the ones that most need to
// read cleanly — would simply never form. The sand would sit where it spawned.
//
// 0.6 is where the new field reproduces the old one's behaviour, and the quantity held fixed to get
// there is the fraction of the plate whose gradient beats the stiction gate — i.e. how much of it the
// sand can actually be DRIVEN across. Swept over a synthetic catalogue against the old field as the
// baseline, that fraction comes out at a median of 0.69 (old: 0.72) and a 95th percentile of 0.82 (old:
// 0.80), so the equilibrium between this, AGITATION and SPREAD — and therefore the WIDTH of a nodal
// line — carries over intact.
//
// It is tempting to keep winding this down, since smaller means stronger migration and tighter lines.
// Don't: by 0.1 the drivable fraction is past 0.9, which means almost nothing is left stranded, and the
// grains stranded mid-cell are not a defect. They are the scattered sand between the lines, and they
// are the whole difference between a photograph and a vector plot. STICTION is the knob for cell
// cleanliness; this one only sets whether the figure forms at all.
#define GRAD_SAT 0.6

// The outer margin where the rim's inward restoring force acts. It starts well outside the body of
// the figure (the plate runs to 1.75) so it drains the edge without compressing the pattern. Pull it
// in much further — a pull from, say, 1.2 covers 55% of the disc's AREA and would squeeze the outer
// nodal lines inward into a false ring.
#define RIM_SOFT 1.63
#define RIM_RETURN 0.0004

// SPREADING — grains push each other sideways, so a nodal line is a BAND with a thick core and
// sparse shoulders, not a hairline. Read as a gradient off the density splat and applied against
// MIGRATE: at a saturated gradient this is comparable to the seek force, so the pile widens until
// its own density gradient flattens and the two balance. That equilibrium IS the line's width.
//
// The raw gradient is unusable as a force. Density is an unbounded additive accumulation (65k grains
// splatting into 4k texels — a packed nodal line reads several units per texel), so scaling it by a
// constant, as the obvious formulation does, produces forces two orders of magnitude past MIGRATE and
// blows the plate apart on the first frame the sand gets anywhere near organised. Same fix as the
// migration force below it: DIRECTION from the gradient, saturating 0..1 magnitude.
#define SPREAD 0.0003
#define DENS_STEP 0.02

// Gravity, lowered from 0.008 so a hop reads. Hang time is 2v/g frames: a bass hop leaves the
// surface at ~0.06/frame, so 24 frames ≈ 0.4s in the air, peaking ~0.35 units up.
#define GRAVITY 0.005

// The two hops. Both are budgeted as an INTEGRAL, not a per-frame force, and both are gated to
// grounded grains — which is also what makes them self-limiting: a grain only receives the kick for
// the one or two frames before it leaves the surface, and then it is ballistic.
#define TRANS_HOP 0.030   // song change: grains stranded far off the incoming figure jump for it
#define BASS_HOP 0.018    // kick drum: grains over the antinodes LAUNCH, grains on the lines don't

varying vec2 vUv;

// Cheap per-grain, per-frame white noise.
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

void main() {
  vec4 pos = texture2D(uPositionTexture, vUv);
  vec4 vel = texture2D(uVelocityTexture, vUv);

  // —— UNDRIVEN PLATE (tone-mode idle, no tone selected). A plate nobody is driving does not move its sand:
  // there is no vibration, so no agitation random-walk, no amplitude hop, and — physically — no grain-on-grain
  // spreading or rim settling either (those are responses to a shaking surface). Zero the velocity and stop,
  // so a fresh sprinkle sits EXACTLY where it landed. uStill is 0 in music and in any active tone, so this
  // path never runs there and that code is byte-identical. (Keep the grain's mass in w.)
  if (uStill > 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, vel.w); return; }

  vec3 position = pos.xyz;
  vec3 velocity = vel.xyz;
  float phase = pos.w;   // 0..1, desynchronises the vertical bounce
  float mass = vel.w;    // 0.7..1.3 — light grains migrate faster and bounce higher

  // Forces below are tuned in per-frame units at 60fps.
  float fs = clamp(uDeltaTime * 60.0, 0.0, 2.0);

  vec2 pp = position.xz / FIELD_R;   // field coords: r = 1 is the figure's outermost nodal circle

  // —— Displacement and the gradient of its square, by forward difference on the SUMMED field.
  float e = 0.005;
  float d = fieldAt(pp);
  float dx = fieldAt(pp + vec2(e, 0.0));
  float dy = fieldAt(pp + vec2(0.0, e));
  vec2 grad = 2.0 * d * vec2(dx - d, dy - d) / e;

  // Displacement is already -1..1: the mode weights are pre-normalised on the CPU, and each is divided
  // by its own Bessel peak, so the vibration and agitation below read the same scale on every figure.
  float dn = d;

  // The surface this grain rests on: the plate, plus whatever sand has piled up here.
  float floorY = pileHeight(dn, phase);

  // —— 1. MIGRATION toward the nodal lines. The raw gradient magnitude scales with PI*n and with
  // the mode weights, so at high modes it runs into the hundreds — feeding it in raw would fling
  // grains off the plate the instant a hi-hat pushed the modes up. Take the DIRECTION from the
  // gradient and a saturating 0..1 magnitude from it, so the force has a hard ceiling.
  float gm = length(grad);
  float sat = gm / (gm + GRAD_SAT);
  bool sliding = length(velocity.xz) > 0.002;   // already moving → kinetic, not static, friction

  float r = length(position.xz);
  bool nearRim = r > RIM_SOFT;

  // The music no longer chooses the FIGURE — it drives how hard the plate is being shaken, and so
  // how urgently the sand seeks it. Loud passages: grains hunt the nodal lines fast. Sparse ones:
  // they drift. Mids (melody, vocals) sharpen the seek further; a mid-heavy section visibly pulls
  // the figure into focus. The 0.5 floor is what lets the pattern still form while paused.
  //
  // The field-change term is the recovery: when the spectrum moves the amplitudes and the nodal lines
  // migrate across the plate, the sand has to chase them, and at the normal seek rate it doesn't all
  // arrive before the figure moves again. Up to 4× while the field is reorganising hard, easing to 1×
  // once it settles.
  float seek = (0.5 + uAmplitude * 1.2) * (1.0 + uMids * 0.5)
             * (1.0 + uFieldChange * 3.0);

  // STICTION is suspended at the rim. Static friction is what strands grains mid-cell (the point of
  // it), but a grain pressed against the rim wall sits where the field's gradient is weakest, so the
  // gate never opens and it is pinned there FOREVER. That turns the rim into a one-way trap.
  if (gm > 1e-6 && (sat > STICTION * mass || sliding || nearRim)) {
    velocity.xz -= (grad / gm) * (MIGRATE * seek * sat / mass) * fs;
  }

  // —— 1b. SPREADING — push down the density gradient, away from where the sand already is. This is
  // the grain-on-grain contact the simulation otherwise has no notion of at all: without it, every
  // grain's equilibrium is the same mathematical curve and the entire pile collapses onto a line with
  // no width, which no real plate has ever produced.
  vec2 duv = position.xz / PLATE_SPAN + 0.5;
  float dL = texture2D(uDensityTexture, duv - vec2(DENS_STEP, 0.0)).r;
  float dR = texture2D(uDensityTexture, duv + vec2(DENS_STEP, 0.0)).r;
  float dD = texture2D(uDensityTexture, duv - vec2(0.0, DENS_STEP)).r;
  float dU = texture2D(uDensityTexture, duv + vec2(0.0, DENS_STEP)).r;
  vec2 dgrad = vec2(dR - dL, dU - dD);
  float dgm = length(dgrad);
  if (dgm > 1e-5) {
    float dsat = dgm / (dgm + 2.0);
    // uSpreadGain boosts this during a tone-off SPREAD so the grains flow apart into an even bed; it is 1
    // everywhere else, so the normal/music spreading is unchanged.
    velocity.xz -= (dgrad / dgm) * (SPREAD * uSpreadGain * dsat / mass) * fs;
  }

  // —— 2. AGITATION. The 0.3 floor is the important term: it keeps jostling grains that are already
  // ON a line (where |dn| = 0 and the vibration term below is silent), and that is what gives the
  // line its ragged edge.
  float drive = mix(0.15, 1.0, uAmplitude) + uBassImpulse * 0.6;  // idle floor keeps the sand alive
  float ag = AGITATION * drive * (0.3 + 0.7 * abs(dn)) / mass;
  velocity.xz += hash22(vUv * 137.0 + uTime * 13.7) * ag * fs;

  // —— 2b. AMPLITUDE HOP (tone mode only — see the HOP note above). A random lateral kick scaled by the
  // local plate amplitude |W|/W_peak above HOP_THRESHOLD: nothing on the nodal lines, most at the antinodes.
  // This shakes sand off an antinode peak (where grad(W²) = 0 and nothing else would move it) so the drift
  // can carry it to a line. Scaled by sqrt(fs) so it reads as DIFFUSION — frame-rate independent, since the
  // damped velocity's random-walk variance is then independent of dt. uToneActive is 0 in music and ink
  // mode, so neither is touched.
  float wNorm = abs(dn) / max(uAmplitude, 1e-3);   // |W| / W_peak (W_peak ≈ the drive level, ~max|W|)
  float hopMag = HOP * max(0.0, wNorm - HOP_THRESHOLD) * uToneActive;
  velocity.xz += hash22(vUv * 53.7 + uTime * 11.3) * hopMag * sqrt(fs);

  // —— 3. THE SURFACE. Everything below acts only on grains in CONTACT with it. The grounded gate
  // is what keeps a hop ballistic: a grain that has left the plate is in free flight and cannot be
  // pushed further up by a surface that is no longer touching it. Ungate any of these and the kick
  // keeps compounding for as long as the condition holds — the transition hop in particular sums to
  // ~40 frames of force and fires the entire plate's worth of sand into the camera.
  bool grounded = position.y < floorY + 0.01;

  if (grounded) {
    // 3a. VERTICAL BOUNCE. Grains sitting on a violently moving part of the plate get thrown off it;
    // grains on a nodal line never leave the surface. |dn| is the local shake amplitude, so the
    // airborne dust appears exactly over the antinodes and the lines stay crisp.
    float vibeAmp = abs(dn) * (uAmplitude + uBassImpulse * 0.8) * 0.05;
    float vibeHz = 3.0 + uBass * 8.0;
    velocity.y += max(sin(uTime * vibeHz + phase * 6.2831) * vibeAmp, 0.0) / mass;

    // 3b. MICRO-VIBRATION. The plate is being driven, so its surface is never still and neither is
    // anything resting on it. Amplitude-scaled, so it is the difference between sand that is settled
    // and sand that is settled ON SOMETHING RUNNING. Sub-visible per frame; the read is that the
    // figure breathes rather than sitting there like a printed image.
    velocity.y += sin(uTime * 10.0 + phase * 40.0) * uAmplitude * 0.003 * fs / mass;

    // Highs → fine shimmer. A hi-hat section makes the whole plate tremble at grain scale without
    // touching the macro figure.
    velocity.y += sin(uTime * 18.0 + phase * 60.0) * uHighs * 0.002 * fs / mass;

    // 3c. TRANSITION HOP. When the spectrum moves the amplitudes and the nodal lines migrate, a grain
    // sitting on a part of the plate that is now starting to shake jumps for the new pattern — the sand
    // visibly leaps and re-lands rather than sliding across like filings under a magnet. It fires off
    // uFieldChange, so it responds to the figure reorganising whatever caused it, not to a scripted
    // crossfade. The 0.2 floor lets grains currently on a nodal line hop too, since the reorganisation
    // may be turning that spot into an antinode.
    if (uFieldChange > 0.02) {
      velocity.y += (0.2 + 0.8 * abs(dn)) * TRANS_HOP * uFieldChange * fs / mass;
    }

    // 3d. BASS TRANSIENT → the plate gets HIT and the sand launches, hardest over the antinodes. The
    // 0.2 floor keeps a kick faintly felt even on the lines, where |dn| = 0.
    //
    // How much a grain actually receives is NOT uBassImpulse's full decay envelope, and it is worth
    // being precise about that because it is what makes this constant safe to push. The kick is gated on
    // the grounded flag, and a launched grain clears the surface within a frame or two — after which it is
    // ballistic and this term can no longer reach it. So it collects one or two frames of force, not the
    // ~10 the envelope lasts. That is a self-limiter: the kick cannot compound into an escape velocity
    // however hard it is driven, which is exactly what the ungated version of this would do.
    //
    // At 0.018 a bass hit throws an antinode grain to ~0.36 world units, against the ~0.03 it is already
    // bouncing at between kicks — a ~12× jump, and unmistakably a LAUNCH rather than a shuffle. The
    // camera looks straight down from 4.4, so that height reads as the grain swelling and brightening
    // into the lens (point size goes as 1/depth, and there is a 2.2× airborne swell on top). Grains ON
    // the nodal lines rise 0.005 and stay put, so the figure itself holds through the hit.
    velocity.y += uBassImpulse * (0.2 + 0.8 * abs(dn)) * BASS_HOP * fs / mass;

    // Idle: the plate is never quite still. A trembling surface, no migration. Depth from the
    // track's cached energy, so a loud song still reads as a loud song sitting paused.
    velocity.y += sin(uTime * 1.0 + phase * 6.2831) * uAmbient * uIdle;
  }

  // —— 3e. XZ MICRO-JITTER — grains shuffling in place. Unlike the vertical terms this one is not
  // gated: it is small enough not to disturb a ballistic arc, and gating it would make airborne
  // grains fall in unnaturally straight lines.
  velocity.x += sin(uTime * 7.3 + phase * 31.0) * uAmplitude * 0.001 * fs;
  velocity.z += cos(uTime * 8.7 + phase * 37.0) * uAmplitude * 0.001 * fs;

  // The horizontal kick is RANDOM per grain, not radially outward. A struck plate throws sand up and
  // rattles it; it does not blow it away from the centre. An outward-only shove is a DC pump — every
  // kick drives grains toward the rim, nothing drives them back, and over a few minutes of music the
  // sand ratchets into the edge and the figure visibly hollows out. This is a shake, and it sums to
  // zero.
  velocity.xz += hash22(vUv * 71.3 + uTime * 7.1) * uBassImpulse * 0.0015 * fs / mass;

  // —— 4. Gravity, and the landing. The grain lands on the PILE, not on the plate: floorY rises
  // toward the nodal lines, so arriving grains come to rest on top of the ones already there.
  velocity.y -= GRAVITY * fs;

  if (position.y + velocity.y * fs < floorY) {
    velocity.y *= -0.2;     // sand barely bounces; it mostly just lands
    velocity.xz *= 0.8;     // and skids to a stop when it does
  }

  // —— 5. Rim. This used to be a wall that both killed 80% of a grain's speed AND left it sitting in
  // the weakest part of the field, where stiction pinned it. Grains went in and never came out, so
  // every song change ratcheted a few more percent of the sand into the edge and the figure thinned.
  //
  // Now it drains instead of collecting: a soft inward restoring force across the outer margin, and
  // the wall merely CANCELS outward motion rather than reflecting and absorbing it — grains keep
  // their tangential speed and slide along the rim until the field or this force takes them back in.
  // The margin starts at RIM_SOFT, well outside the body of the figure, so the pattern itself is
  // untouched.
  if (nearRim) {
    vec2 outward = position.xz / max(r, 1e-5);
    velocity.xz -= outward * smoothstep(RIM_SOFT, EDGE_R, r) * RIM_RETURN * fs / mass;
    float vOut = dot(velocity.xz, outward);
    if (vOut > 0.0) velocity.xz -= outward * vOut;   // stop at the wall; don't bounce, don't absorb
  }

  // —— 6. Friction. XZ is the plate's surface drag, Y is air.
  velocity.xz *= pow(0.97, fs);
  velocity.y *= pow(0.99, fs);

  // Ease-to-still: at the tail of a SPREAD, uVelScale ramps 1→0 so the flow coasts to rest with no snap before
  // uStill freezes it. 1 everywhere else (×1.0 is exact), so normal/music velocities are unchanged.
  velocity *= uVelScale;

  gl_FragColor = vec4(velocity, mass);
}
`

// POSITION PASS — pure integration, plus the hard surfaces. The velocity pass has already turned
// the velocity around at the floor and the rim; these clamps only keep a large dt from tunnelling
// a grain through either.
const POSITION_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform float uDeltaTime;
uniform float uStill;   // 1 on the undriven idle plate — the sand lies flat, no nodal pile to climb

${FIELD}

#define FIELD_R ${FIELD_R.toFixed(2)}
#define EDGE_R ${EDGE_R.toFixed(2)}

varying vec2 vUv;

void main() {
  vec4 pos = texture2D(uPositionTexture, vUv);
  vec4 vel = texture2D(uVelocityTexture, vUv);

  vec3 position = pos.xyz + vel.xyz * clamp(uDeltaTime * 60.0, 0.0, 2.0);

  // The resting surface is the pile, not the bare plate — so this pass has to evaluate the field
  // too. One extra field sample per grain (no gradient), which is cheap, and it has to happen HERE:
  // the velocity pass can only turn a grain around, it can't stop it tunnelling through the pile on
  // a long frame. On the UNDRIVEN idle plate (uStill) there is no vibration and so no pile: the sand
  // lies flat at y = 0 where it was sprinkled (fieldAt is 0 everywhere there anyway, but pileHeight
  // reads a bare plate as "on a nodal line" and would lift every grain — so skip it when still).
  float phase = pos.w;
  float dn = fieldAt(position.xz / FIELD_R);
  position.y = max(position.y, uStill > 0.5 ? 0.0 : pileHeight(dn, phase));

  float r = length(position.xz);
  if (r > EDGE_R) position.xz *= EDGE_R / r;

  gl_FragColor = vec4(position, phase);   // w = phase, a per-grain constant
}
`

// —— DENSITY SPLAT PASS. Draws every grain as a soft blob into a 64×64 additive target, producing a
// coarse map of where the sand currently IS. The velocity pass reads its gradient and pushes grains
// downhill, which is the only thing in the simulation that knows grains cannot occupy the same space.
//
// It is deliberately low resolution. This is a crowding term, not a collision solver — 64×64 over the
// plate makes one texel ≈ 0.056 world units, a few grain diameters, which is the scale at which
// "there is already sand here" is the right question. Higher resolution would resolve individual
// grains and start modelling contacts, which is both wrong and unaffordable at 65k particles.
const DENSITY_VERT = /* glsl */ `
precision highp float;

uniform sampler2D uPositionTexture;

attribute vec2 aRef;

#define PLATE_SPAN ${(PLATE_R * 2).toFixed(2)}

void main() {
  vec4 posData = texture2D(uPositionTexture, aRef);

  // Straight from plate XZ to clip space — no camera. The density map is a top-down orthographic
  // image of the plate, always, regardless of what the display camera happens to be doing.
  vec2 plateUV = posData.xz / PLATE_SPAN + 0.5;
  gl_Position = vec4(plateUV * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = 3.0;   // device px in the 64×64 target ⇒ a splat radius of ~0.08 world units
}
`

const DENSITY_FRAG = /* glsl */ `
precision highp float;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(smoothstep(0.5, 0.0, d) * 0.02, 0.0, 0.0, 1.0);
}
`

// —— Render pass. The vertex shader reads position AND velocity out of the simulation textures; the
// CPU-side position attribute is a dummy that only exists so three knows how many points to draw.
const POINTS_VERT = /* glsl */ `
precision highp float;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform float uSizeScale;  // viewportHeightPx / (2 * tan(fov/2)) — the world→pixel projection factor
uniform float uSize;       // grain diameter in WORLD units

// —— IDLE SHIMMER (render-only). On the undriven idle plate the sand is physically frozen (the velocity
// texture is zeroed, see uStill), but a dead-still disc reads as a flat print. These add a tiny, slow,
// per-grain wander to the DRAWN position only — never written back to the position texture, so the physics
// stays honest and the idle displacement in the sim is exactly zero. uShimmerEnv is the fade envelope (0→1
// entering idle, 1→0 when a tone starts); it is 0 during any active tone and in music mode, so the branch is
// skipped there and gl_Position is byte-identical. uShimmerAmp is a world-unit amplitude (≈ one grain
// diameter); uShimmerSpeed scales time. prefers-reduced-motion drives uShimmerAmp to 0 from the wrapper.
uniform float uTime;
uniform float uShimmerAmp;
uniform float uShimmerSpeed;
uniform float uShimmerEnv;

// —— TONE DISSOLVE (render-only). When a tone is turned off the simulation instantly re-sprinkles to the idle
// dot, but the DISPLAY cross-fades: uDissolveTex holds the figure's positions snapshotted the instant before
// the re-sprinkle, and for the length of the dissolve each grain keeps drawing at its snapshot position (with a
// small fizzle) until its own eased swap time passes, after which it draws at its live (dot) position. Each
// grain is drawn at exactly ONE position — never both — so the grain count and density are unchanged. All of
// this is zero/off except during a turn-off dissolve, so the music/steady-tone render path is byte-identical.
uniform sampler2D uDissolveTex;
uniform float uDissolveOn;        // 1 only while a dissolve is animating
uniform float uDissolveProgress;  // 0..1 across the dissolve (elapsed / DISSOLVE_DUR)
uniform float uDissolveJitter;    // world-unit fizzle amplitude on the not-yet-swapped grains

attribute vec2 aRef;   // this particle's texel address

varying float vHeight;
varying float vSpeed;
varying float vRand;   // per-grain material seed — see below

void main() {
  vec4 posData = texture2D(uPositionTexture, aRef);
  vec4 velData = texture2D(uVelocityTexture, aRef);

  float phase = posData.w;   // 0..1, a per-grain constant
  vSpeed = length(velData.xyz);

  // The drawn position starts at the LIVE grain position (the simulation's truth).
  vec3 drawPos = posData.xyz;

  // Per-grain seed, decorrelated from phase — shared by the dissolve swap-time and the idle shimmer below.
  float id = fract(sin(dot(aRef, vec2(45.207, 13.681))) * 9123.17);

  // —— TONE DISSOLVE (render-only; see TONE DISSOLVE above). Before this grain's eased swap time it is still
  // drawn at its snapshot (figure) position with a small fizzle; after it, at its live position. ti is eased so
  // the swaps start gently and finish cleanly. One position per grain — the other set is never drawn.
  if (uDissolveOn > 0.5) {
    float ti = smoothstep(0.0, 1.0, id);   // this grain's normalised swap time in [0,1]
    if (uDissolveProgress < ti) {
      vec4 snap = texture2D(uDissolveTex, aRef);
      drawPos = snap.xyz;
      float jt = uTime * 6.0;              // a touch faster than the shimmer — a fizzle, not a drift
      drawPos.xz += vec2(sin(jt + id * 6.2831), cos(jt * 1.3 + id * 10.0)) * uDissolveJitter;
    }
  }

  // Render-only idle wander (see IDLE SHIMMER above). Two slow octaves per axis give a smooth, organic drift
  // (peak ≈ uShimmerAmp, since the octave weights sum to 1), decorrelated grain to grain so the disc breathes
  // rather than sliding as one block. y is left alone — the wander is in the plate plane. uShimmerEnv is held at
  // 0 during a tone AND during a dissolve, so this is a no-op then (the shimmer fades in once the dissolve ends).
  float sAmp = uShimmerAmp * uShimmerEnv;
  if (sAmp > 0.0) {
    float t = uTime * uShimmerSpeed;
    float ox = 0.65 * sin(t + id * 6.2831) + 0.35 * sin(t * 1.7 + id * 21.1);
    float oz = 0.65 * cos(t * 0.9 + id * 4.17) + 0.35 * cos(t * 1.5 + id * 17.3);
    drawPos.xz += vec2(ox, oz) * sAmp;
  }

  // Lighting/size read the DRAWN height, so a fizzling grain reads with the figure's pile height until it swaps.
  // With no dissolve and no shimmer, drawPos == posData.xyz, so this is identical to the live value.
  vHeight = drawPos.y;

  // A SECOND independent random, not phase again. phase already drives the grain's size class below
  // AND its rest height in the pile, so reusing it for colour and roughness would correlate all
  // three: every large grain would also be the palest and sit highest, and the sand would come out
  // visibly sorted rather than mixed. Hashing the texel address costs nothing and is decorrelated.
  vRand = fract(sin(dot(aRef, vec2(12.9898, 78.233))) * 43758.5453);

  vec4 mvPosition = modelViewMatrix * vec4(drawPos, 1.0);
  float depth = -mvPosition.z;

  // SIZE CLASSES, not a uniform spread. Real sand is graded: mostly fines, some medium, a few coarse
  // grains. A flat random distribution reads as noise; a graded one reads as a material. The 60/30/10
  // split is what makes a close look at the pile show individual big grains sitting proud of it.
  //
  // Size correlates with phase, and so does the pile's rest height — which is a happy accident worth
  // keeping: in a vibrated granular bed the large grains rise to the top (the Brazil-nut effect), and
  // that is exactly what this produces.
  float sizeClass;
  if (phase < 0.6)      sizeClass = 0.8 + phase * 0.3;          // 60% fines
  else if (phase < 0.9) sizeClass = 1.0 + (phase - 0.6) * 1.0;  // 30% medium
  else                  sizeClass = 1.3 + (phase - 0.9) * 2.0;  // 10% coarse

  // True perspective sizing. NOT a hardcoded pixel constant: gl_PointSize is in DEVICE pixels, so
  // "size * (15.0 / -mvPosition.z)" bakes in the canvas resolution — the same grain would come out
  // half as big, relative to the plate, on a retina panel as on a standard one, and the sand would
  // change texture with the window. uSizeScale is height/(2·tan(fov/2)) in device px, so uSize is a
  // world DIAMETER and a grain holds its physical size at any resolution or DPR.
  //
  // Airborne and moving grains swell, so the dust thrown off the antinodes reads as dust rather than
  // as noise, and a grain caught mid-hop is the thing your eye goes to.
  float world = uSize * sizeClass
              * (1.0 + smoothstep(0.0, 0.10, drawPos.y) * 1.2)   // drawn height (== live when not dissolving)
              * (1.0 + vSpeed * 1.5);
  gl_PointSize = clamp(world * uSizeScale / max(depth, 0.001), 1.0, 10.0);

  gl_Position = projectionMatrix * mvPosition;
}
`

// Lit grains under a three-point studio rig. Every grain is a sphere impostor: the normal is
// reconstructed from the point coord, so the lights rake across each one individually and a grain has
// a bright side, a dark side and a specular hit. That, plus depth-sorted occlusion, is what separates
// "sand" from "glowing dots" — under additive blending a pile just gets brighter, whereas a real pile
// gets SHADED, and the near grains hide the ones behind them.
//
// The lights are declared in the point sprite's own space (+x right, +y up, +z toward the camera),
// not world space. There is no correct world-space answer for an impostor — the geometry is a lie —
// and screen-space light directions are what a C4D render of this shot would look like anyway,
// because the camera is locked overhead and never moves.
const POINTS_FRAG = /* glsl */ `
precision highp float;

uniform float uGlow;        // GLOW — constant across the catalogue; drives emissive and edge softness
uniform float uBassImpulse; // the decaying bass transient, 0..1 — the same one that drives the hop

#define BASS_FLASH ${BASS_FLASH.toFixed(2)}
#define GRAIN_GRAY ${TARGET_LUMA.toFixed(4)}   // flat grey tone of every grain (see GRAIN TONE)

uniform vec3 uKeyDir;    uniform vec3 uKeyColor;    uniform float uKeyI;
uniform vec3 uFillDir;   uniform vec3 uFillColor;   uniform float uFillI;
uniform vec3 uRimColor;  uniform float uRimI;

varying float vHeight;
varying float vSpeed;
varying float vRand;

// HIGHLIGHT ROLLOFF, and the reason there is no tone mapping on the renderer. This is now the single
// most load-bearing line in the shader: with GLOW flat at 1.0, EVERY record's grains sum past 1.0
// where the sand is dense (emissive + key + rim + airborne runs past 2.0 on a lit airborne grain),
// so the whole catalogue depends on this behaving rather than just the loud end of it.
//
// Clipping that overflow is not a cosmetic problem. Everything above 1.0 clamps to the SAME white, so
// the per-grain brightness variation this entire shader exists to produce is erased exactly where the
// sand is densest, and the nodal lines render as one flat white mass. The grains stop being grains.
//
// ACES on the renderer would fix the clipping and cost more than it saves — it is a filmic curve that
// pulls the MIDS down too (a 0.78 grain lands near 0.6), and the sand goes muddy everywhere to solve
// a problem the highlights have. This is a knee instead: below K it is completely transparent, so the
// shaded body of every grain is untouched; above K, a smooth asymptote to 1.0 that keeps hot grains
// ORDERED rather than equal. That ordering is what still reads as texture inside a blown-out pile.
vec3 rolloff(vec3 c) {
  const float K = 0.8;
  vec3 over = max(c - K, 0.0);
  return min(c, vec3(K)) + (1.0 - K) * (over / (over + (1.0 - K)));
}

void main() {
  // Sphere impostor: turn the square point sprite into a ball.
  vec2 cc = gl_PointCoord * 2.0 - 1.0;
  cc.y = -cc.y;                          // gl_PointCoord's y runs down the screen
  float r2 = dot(cc, cc);
  if (r2 > 1.0) discard;
  vec3 normal = vec3(cc, sqrt(1.0 - r2));

  const vec3 viewDir = vec3(0.0, 0.0, 1.0);   // the camera, in sprite space

  // —— BASE COLOUR. The grain tone is a flat neutral grey at GRAIN_GRAY (= TARGET_LUMA): the colour ramp
  // is gone. It takes the place the per-grain hue used to (base mix, rim tint, emissive, bass flash, speed
  // smear), so every downstream term keeps the same luminance it had — the emissive/bloom/ink path is
  // unchanged, since every ramp stop was already equalised to this same luminance.
  vec3 grainTone = vec3(GRAIN_GRAY);

  vec3 baseSand = mix(vec3(0.78, 0.74, 0.68), vec3(0.72, 0.70, 0.66), step(0.5, vRand));
  vec3 baseColor = mix(baseSand, grainTone, 0.75) * (0.85 + vRand * 0.3);

  // —— MATERIAL. Roughness varies per grain, which is the whole reason the pile glitters: at uniform
  // roughness every grain takes the specular identically and the highlight becomes a flat sheen
  // across the whole plate. Varied, only some grains catch the key at the right angle at any moment,
  // and the pile sparkles the way a real one does.
  float roughness = 0.65 + vRand * 0.2;
  float specPower = mix(80.0, 20.0, roughness);      // smoother grains: tighter, brighter hit
  float specIntensity = mix(0.5, 0.15, roughness);

  // —— KEY. Warm, strong, high.
  float keyDiff = max(dot(normal, uKeyDir), 0.0);
  vec3 keyHalf = normalize(uKeyDir + viewDir);
  float keySpec = pow(max(dot(normal, keyHalf), 0.0), specPower) * specIntensity;
  vec3 lit = (baseColor * keyDiff + keySpec) * uKeyColor * uKeyI;

  // —— FILL. Cool, soft, opposite. It exists to stop the unlit side of every grain going to pure
  // black, which is what makes a naive one-light impostor read as a flat crescent rather than a ball.
  lit += baseColor * max(dot(normal, uFillDir), 0.0) * uFillColor * uFillI;

  // —— RIM. A Fresnel edge light, pulled halfway to the grain tone. It has no direction: at grain scale a
  // rim light IS just "the edges are brighter", and giving it a direction would only make half the grains
  // in the pile disagree about where the back of the studio is.
  float rimFresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  lit += rimFresnel * uRimColor * uRimI * mix(vec3(1.0), grainTone, 0.5);

  lit += baseColor * 0.12;   // ambient — nothing in a lit room is ever fully black

  // —— ENVIRONMENT. A one-line fake: reflect the view off the normal and look up a vertical gradient
  // (bright above, dark to the sides). Scaled by the INVERSE of roughness, so it only touches the
  // smooth grains. Not a mirror — just enough sheen that the grains feel like they are sitting under
  // something rather than floating in a void.
  vec3 refl = reflect(-viewDir, normal);
  vec3 envColor = mix(vec3(0.02), vec3(0.15, 0.14, 0.13), refl.z * 0.5 + 0.5);
  lit = mix(lit, lit + envColor, (1.0 - roughness) * 0.3);

  // —— EMISSIVE. The sand is lit from within. The grain emits its own grey tone — the bloom is a luminance
  // high-pass, and a single flat gain sets the absolute emissive level: 0.9375, so a GRAIN_GRAY (0.55) tone
  // emits at luminance ~0.52 — comfortably above BLOOM_THRESHOLD (0.3). This is byte-identical to the old
  // hue path, whose stops were all pre-equalised to this same luminance.
  vec3 emissive = grainTone * 0.9375;
  lit += emissive;

  // —— THE BASS PULSE. The grain is struck, so it brightens and fades — in its own grey tone, not in pure
  // white. It was white, on the theory that a struck thing flashes white-hot; but this fires on every
  // kick, several times a bar, forever, and a white term on that duty cycle does not read as an impact.
  // The pulse should make the sand more ITSELF for a moment, not rinse it out toward white.
  //
  // Flat across every grain, NOT scaled by |displacement|. Scaling it would confine the flash to the
  // antinodes — that is, to the empty cells BETWEEN the nodal lines — and light the gaps rather than the
  // figure.
  //
  // Where this actually lands is not where you would guess, and the highlight knee at the bottom of this
  // shader is why. A grain already sitting on a nodal line is up against the knee's asymptote and
  // brightens by ~2%; a launched airborne one, not at all. They are at the ceiling and there is no more
  // white left to give them. What moves is the BOTTOM of the range — a stray in a dark cell lifts ~32% —
  // and the MIDDLE, where +0.08 carries a narrow band of grains (~6% of the brightness range) up over the
  // 0.67 bloom threshold they were sitting just under, so slightly more of the plate blooms on the same
  // frame that the bloom itself is 32% stronger. The pulse you see is mostly that. It is NOT the hot
  // grains getting hotter, which is worth knowing before anyone tries to tune it by watching them.
  //
  // And do not wind this up to brighten the nodal lines directly. Their headroom is gone by design: past
  // the knee everything clips to the SAME white, and the per-grain variation this entire shader exists to
  // produce would be erased exactly where the sand is densest. The figure would "flash" by dissolving
  // into a flat white mass, which is the one thing the knee is there to prevent.
  lit += grainTone * uBassImpulse * BASS_FLASH;

  // Airborne grains catch more light — ON THEIR OWN SURFACE. This used to add flat white, and that was
  // the single biggest thing washing the colour out of the picture: a grain thrown off an antinode was
  // being handed +0.3 of pure white, which is as much light as the entire emissive term, and it landed
  // on precisely the sand the eye tracks. It got worse when the bass hop was tripled, because that put
  // far more of the plate in the air on every kick. A grain lifted into the key light does not turn
  // white; it is simply better lit, in the colour it already was. Multiplying baseColor instead of
  // adding white says that, and it costs nothing — the coefficient goes 0.3 → 0.45 to hold the same
  // brightness lift, so airborne sand still reads as distinctly hotter than the settled figure.
  lit += baseColor * smoothstep(0.0, 0.08, vHeight) * 0.45;
  lit += smoothstep(0.0, 0.10, vSpeed) * 0.1 * grainTone;   // and moving ones smear a little

  // Fake AO: grains down in the bed are shadowed by their neighbours; grains proud of it are not.
  lit *= 0.85 + smoothstep(0.0, 0.03, vHeight) * 0.15;

  // —— EDGE. Antialiasing, and a material cue — a glowing grain has a softer silhouette than an inert
  // one, because light bleeds past its edge. Tied to uGlow so it stays in step with the emissive; at
  // GLOW = 1.0 that is a fixed 0.7, i.e. the outer 30% of every grain feathers.
  float alpha = smoothstep(1.0, mix(0.85, 0.7, uGlow), sqrt(r2));

  gl_FragColor = vec4(rolloff(lit), alpha);
}
`

export {
  QUAD_VERT, COPY_FRAG, RESPRINKLE_MIX, RESPRINKLE_FRAG, VELOCITY_FRAG, POSITION_FRAG, DENSITY_VERT, DENSITY_FRAG,
  POINTS_VERT, POINTS_FRAG, WISP_SOURCE_VERT, WISP_SOURCE_FRAG, WISP_SIM_FRAG, WISP_BLUR_FRAG,
  InkShader, srgbVec,
  FALLBACK_RGB, BG, GLOW, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD, BLOOM_PULSE,
  FOG_CENTER, FOG_EDGE, INK, INK_GAMMA, HAZE_AMP, ATMOS, ATMOS_MIN, ATMOS_MAX,
  VEIL_AMT, VEIL_MIN, VEIL_MAX, WISP_EMIT, WISP_EMIT_MIN, WISP_EMIT_MAX, WISP_DT_CLAMP,
}
