// GENERATED from chladni@8a67cc5 (v5-portfolio). Do not edit here. Edit in ~/Desktop/chladni and re-sync.
// —— ChladniSim: the GPGPU simulation + render pipeline (extracted verbatim from ChladniVisualizer's
// pipeline useEffect). The whole frame loop and the WebGL teardown live here; the React wrapper owns
// the rAF loop, the keyboard, the HUD callback, the (music) driver, ?debug/?forcefail and the 2D
// fallback. Methods are defined inside the constructor so they close over the construction locals —
// so the moved construction/render/dispose code is byte-identical; only the driver/look/dt interface
// points differ. No music code is imported here (see rule 5).
//   new ChladniSim(host, { onFailure }) -> .resize(), .step(dt, { driver, look }), .setOverlay(v),
//   .setFrozen(v), .dispose();  look = { arrival, inkGamma, wisp, wispEmit, veil, veilAmt, atmos }.
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import {
  TEX, PARTICLE_COUNT, SPAWN_R, DENSITY_TEX, FIELD_R, MODES, MODE_COUNT,
  SMOOTH_TAU, RELEASE_TAU, RELEASE_ON, DRIVE_TAU, DIST_FLOOR, besselJ, besselI, nodalLineSegments,
} from './plate.js'
import {
  QUAD_VERT, COPY_FRAG, RESPRINKLE_FRAG, VELOCITY_FRAG, POSITION_FRAG, DENSITY_VERT, DENSITY_FRAG,
  POINTS_VERT, POINTS_FRAG, WISP_SOURCE_VERT, WISP_SOURCE_FRAG, WISP_SIM_FRAG, WISP_BLUR_FRAG,
  InkShader, srgbVec, GLOW, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD, BLOOM_PULSE,
  FOG_CENTER, FOG_EDGE, INK, HAZE_AMP, BG, WISP_EMIT, WISP_DT_CLAMP,
} from './shaders.js'
import { TONE_TAU } from './drivers/tone.js'   // per-mode ring-down for the tone-mode distribution (physics)

// Bass transients (CPU) → a decaying kick (GPU) that briefly throws extra dust off the plate.
const BASS_ONSET = 0.15
const BASS_JUMP = 0.08

// —— The lighting rig. Three lights, no shadows (65k points cannot afford a shadow map, and sand at
// this scale self-shadows into the fake AO term rather than casting). Directions are in the point
// sprite's space: +x right, +y up the screen, +z toward the camera.
const KEY_DIR = [0.5, 0.9, 0.3]      // warm, strong, high
const KEY_COLOR = [1.0, 0.95, 0.88]
const KEY_I = 0.85
const FILL_DIR = [-0.4, 0.5, -0.2]   // cool, soft, opposite — keeps the shadow side off pure black
const FILL_COLOR = [0.85, 0.9, 1.0]
const FILL_I = 0.25
const RIM_COLOR = [1.0, 0.95, 0.9]   // Fresnel edge light; directionless by design (see POINTS_FRAG)
const RIM_I = 0.4

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]).normalize()
const rgb = (a) => new THREE.Vector3(a[0], a[1], a[2])

function readDiag(gl) {
  try {
    const is2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    return {
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : '(no navigator)',
      webgl: is2 ? 'WebGL2' : 'WebGL1',
      gpu: String(gpu),
      extColorBufferFloat: !!gl.getExtension('EXT_color_buffer_float'),
      extColorBufferHalfFloat: !!gl.getExtension('EXT_color_buffer_half_float'),
      oesTextureFloatLinear: !!gl.getExtension('OES_texture_float_linear'),
    }
  } catch (e) {
    return { ua: navigator?.userAgent, webgl: 'error', gpu: String(e), extColorBufferFloat: false, extColorBufferHalfFloat: false, oesTextureFloatLinear: false }
  }
}

// Probe capabilities from a throwaway context when the real renderer failed to even construct.
function probeWebGL() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')
    if (!gl) return { ua: navigator?.userAgent, webgl: 'none', gpu: '(no WebGL context)', extColorBufferFloat: false, extColorBufferHalfFloat: false, oesTextureFloatLinear: false }
    return readDiag(gl)
  } catch (e) {
    return { ua: navigator?.userAgent, webgl: 'none', gpu: String(e), extColorBufferFloat: false, extColorBufferHalfFloat: false, oesTextureFloatLinear: false }
  }
}

// WebGL availability probe for callers that want to branch before mounting (wraps probeWebGL).
export function canRunChladni() {
  const d = probeWebGL()
  return d.webgl !== 'none' && d.webgl !== 'error'
}

export { probeWebGL }

export class ChladniSim {
  constructor(host, { onFailure, stats = false } = {}) {
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        // 'default' (not 'high-performance'): on dual-GPU MacBooks high-performance forces the discrete
        // GPU, whose layer can render black on the actual screen with some macOS/driver/browser combos (and
        // which OS screen-capture also tends to miss). Integrated-GPU output is more reliable on both counts.
        powerPreference: 'default',
      })
    } catch (e) {
      // No WebGL context at all. Record the reason + whatever capabilities we can still probe, and flip to
      // the 2D fallback figure instead of leaving a silent black tile.
      console.error('[drift:visualizer] WebGLRenderer creation failed:', e)
      this.diag = probeWebGL()
      this.failed = true
      onFailure?.({ reason: 'renderer-create', detail: String(e?.message || e), diag: this.diag })
      return
    }
    this.failed = false
    const pr = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pr)

    // NO tone mapping — but no longer because nothing overflows. A loud track's emissive + rim +
    // airborne terms DO push grains past 1.0; that overflow is handled by the highlight knee at the
    // end of POINTS_FRAG, which leaves the midtones alone. A global ACES curve here would instead
    // pull every grain in the catalogue down (a 0.78 grain lands near 0.6, and the sand reads muddy)
    // to solve a problem only the loud end has. OutputPass still runs, for the sRGB conversion.
    renderer.toneMapping = THREE.NoToneMapping
    renderer.setClearColor(BG, 1)

    // Simulation textures must be renderable AND filterable-as-data. Full float is the target;
    // half float is the fallback on GPUs without EXT_color_buffer_float (positions stay within ±2
    // where half-float precision is ~1e-3, far finer than a grain).
    const gl = renderer.getContext()
    const canFloat = !!gl.getExtension('EXT_color_buffer_float')
    const DATA_TYPE = canFloat ? THREE.FloatType : THREE.HalfFloatType

    // —— Failure diagnostics + graceful-fallback hooks ——————————————————————————————————————————————
    // Record capabilities for the ?debug=1 overlay (shown even on success, so a report screenshot is useful).
    this.diag = readDiag(gl)
    // Shader compile/link failure — a GPU/driver rejecting a shader that compiled fine elsewhere is the
    // classic "black on their machine, works on mine". three calls this on the failing program.
    renderer.debug.onShaderError = (glc, program) => {
      const log = (glc.getProgramInfoLog(program) || '').trim()
      console.error('[drift:visualizer] shader compile/link failed:\n' + log)
      onFailure?.({ reason: 'shader-compile', detail: log.split('\n').slice(0, 8).join('\n'), diag: this.diag })
    }
    // Context loss — GPU reset, or too many live WebGL contexts (see forceContextLoss in cleanup).
    const onContextLost = (e) => {
      e.preventDefault()
      console.error('[drift:visualizer] webglcontextlost')
      onFailure?.({ reason: 'context-lost', detail: 'webglcontextlost fired', diag: this.diag })
    }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    const scene = new THREE.Scene()

    // Straight down. A Chladni figure IS a 2D shape lying on the surface, and any rake foreshortens
    // it into an ellipse — the pattern is the subject, so the pattern gets the undistorted view.
    //
    // The distance FRAMES the figure, and the whole figure is now inside the frame. The tile is
    // landscape (~16:9 and wider), so the VERTICAL axis is the one that crops: at a 45° vertical fov
    // the frame shows ±d·tan(22.5°) = ±0.414·d world units, and the sand is hard-clamped at EDGE_R
    // (1.75) by the position pass. So containment is one inequality — 0.414·d > 1.75, i.e. d > 4.23.
    // At 4.4 the sand rim lands at ~96% of the half-height: contained, with a little air around it.
    //
    // This used to sit at 3.85, which put the rim at 110% of the half-height and sliced the disc flat
    // along the top and bottom edges. That was a deliberate crop back when a 1.85-radius PLATE mesh
    // sat under the sand and the shot was a close-up of a larger object — the plate is gone, so the
    // crop was just clipping the subject.
    //
    // The circular clamp at EDGE_R stays load-bearing regardless: it is what stops outward-driven
    // grains piling into a hard arc at the boundary. Fixed camera; no OrbitControls.
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50)
    camera.position.set(0, 4.4, 0)
    // Looking straight down, the view direction is parallel to the DEFAULT up vector (0,1,0), and
    // lookAt's cross product degenerates — the camera's orientation is undefined and the scene can
    // come out blank or arbitrarily rolled. Re-point up along -Z first so "up the screen" means
    // "away from the viewer across the plate".
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0, 0)

    // —— GPGPU scaffolding: one fullscreen quad, reused by every simulation pass.
    const quadScene = new THREE.Scene()
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quadGeo = new THREE.PlaneGeometry(2, 2)
    const quadMesh = new THREE.Mesh(quadGeo, new THREE.MeshBasicMaterial())
    quadScene.add(quadMesh)

    const makeTarget = () => new THREE.WebGLRenderTarget(TEX, TEX, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: DATA_TYPE,
      depthBuffer: false,
      stencilBuffer: false,
    })
    const posA = makeTarget()
    const posB = makeTarget()
    const velA = makeTarget()
    const velB = makeTarget()
    // Snapshot of the grain positions at a moment in time (the figure just before a re-sprinkle), held for the
    // render-only tone dissolve: the display cross-fades each grain from this frozen figure to its live position.
    // Filled by snapshot(); read only by the grain render (uDissolveTex). Never participates in the simulation.
    const snapshotTarget = makeTarget()

    // The density target, and the two things about it that are NOT free choices:
    //
    // HALF float, not full, even where full float is available for the simulation. The splat pass
    // additively BLENDS into this target, and blending into a 32-bit float attachment needs
    // EXT_float_blend — which is not universal, and where it is missing the blend is silently dropped
    // and the density map comes out as the last grain drawn rather than the sum of all of them. Half
    // float blending is core in WebGL2. The values here run 0..~10 with no precision demands.
    //
    // LINEAR filtering, unlike the simulation targets: the velocity pass reads this at four offset
    // taps to take a gradient, and nearest filtering would quantise that gradient into 64 steps
    // across the plate — grains would feel a staircase and visibly snap to texel boundaries.
    const densityTarget = new THREE.WebGLRenderTarget(DENSITY_TEX, DENSITY_TEX, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    })

    // —— Seed data. Grains start scattered evenly across the bare plate, with no pattern at all;
    // the first few seconds of playback are the sand FINDING the figure, which is the whole trick
    // and is worth seeing. sqrt(u) for the radius, or they bunch at the centre.
    const posData = new Float32Array(PARTICLE_COUNT * 4)
    const velData = new Float32Array(PARTICLE_COUNT * 4)
    const refs = new Float32Array(PARTICLE_COUNT * 2)
    const dummyPos = new Float32Array(PARTICLE_COUNT * 3)

    // THE spawn, factored so the re-sprinkle (resprinkle(), below) reuses the exact same code path:
    // fresh scattered position (sqrt(u) radius so they don't bunch at the centre) + random phase,
    // velocity zeroed, fresh random mass. Writes the pos/vel pair for every grain into the given arrays.
    const fillSpawn = (posArr, velArr) => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * SPAWN_R
        const i4 = i * 4
        posArr[i4] = Math.cos(angle) * radius
        posArr[i4 + 1] = 0                        // on the plate surface
        posArr[i4 + 2] = Math.sin(angle) * radius
        posArr[i4 + 3] = Math.random()            // phase — desynchronises the bounce
        velArr[i4] = 0
        velArr[i4 + 1] = 0
        velArr[i4 + 2] = 0
        velArr[i4 + 3] = 0.7 + Math.random() * 0.6  // mass
      }
    }
    fillSpawn(posData, velData)

    // refs = each grain's texel address (constant); dummyPos = draw-count stand-in (never read — the
    // shaders sample the position texture via aRef). Built once from the initial spawn.
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const col = i % TEX
      const row = Math.floor(i / TEX)
      refs[i * 2] = (col + 0.5) / TEX
      refs[i * 2 + 1] = (row + 0.5) / TEX
      const i3 = i * 3
      dummyPos[i3] = posData[i * 4]
      dummyPos[i3 + 1] = 0
      dummyPos[i3 + 2] = posData[i * 4 + 2]
    }

    const makeData = (arr) => {
      const t = new THREE.DataTexture(arr, TEX, TEX, THREE.RGBAFormat, THREE.FloatType)
      t.minFilter = THREE.NearestFilter
      t.magFilter = THREE.NearestFilter
      t.needsUpdate = true
      return t
    }
    const posSeed = makeData(posData)
    const velSeed = makeData(velData)

    const copyMat = new THREE.ShaderMaterial({
      uniforms: { uSource: { value: null } },
      vertexShader: QUAD_VERT,
      fragmentShader: COPY_FRAG,
      depthTest: false,
      depthWrite: false,
    })

    // —— RE-SPRINKLE (tone mode only; see RESPRINKLE_* in shaders.js and resprinkle() below). On a tone
    // change, a MIX fraction of grains are re-spawned as a fresh load. resprinklePos/Vel are CPU scratch
    // arrays refilled by fillSpawn each event; freshPosTex/freshVelTex upload them; resprinkleMat is the
    // per-grain selector (keep current vs take fresh), run once for positions and once for velocities.
    const resprinklePos = new Float32Array(PARTICLE_COUNT * 4)
    const resprinkleVel = new Float32Array(PARTICLE_COUNT * 4)
    const freshPosTex = makeData(resprinklePos)   // re-uploaded (needsUpdate) each resprinkle
    const freshVelTex = makeData(resprinkleVel)
    const resprinkleMat = new THREE.ShaderMaterial({
      uniforms: { uCurrent: { value: null }, uFresh: { value: null }, uMix: { value: 0 }, uSeed: { value: 0 } },
      vertexShader: QUAD_VERT,
      fragmentShader: RESPRINKLE_FRAG,
      depthTest: false,
      depthWrite: false,
    })

    const blit = (material, target) => {
      quadMesh.material = material
      renderer.setRenderTarget(target)
      renderer.render(quadScene, quadCamera)
      renderer.setRenderTarget(null)
    }

    // Prime BOTH halves of each ping-pong pair, so nothing ever samples an uninitialised target.
    copyMat.uniforms.uSource.value = posSeed
    blit(copyMat, posA)
    blit(copyMat, posB)
    copyMat.uniforms.uSource.value = velSeed
    blit(copyMat, velA)
    blit(copyMat, velB)

    // —— Simulation materials. Both passes evaluate the SAME field, so they share one set of field
    // uniform objects by reference — the frame loop writes them once and both passes see it. Two
    // copies would be a standing invitation for the position pass to clamp grains to a pile computed
    // from a field the velocity pass isn't using.
    // The field is the solved mode table: a constant vec4 array of shapes (n, λ, φ, c), plus a parallel
    // float array of live amplitudes rewritten each frame from the FFT. uModes never changes after this;
    // ampArray is the per-frame backing store the loop writes into (it IS st.modeAmp, see below).
    const modeVecs = MODES.map((md) => new THREE.Vector4(md.n, md.lambda, md.phi, md.c))
    const ampArray = new Float32Array(MODE_COUNT)
    const fieldUniforms = {
      uModes: { value: modeVecs },
      uAmp: { value: ampArray },
    }

    const velocityMat = new THREE.ShaderMaterial({
      uniforms: {
        ...fieldUniforms,
        uPositionTexture: { value: null },
        uVelocityTexture: { value: null },
        uDensityTexture: { value: densityTarget.texture },
        uTime: { value: 0 },
        uDeltaTime: { value: 0.016 },
        uBass: { value: 0 },
        uMids: { value: 0 },
        uHighs: { value: 0 },
        uAmplitude: { value: 0 },
        uBassImpulse: { value: 0 },
        uAmbient: { value: 0 },   // written each frame by the driver (was featRef f.ambient)
        uIdle: { value: 1 },
        uFieldChange: { value: 0 },   // velocity pass only; position pass doesn't use it
        uToneActive: { value: 0 },    // 1 only while a tone button drives the plate — gates the amplitude hop
        uStill: { value: 0 },         // 1 only on the undriven idle plate (tone mode, no tone) — freezes the sand
        uSpreadGain: { value: 1 },    // density-spreading force multiplier (boosted during a tone-off SPREAD)
        uVelScale: { value: 1 },      // final velocity scale (ramps 1→0 to ease a SPREAD into stillness)
      },
      vertexShader: QUAD_VERT,
      fragmentShader: VELOCITY_FRAG,
      depthTest: false,
      depthWrite: false,
    })

    const positionMat = new THREE.ShaderMaterial({
      uniforms: {
        ...fieldUniforms,   // same objects, by reference — see above
        uPositionTexture: { value: null },
        uVelocityTexture: { value: null },
        uDeltaTime: { value: 0.016 },
        uStill: { value: 0 },   // 1 on the undriven idle plate — the sand lies flat, no nodal pile to climb
      },
      vertexShader: QUAD_VERT,
      fragmentShader: POSITION_FRAG,
      depthTest: false,
      depthWrite: false,
    })

    // There is NO plate. The Chladni figure is the subject and it is the entire subject — a disc
    // under it is a stage, and a stage tells you that you are looking at a rendering of an
    // experiment. The sand hangs in the dark instead, and the pattern has to carry the frame alone.

    // ONE geometry, TWO Points objects: the display pass and the density splat. They share the same
    // buffers (an Object3D can only have one parent, so they cannot be the same object, but the
    // 65k-vertex geometry is not duplicated).
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(dummyPos, 3))
    geometry.setAttribute('aRef', new THREE.BufferAttribute(refs, 2))

    const densityMat = new THREE.ShaderMaterial({
      uniforms: { uPositionTexture: { value: null } },
      vertexShader: DENSITY_VERT,
      fragmentShader: DENSITY_FRAG,
      blending: THREE.AdditiveBlending,   // the whole point: overlapping grains SUM
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    const densityScene = new THREE.Scene()
    const densityPoints = new THREE.Points(geometry, densityMat)
    densityPoints.frustumCulled = false   // the shader writes gl_Position directly; three's bounds are meaningless here
    densityScene.add(densityPoints)

    const pointsMat = new THREE.ShaderMaterial({
      uniforms: {
        uPositionTexture: { value: posA.texture },
        uVelocityTexture: { value: velA.texture },
        uGlow: { value: GLOW },   // constant; nothing writes this after construction
        uBassImpulse: { value: 0 },

        uKeyDir: { value: v3(KEY_DIR) },
        uKeyColor: { value: rgb(KEY_COLOR) },
        uKeyI: { value: KEY_I },
        uFillDir: { value: v3(FILL_DIR) },
        uFillColor: { value: rgb(FILL_COLOR) },
        uFillI: { value: FILL_I },
        uRimColor: { value: rgb(RIM_COLOR) },
        uRimI: { value: RIM_I },
        // A grain is a couple of device pixels across. 65k of them over a ~600px figure means a bare
        // patch is genuinely sparse, while a nodal pile covers its ground completely — which is what
        // makes a line read as solid: coverage, not summed light.
        uSize: { value: 0.006 },
        uSizeScale: { value: 1000 }, // real value set by resize()
        // Render-only idle shimmer (see IDLE SHIMMER in POINTS_VERT). Driven from the look object each frame;
        // all zero except on ChladniTones' idle plate, so the music render path is byte-identical.
        uTime: { value: 0 },
        uShimmerAmp: { value: 0 },
        uShimmerSpeed: { value: 0 },
        uShimmerEnv: { value: 0 },
        // Render-only tone dissolve (see TONE DISSOLVE in POINTS_VERT). uDissolveTex is the figure snapshot;
        // the rest come from the look object each frame and are 0/off except during a turn-off dissolve, so the
        // music and steady-tone render paths are byte-identical.
        uDissolveTex: { value: snapshotTarget.texture },
        uDissolveOn: { value: 0 },
        uDissolveProgress: { value: 0 },
        uDissolveJitter: { value: 0 },
      },
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      // NormalBlending + depthWrite. A grain in front HIDES the grain behind it, so a pile has a
      // surface and a silhouette instead of just getting brighter — additive blending is what makes
      // particle systems look like energy instead of matter, and this is matter. The glow comes from
      // the emissive term and the bloom, not from summing luminance.
      //
      // transparent:true only because the fragment shader feathers the last 15% of each grain's
      // radius for antialiasing; the interior is fully opaque and depth still does the occlusion, so
      // the lack of a back-to-front sort (impossible at 65k points) costs nothing but the edge pixels.
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: true,
      depthTest: true,
    })

    const points = new THREE.Points(geometry, pointsMat)
    points.frustumCulled = false
    scene.add(points)

    // —— INK WISPS (render-only; see INK WISPS constants). A full-res source target (grains splatted by
    // speed through the display camera) feeds a persistent buffer that advects + decays + blurs. wispState
    // holds the running buffer; wispScratch is the advect output the blur reads. Half-float + linear so the
    // advect's bilinear fetch and the blur are smooth; sized to the drawing buffer in resize().
    const makeWispTarget = () => new THREE.WebGLRenderTarget(2, 2, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    })
    const wispSource = makeWispTarget()
    const wispState = makeWispTarget()   // persistent running buffer (advect reads it, blur writes it)
    const wispScratch = makeWispTarget() // advect output that the blur reads

    const wispSourceMat = new THREE.ShaderMaterial({
      uniforms: {
        uPositionTexture: { value: posA.texture },
        uVelocityTexture: { value: velA.texture },
        uSize: { value: 0.006 },        // matches the grain diameter
        uSizeScale: { value: 1000 },    // real value set by resize()
      },
      vertexShader: WISP_SOURCE_VERT,
      fragmentShader: WISP_SOURCE_FRAG,
      blending: THREE.AdditiveBlending,  // thrown grains SUM into threads
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    const wispPoints = new THREE.Points(geometry, wispSourceMat)
    wispPoints.frustumCulled = false
    const wispScene = new THREE.Scene()
    wispScene.add(wispPoints)

    const wispSimMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrev: { value: null }, uSource: { value: wispSource.texture },
        uDt: { value: 0 }, uAspect: { value: 1 }, uTime: { value: 0 },
        uWispEmit: { value: WISP_EMIT },
      },
      vertexShader: QUAD_VERT,
      fragmentShader: WISP_SIM_FRAG,
      depthTest: false, depthWrite: false,
    })
    const wispBlurMat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: null }, uTexel: { value: new THREE.Vector2(0.5, 0.5) } },
      vertexShader: QUAD_VERT,
      fragmentShader: WISP_BLUR_FRAG,
      depthTest: false, depthWrite: false,
    })
    // —— Post. Bloom is fixed at construction (see BLOOM_* — it is hand-tuned against the figure's
    // readability, not derived from GLOW). Only strength moves at runtime, and only with the live
    // audio, so the plate breathes without the gaps ever filling in.
    const composer = new EffectComposer(renderer)
    composer.setPixelRatio(pr)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(256, 256), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD,
    )
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    // Ink composite, last in the chain (after sRGB output), and ALWAYS enabled — the whole look is black-on-
    // white now, so there is no "raw" path. L switches its uniforms between the plain default and Arrival (see
    // the frame loop). If the FPS guard sheds bloom it only disables the BLOOM pass, so the frame still runs
    // RenderPass → OutputPass → ink and the picture stays black-on-white (just without the glow aura).
    const inkPass = new ShaderPass(InkShader)
    composer.addPass(inkPass)

    // The two ink settings L toggles between. Precomputed so the frame loop only swaps uniform references.
    // Plain (L off): flat white fog, black ink, no haze/atmos/wisps/veil — the original CSS-invert look.
    // Arrival (L on): the tuned fog colours (the other Arrival knobs are applied live in the frame loop).
    const WHITE_VEC = new THREE.Vector3(1, 1, 1)
    const BLACK_VEC = new THREE.Vector3(0, 0, 0)
    // Host-supplied matte colours (raw sRGB 0..1), rewritten each frame from look.colors when the host drives
    // them (no allocation — just .set), so a theme toggle is live. Reused references, like the fog vecs above.
    const hostBgVec = new THREE.Vector3()
    const hostInkVec = new THREE.Vector3()
    const FOG_CENTER_VEC = srgbVec(FOG_CENTER)
    const FOG_EDGE_VEC = srgbVec(FOG_EDGE)
    const INK_VEC = srgbVec(INK)

    // —— NODAL-LINE OVERLAY (O key). Thin lines of the dominant mode's theoretical nodal set, in a scene of
    // their own so they can be drawn AFTER the composite (autoClear off) — on top of the sand, not through
    // bloom or the ink invert. Geometry is rebuilt only when the dominant mode changes (see the frame loop).
    const overlayScene = new THREE.Scene()
    const overlayMat = new THREE.LineBasicMaterial({ color: 0xff7828, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false })
    const overlayGeo = new THREE.BufferGeometry()
    overlayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3))
    const overlayLines = new THREE.LineSegments(overlayGeo, overlayMat)
    overlayLines.frustumCulled = false
    overlayScene.add(overlayLines)

    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'
    host.appendChild(renderer.domElement)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      composer?.setSize(w, h)
      inkPass.uniforms.uAspect.value = w / h
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // Grain size is a world diameter; this is the factor that projects it to device pixels at
      // depth 1. Recomputed here because it depends on the drawing-buffer height.
      const fovRad = (camera.fov * Math.PI) / 180
      const sizeScale = (h * pr) / (2 * Math.tan(fovRad / 2))
      pointsMat.uniforms.uSizeScale.value = sizeScale
      // Wisp buffers track the drawing buffer (full-res). The source is rendered through the same camera,
      // so its splats need the same world→pixel scale as the grains.
      const dw = Math.max(1, Math.round(w * pr))
      const dh = Math.max(1, Math.round(h * pr))
      wispSource.setSize(dw, dh)
      wispState.setSize(dw, dh)
      wispScratch.setSize(dw, dh)
      wispSourceMat.uniforms.uSizeScale.value = sizeScale
      wispSimMat.uniforms.uAspect.value = w / h
      wispBlurMat.uniforms.uTexel.value.set(1 / dw, 1 / dh)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const st = {
      time: 0,
      audio: 0,     // live-audio blend 0↔1, smoothed so play/pause never pops
      amp: 0,       // overall amplitude
      bass: 0, mids: 0, highs: 0,   // audio bands, written by the driver each frame (were frame locals)
      ambient: 0,   // paused-tremble depth, written by the driver each frame (was featRef f.ambient)
      toneActive: 0,  // active tone frequency (0 = music); written by the driver (was the `tone` local)
      still: 0,       // 1 only on the undriven idle plate (tone mode, no tone selected); written by the driver
      spreadGain: 1,  // density-spreading multiplier; written by the driver (1 except during a tone-off SPREAD)
      velScale: 1,    // final velocity scale; written by the driver (1 except easing a SPREAD into stillness)
      // sandFresh: is the position texture an untouched fresh sprinkle? True after a re-sprinkle; false the
      // moment the physics moves grains (any non-still step). Lets the wrapper decide whether a tone click from
      // idle may skip the re-sprinkle (only when fresh) — the fix for leftover-figure sand becoming the next
      // figure's start. The initial spawn IS a fresh sprinkle.
      sandFresh: true,
      prevBass: 0,
      freq: null,
      modeAmp: ampArray,
      rawAmp: new Float32Array(MODE_COUNT),
      targetAmp: new Float32Array(MODE_COUNT),
      dist: new Float32Array(MODE_COUNT),
      driveLevel: 0,
      levelAvgLog: -1,
      rawSum: 0,
      inSet: new Uint8Array(MODE_COUNT),
      fieldChange: 0,
      aboveFloor: 0,
      impulse: 0,
      frozen: false,          // F debug freeze (set via setFrozen)
      releaseOn: RELEASE_ON,  // K: asymmetric music-mode smoothing on/off (set via setRelease); on by default
      releaseTau: RELEASE_TAU, // falling-edge time constant when releaseOn (H/J step it; set via setReleaseTau)
      overlay: false,         // O overlay (set via setOverlay)
      overlayModeIdx: -1,
      resprinklePending: false, // a one-shot re-sprinkle queued (set via resprinkle())
      resprinkleMix: 0,       // fraction of grains to re-spawn on the pending re-sprinkle (0..1)
      resprinkleSeed: 0,      // random seed for the pending re-sprinkle, so successive ones pick different grains
      posRead: posA, posWrite: posB, velRead: velA, velWrite: velB,
      frames: 0, fpsAcc: 0, fpsN: 0, bloomOn: true,
      logAcc: 0, logN: 0,
      trackId: null,
      winCount: new Float64Array(MODE_COUNT), winFrames: 0, histAcc: 0,
    }
    this.st = st

    // —— DEV-ONLY CLARITY STATS (?stats=1; see collectStats/logStats below). All of it is gated on this
    // flag — when it is false the step loop never touches any of this and the engine is byte-for-byte the
    // non-stats build. Measurement only: it reads driveLevel / the mode distribution / grain positions and
    // records them, and never writes a uniform, a target or st. Enabled via the `stats` constructor option
    // (the wrapper passes ?stats=1); U (wrapper key) calls logStats() to dump a bucketed summary.
    this.statsEnabled = !!stats
    const stats_ = this.statsEnabled ? {
      samples: [],             // one record per elapsed second: {drive, top1, top2, switches, crisp}
      acc: 0,                  // seconds accumulated toward the next sample
      switches: 0,             // top-1 index changes counted in the current second
      lastTop1: -1,            // top-1 mode index on the previous frame (-1 = none/silent)
      top1Time: new Float64Array(MODE_COUNT),  // per-mode seconds spent as top-1 (true dt accumulation)
      everTop1: new Uint8Array(MODE_COUNT),    // 1 once a mode has ever been the frame top-1
      // Readback scratch: the whole 256×256 position target in one GL call, strided on the CPU. Only
      // allocated/used when full-float targets are readable (half-float readback would need a manual
      // decode); crispness is reported as null otherwise so the rest of the summary still stands.
      canRead: canFloat,
      posBuf: canFloat ? new Float32Array(TEX * TEX * 4) : null,
      stride: Math.max(1, Math.floor(PARTICLE_COUNT / 4096)),  // sample ~4k grains for crispness
      lut: new Float32Array(256),  // per-mode radial lookup scratch (rebuilt per active mode each sample)
    } : null
    this.resize = resize

    // —— STATS: crispness. mean |W|/W_peak over a strided sample of the LIVE grain positions, where W is
    // the summed displacement field (the SAME field fieldAt evaluates in the shader) and W_peak ≈ driveLevel
    // (exactly the normaliser the shader's amplitude hop uses, see wNorm in VELOCITY_FRAG). Low ⇒ the sand
    // sits on the nodal lines (|W| ≈ 0 there) ⇒ a clean figure; high ⇒ sand spread across the antinodes.
    // Positions come from one readback of the posRead target (fresh after the frame's swap); the field is
    // evaluated on the CPU via a per-active-mode radial LUT (only modes with amp ≥ 1e-4, as fieldAt skips
    // the rest). Returns null when the target can't be read as float (half-float fallback), so the summary's
    // other metrics still stand. Pure measurement — nothing here writes st, a uniform or a target.
    const computeCrispness = () => {
      if (!stats_.canRead) return null
      renderer.readRenderTargetPixels(st.posRead, 0, 0, TEX, TEX, stats_.posBuf)
      const buf = stats_.posBuf
      const LUTN = stats_.lut.length
      const active = []
      for (let i = 0; i < MODE_COUNT; i++) {
        const amp = st.modeAmp[i]
        if (amp < 1e-4) continue
        const { n, lambda: lam, c, phi } = MODES[i]
        const lut = new Float32Array(LUTN)
        for (let k = 0; k < LUTN; k++) { const r = k / (LUTN - 1); lut[k] = besselJ(n, lam * r) + c * besselI(n, lam * r) }
        active.push({ n, phi, amp, lut })
      }
      const peak = Math.max(st.driveLevel, 1e-3)
      let sum = 0, cnt = 0
      for (let p = 0; p < PARTICLE_COUNT; p += stats_.stride) {
        const b = p * 4
        const px = buf[b] / FIELD_R, pz = buf[b + 2] / FIELD_R
        const rr = Math.hypot(px, pz)
        const r = Math.min(rr, 1.0)                              // fieldAt clamps the radius to the rim
        const th = rr > 1e-4 ? Math.atan2(pz, px) : 0.0
        const li = Math.min(LUTN - 1, Math.round(r * (LUTN - 1)))
        let w = 0
        for (let a = 0; a < active.length; a++) { const m = active[a]; w += m.lut[li] * Math.cos(m.n * th + m.phi) * m.amp }
        sum += Math.abs(w) / peak
        cnt++
      }
      return cnt > 0 ? sum / cnt : 0
    }

    // —— STATS: per-frame tracking + a one-second sample. Top-1 = the largest smoothed distribution share
    // (the same dominant mode the O overlay picks). Every frame it accumulates each mode's time-as-top-1 and
    // counts top-1 switches; once a second it records {driveLevel, top1 share, top2 share, switches that
    // second, crispness}. logStats() buckets those by driveLevel. Only called while statsEnabled.
    const collectStats = (dt) => {
      let top1 = -1, top2 = -1, v1 = 1e-9, v2 = 0
      for (let i = 0; i < MODE_COUNT; i++) {
        const d = st.dist[i]
        if (d > v1) { v2 = v1; top2 = top1; v1 = d; top1 = i }
        else if (d > v2) { v2 = d; top2 = i }
      }
      // Count a switch only between two real (non-silent) frames, so sliding in/out of silence isn't logged
      // as churn; the first frame (lastTop1 = -1) seeds the state without counting.
      if (top1 !== stats_.lastTop1 && stats_.lastTop1 !== -1 && top1 !== -1) stats_.switches++
      stats_.lastTop1 = top1
      if (top1 >= 0) { stats_.top1Time[top1] += dt; stats_.everTop1[top1] = 1 }

      stats_.acc += dt
      if (stats_.acc < 1.0) return
      stats_.acc -= 1.0
      let dsum = 0
      for (let i = 0; i < MODE_COUNT; i++) dsum += st.dist[i]
      const inv = dsum > 1e-9 ? 1 / dsum : 0
      // Active-mode count: modes above 10% of the current max field amplitude (same measure as the FPS log).
      // This is the mush gauge — a clean figure is a handful, a mushy one is 25–35 ringing faintly at once.
      let maxAmp = 0
      for (let i = 0; i < MODE_COUNT; i++) if (st.modeAmp[i] > maxAmp) maxAmp = st.modeAmp[i]
      let active = 0
      if (maxAmp > 1e-9) for (let i = 0; i < MODE_COUNT; i++) if (st.modeAmp[i] > 0.1 * maxAmp) active++
      stats_.samples.push({
        drive: st.driveLevel,
        top1: top1 >= 0 ? v1 * inv : 0,
        top2: top2 >= 0 ? v2 * inv : 0,
        active,
        switches: stats_.switches,
        crisp: computeCrispness(),
      })
      stats_.switches = 0
    }

    this.step = (dt, { driver, look }) => {
      st.time += dt
      const levelTarget = driver(st, dt)

      // —— RE-SPRINKLE (one-shot; queued by resprinkle(), tone mode only — the wrapper only calls it on a
      // tone change). Re-spawn a MIX fraction of grains as a fresh load BEFORE the frame reads posRead, so
      // density/sim/draw all see the re-sprinkled state. Build a full fresh spawn on the CPU (reusing the
      // spawn code path), upload it, then the selector picks fresh-vs-current per grain — same mix + seed
      // for the pos and vel pass, so a chosen grain is re-spawned in both (new position+phase, zero velocity,
      // new mass). A single GPU pass over every grain, so it is frame-rate independent.
      if (st.resprinklePending) {
        fillSpawn(resprinklePos, resprinkleVel)
        freshPosTex.needsUpdate = true
        freshVelTex.needsUpdate = true
        resprinkleMat.uniforms.uMix.value = st.resprinkleMix
        resprinkleMat.uniforms.uSeed.value = st.resprinkleSeed
        resprinkleMat.uniforms.uCurrent.value = st.posRead.texture
        resprinkleMat.uniforms.uFresh.value = freshPosTex
        blit(resprinkleMat, st.posWrite)
        resprinkleMat.uniforms.uCurrent.value = st.velRead.texture
        resprinkleMat.uniforms.uFresh.value = freshVelTex
        blit(resprinkleMat, st.velWrite)
        let tp = st.posRead; st.posRead = st.posWrite; st.posWrite = tp
        let tv = st.velRead; st.velRead = st.velWrite; st.velWrite = tv
        st.resprinklePending = false
        st.sandFresh = true   // the grains are now an untouched fresh sprinkle
      }

      // Freshness: any frame the physics actually runs (uStill off) moves grains, so the sprinkle is no longer
      // pristine. An idle (still) frame leaves it unchanged — a re-sprinkle followed by still frames stays fresh.
      if (!st.still) st.sandFresh = false

      // —— TWO-RATE SMOOTHING. SHAPE and INTENSITY need different time constants.
      //   SHAPE (slow, SMOOTH_TAU): the distribution — which modes are active. Sand takes 1–2 s to cross
      //   a cell, so the figure's identity must change slowly. deltaSum tracks the distribution's motion
      //   (how fast the figure is reorganising) → uFieldChange, so the hop/seek respond to SHAPE changes,
      //   not intensity pulses.
      //   INTENSITY (fast, DRIVE_TAU): the overall level — how hard the plate is driven, and how
      //   violently the sand reacts — reacts within a few frames.
      // Debug freeze (F): alpha 0 pins st.dist at its current value — the distribution stops following
      // targetAmp entirely, so the figure's shape is held. Only the shape is frozen; the drive level
      // (st.driveLevel below), the sand physics and the render all keep running off the live audio.
      //   Rate: MUSIC rises on SMOOTH_TAU. Its FALLING edge is ASYMMETRIC when release smoothing is on (K):
      //   dropping weights relax on st.releaseTau instead, so a mode that just lost its energy clears rather
      //   than lingering ~SMOOTH_TAU as a ghost while the next winner piles on (that pile-up is the mush —
      //   25–35 faint modes at once instead of a few sharp ones). releaseOn off, or releaseTau == SMOOTH_TAU
      //   (the default), makes the fall rate equal the rise rate → byte-identical to the old symmetric path.
      //   TONE mode uses the plate's PHYSICAL per-mode ring-down TONE_TAU[i] = TONE_Q/(π·f_i) (see tone.js)
      //   — high modes snap in, low modes linger — and is UNTOUCHED by release (it is the music path only).
      const riseScalar = st.frozen ? 0 : 1 - Math.exp(-dt / SMOOTH_TAU)
      const fallScalar = (st.frozen || !st.releaseOn) ? riseScalar : 1 - Math.exp(-dt / st.releaseTau)
      let distSum = 0, deltaSum = 0
      for (let i = 0; i < MODE_COUNT; i++) {
        const prev = st.dist[i]
        const target = st.targetAmp[i]
        // MUSIC: rising edge on SMOOTH_TAU, falling edge on the release rate (equal unless K + a tuned tau).
        // TONE: the per-mode physical ring-down. FROZEN: pinned (alpha 0, via rise/fallScalar both 0).
        const alpha = st.frozen ? 0
          : st.toneActive ? 1 - Math.exp(-dt / TONE_TAU[i])
          : (target >= prev ? riseScalar : fallScalar)
        const next = prev + (target - prev) * alpha
        deltaSum += Math.abs(next - prev)
        st.dist[i] = next
        distSum += next
      }
      st.driveLevel += (levelTarget - st.driveLevel) * (1 - Math.exp(-dt / DRIVE_TAU))

      // Floor: zero the smoothing's residual tail. A mode TOP_K dropped decays exponentially and never
      // reaches zero, so without this the distribution carries a dozen ghost modes below the winners. Cut
      // anything under DIST_FLOOR × the max share; distSum is then recomputed over the survivors so the
      // unit-normalisation below renormalises to the kept modes alone. Skipped for a tone (DIST_FLOOR is
      // part of the music pipeline the tone bypasses): keep every weighted mode, and the distSum from the
      // smoothing loop above stands.
      if (!st.toneActive) {
        let distMax = 0
        for (let i = 0; i < MODE_COUNT; i++) if (st.dist[i] > distMax) distMax = st.dist[i]
        const floor = distMax * DIST_FLOOR
        let aboveFloor = 0
        distSum = 0
        for (let i = 0; i < MODE_COUNT; i++) {
          if (st.dist[i] < floor) st.dist[i] = 0
          else { distSum += st.dist[i]; aboveFloor++ }
        }
        st.aboveFloor = aboveFloor   // diagnostic: modes surviving the floor (the real active count)
      } else {
        st.aboveFloor = MODE_COUNT
      }

      // Recombine: unit-normalise the smoothed distribution, scale by the fast drive level, and divide by
      // each mode's peak so |displacement| stays on a fixed scale (peaks solved numerically in solveModes).
      const invDist = distSum > 1e-9 ? 1 / distSum : 0
      for (let i = 0; i < MODE_COUNT; i++) {
        st.modeAmp[i] = st.dist[i] * invDist * st.driveLevel / MODES[i].peak   // st.modeAmp IS the uAmp uniform
      }

      const changeRate = Math.min(1, deltaSum / Math.max(dt, 1e-3))
      st.fieldChange += (changeRate - st.fieldChange) * (1 - Math.exp(-dt / 0.15))  // light smoothing

      // — bass transients → the plate gets hit (a rising edge, not every loud frame).
      if (st.audio > 0.1 && st.bass > BASS_ONSET && st.bass - st.prevBass > BASS_JUMP) {
        st.impulse = 1
      }
      st.prevBass = st.bass
      st.impulse *= Math.pow(0.9, dt * 60)

      // — the field. uModes is the shared backing array whose .w values were just written above, so
      // both simulation passes already see the new amplitudes. uFieldChange lives on the velocity pass
      // alone (the position pass only samples the field for pile height, and doesn't hop).
      velocityMat.uniforms.uFieldChange.value = st.fieldChange

      // — DENSITY first, from the positions the velocity pass is about to read. It must be rebuilt
      // every frame and it must NOT accumulate across frames: this is a snapshot of where the sand is
      // right now, and a running total would be a heat map of everywhere it has ever been — the
      // repulsion would then push grains out of regions that emptied minutes ago.
      //
      // Cleared to BLACK explicitly, not to the renderer's clear colour. That colour is the panel's
      // near-black #0a0a0a, whose red channel is 0.039 — a uniform density floor across the whole
      // plate. It would cancel out of the gradient and do no harm, but it is the kind of thing that
      // stops being harmless the moment anyone reads the raw density value instead of its gradient.
      densityMat.uniforms.uPositionTexture.value = st.posRead.texture
      renderer.setClearColor(0x000000, 1)
      renderer.setRenderTarget(densityTarget)
      renderer.render(densityScene, quadCamera)
      renderer.setRenderTarget(null)
      renderer.setClearColor(BG, 1)

      // — simulate. Velocity first: the position pass integrates the velocity written this frame.
      const vu = velocityMat.uniforms
      vu.uTime.value = st.time
      vu.uDeltaTime.value = dt
      vu.uBass.value = st.bass
      vu.uMids.value = st.mids
      vu.uHighs.value = st.highs
      vu.uAmplitude.value = st.driveLevel   // fast-smoothed overall drive level (DRIVE_TAU) — the intensity
      vu.uBassImpulse.value = st.impulse
      vu.uAmbient.value = st.ambient
      vu.uIdle.value = 1 - st.audio
      vu.uToneActive.value = st.toneActive ? 1 : 0   // amplitude hop runs only while a tone drives the plate
      vu.uStill.value = st.still ? 1 : 0             // undriven idle plate: no agitation, spreading or rim drift
      vu.uSpreadGain.value = st.spreadGain           // boosted during a tone-off SPREAD; 1 otherwise
      vu.uVelScale.value = st.velScale               // ramps 1→0 to ease a SPREAD into stillness; 1 otherwise
      vu.uPositionTexture.value = st.posRead.texture
      vu.uVelocityTexture.value = st.velRead.texture
      blit(velocityMat, st.velWrite)

      const pu = positionMat.uniforms
      pu.uDeltaTime.value = dt
      pu.uStill.value = st.still ? 1 : 0   // flat sand when undriven (no nodal pile to rest on)
      pu.uPositionTexture.value = st.posRead.texture
      pu.uVelocityTexture.value = st.velWrite.texture // fresh velocity, not last frame's
      blit(positionMat, st.posWrite)

      // — draw from the textures we just wrote, then swap.
      pointsMat.uniforms.uPositionTexture.value = st.posWrite.texture
      pointsMat.uniforms.uVelocityTexture.value = st.velWrite.texture
      pointsMat.uniforms.uBassImpulse.value = st.impulse
      // Render-only idle shimmer (look.shimmer*; absent ⇒ 0, so music is byte-identical).
      pointsMat.uniforms.uTime.value = st.time
      pointsMat.uniforms.uShimmerAmp.value = look.shimmerAmp || 0
      pointsMat.uniforms.uShimmerSpeed.value = look.shimmerSpeed || 0
      pointsMat.uniforms.uShimmerEnv.value = look.shimmerEnv || 0
      pointsMat.uniforms.uDissolveOn.value = look.dissolveOn || 0
      pointsMat.uniforms.uDissolveProgress.value = look.dissolveProgress || 0
      pointsMat.uniforms.uDissolveJitter.value = look.dissolveJitter || 0

      // — INK WISPS (render-only). Splat the moving grains (same freshly-written pos/vel the sand draws
      // from), then advect + decay + blur the buffer. Runs only while ink mode AND wisps are on and the
      // composer (which hosts the ink pass) is live — otherwise there is nothing to composite into. Never
      // touches the pos/vel textures, so the simulation is unaffected whether this runs or not.
      const wispActive = look.arrival && look.wisp && st.bloomOn && !!composer
      if (wispActive) {
        const wdt = Math.min(dt, WISP_DT_CLAMP)   // real seconds, capped so a backgrounded tab can't wipe it
        // Source: splat through the display camera into a black-cleared full-res target (additive).
        wispSourceMat.uniforms.uPositionTexture.value = st.posWrite.texture
        wispSourceMat.uniforms.uVelocityTexture.value = st.velWrite.texture
        renderer.setClearColor(0x000000, 1)
        renderer.setRenderTarget(wispSource)
        renderer.render(wispScene, camera)
        renderer.setRenderTarget(null)
        renderer.setClearColor(BG, 1)
        // Advect prev + decay + add source → scratch, then a 1px blur → state (the persistent buffer).
        wispSimMat.uniforms.uPrev.value = wispState.texture
        wispSimMat.uniforms.uDt.value = wdt
        wispSimMat.uniforms.uTime.value = st.time
        wispSimMat.uniforms.uWispEmit.value = look.wispEmit
        blit(wispSimMat, wispScratch)
        wispBlurMat.uniforms.uTex.value = wispScratch.texture
        blit(wispBlurMat, wispState)
      }
      inkPass.uniforms.uWisp.value = wispState.texture
      inkPass.uniforms.uWispOn.value = wispActive ? 1 : 0

      let t = st.posRead; st.posRead = st.posWrite; st.posWrite = t
      t = st.velRead; st.velRead = st.velWrite; st.velWrite = t

      // — bloom BREATHES with the live audio, and FLASHES on the kick. Threshold and radius are still
      // fixed at construction; strength is the only bloom value that moves.
      //
      // Two separate terms, doing two different jobs. The amplitude term is the breath: small, sustained,
      // never enough to close the gaps between the nodal lines on a loud bar. The impulse term is the
      // flash: large, and gone in a tenth of a second (see BLOOM_PULSE).
      //
      // It rides st.impulse — the SAME decaying transient that drives the hop and the grains' emissive —
      // rather than a second envelope of its own. A parallel one with its own decay would be two sources
      // of truth for a single physical event, free to drift apart, and the kick has to land as ONE thing:
      // the sand jumps, the grains go white-hot and the glow blooms on the same frame, or it reads as
      // three effects that happen to be near each other rather than as an impact.
      bloom.strength = BLOOM_STRENGTH + 0.06 * st.amp * st.audio + BLOOM_PULSE * st.impulse

      // INK COMPOSITE (always on). It inverts/desaturates the tone-mapped sRGB frame — the black backdrop
      // goes white, the grains go dark, the white bloom halo flips to a soft dark haze. L (st.inkMode)
      // switches between two uniform sets: PLAIN (white fog, black ink, no haze/atmos/wisps/veil — the
      // original CSS-invert look) and ARRIVAL (the tuned fog colours + the live haze/atmos/wisp/veil knobs).
      const arrival = look.arrival
      const colors = look.colors   // { bg:[r,g,b], ink:[r,g,b] } raw sRGB 0..1, or undefined for the default look
      inkPass.uniforms.uTime.value = st.time
      if (colors) {
        // —— HOST-COLOURED MATTE. Same plain composite, but the fog is a FLAT host bg (no gradient/vignette,
        // so no box edge) and the ink is the host's sand colour: out = mix(bg, ink, coverage). coverage comes
        // from the scene luma exactly as in plain, and the scene is cleared to BLACK below so an empty pixel
        // has coverage 0 → it resolves to EXACTLY bg (the matte, indistinguishable from the host surface). The
        // bloom aura rides the same mix (it is extra coverage in the scene), so a light ink on a dark bg glows
        // lighter, a dark ink on a light bg darkens — never an invisible wrong-way halo.
        hostBgVec.set(colors.bg[0], colors.bg[1], colors.bg[2])
        hostInkVec.set(colors.ink[0], colors.ink[1], colors.ink[2])
        inkPass.uniforms.uFogCenter.value = hostBgVec
        inkPass.uniforms.uFogEdge.value = hostBgVec
        inkPass.uniforms.uInk.value = hostInkVec
        inkPass.uniforms.uInkGamma.value = 1.0
        inkPass.uniforms.uHazeAmp.value = 0.0
        inkPass.uniforms.uAtmos.value = 0.0
        inkPass.uniforms.uAtmosOn.value = 0
        inkPass.uniforms.uVeilOn.value = 0
      } else {
        inkPass.uniforms.uFogCenter.value = arrival ? FOG_CENTER_VEC : WHITE_VEC
        inkPass.uniforms.uFogEdge.value = arrival ? FOG_EDGE_VEC : WHITE_VEC
        inkPass.uniforms.uInk.value = arrival ? INK_VEC : BLACK_VEC
        inkPass.uniforms.uInkGamma.value = arrival ? look.inkGamma : 1.0
        inkPass.uniforms.uHazeAmp.value = arrival ? HAZE_AMP : 0.0
        inkPass.uniforms.uAtmos.value = arrival ? look.atmos : 0.0
        inkPass.uniforms.uAtmosOn.value = arrival ? 1 : 0
        inkPass.uniforms.uVeilOn.value = (arrival && look.veil) ? 1 : 0
      }
      inkPass.uniforms.uVeilAmt.value = look.veilAmt

      // Scene backdrop for the RenderPass: the host-matte path clears to BLACK (so an empty pixel's coverage is
      // exactly 0 and the composite resolves it to exactly bg); the default look keeps the near-black panel BG.
      renderer.setClearColor(colors ? 0x000000 : BG, 1)

      // Always through the composer: the ink pass must run in BOTH modes, so there is no raw-renderer path.
      // When the FPS guard has shed bloom, that pass is disabled (not removed), so the composer still does
      // RenderPass → OutputPass → ink and the frame stays black-on-white — just without the glow aura.
      composer.render()

      // —— NODAL-LINE OVERLAY (O). Dominant mode = the largest smoothed distribution share (which is also
      // the largest field contribution, since the per-mode peak cancels in the recombine). Rebuild the line
      // geometry only when that index changes, then draw it over the composited frame (autoClear off) so it
      // sits on top of the sand without passing through bloom or the ink invert.
      if (st.overlay) {
        let dom = -1, domVal = 1e-6
        for (let i = 0; i < MODE_COUNT; i++) if (st.dist[i] > domVal) { domVal = st.dist[i]; dom = i }
        if (dom >= 0 && dom !== st.overlayModeIdx) {
          overlayGeo.setAttribute('position', new THREE.BufferAttribute(nodalLineSegments(MODES[dom]), 3))
          st.overlayModeIdx = dom
          console.log(`[chladni] nodal overlay: dominant mode #${dom} n=${MODES[dom].n} m=${MODES[dom].m} ${Math.round(MODES[dom].freq)}Hz`)
        }
        if (st.overlayModeIdx >= 0) {
          renderer.autoClear = false
          renderer.render(overlayScene, camera)
          renderer.autoClear = true
        }
      }

      // FPS guard: past the warmup, average ~1.5s windows; a sustained miss of the 50fps budget disables
      // the bloom pass permanently (the ink composite keeps running — see above — so the look is preserved).
      st.frames++
      if (st.bloomOn && st.frames > 40) {
        st.fpsAcc += dt
        st.fpsN++
        if (st.fpsN >= 90) {
          if (st.fpsN / st.fpsAcc < 50) {
            st.bloomOn = false
            bloom.enabled = false   // shed the expensive pass but KEEP the composer so ink still runs
          }
          st.fpsAcc = 0
          st.fpsN = 0
        }
      }

      // Average FPS to the console every ~3s — the forced plate is ~10× the Bessel work, so this is
      // how we see whether it holds frame rate before deciding to add a field-to-texture pass.
      st.logAcc += dt
      st.logN++
      if (st.logAcc >= 3) {
        // Effective active mode count: how many modes are above 10% of the current max amplitude.
        let maxAmp = 0
        for (let i = 0; i < MODE_COUNT; i++) if (st.modeAmp[i] > maxAmp) maxAmp = st.modeAmp[i]
        let active = 0
        if (maxAmp > 1e-9) for (let i = 0; i < MODE_COUNT; i++) if (st.modeAmp[i] > 0.1 * maxAmp) active++
        // Current winners: modes in the set, sorted by their smoothed distribution share (unit-sum).
        let ds = 0
        for (let i = 0; i < MODE_COUNT; i++) ds += st.dist[i]
        const inv = ds > 1e-9 ? 1 / ds : 0
        const winners = []
        for (let i = 0; i < MODE_COUNT; i++) if (st.inSet[i]) winners.push(i)
        winners.sort((a, b) => st.dist[b] - st.dist[a])
        const wStr = winners.map((i) => `[#${i} n=${MODES[i].n} m=${MODES[i].m} ${Math.round(MODES[i].freq)}Hz ${(st.dist[i] * inv).toFixed(2)}]`).join(' ')
        console.log(`[chladni] avg FPS: ${(st.logN / st.logAcc).toFixed(1)} (${MODE_COUNT} modes, ${active} active >10% of max, ${st.aboveFloor} above floor, bloom ${st.bloomOn ? 'on' : 'off'}) rawSum=${st.rawSum.toExponential(2)} logRaw=${Math.log(st.rawSum + 1).toFixed(2)} levelAvgLog=${st.levelAvgLog.toFixed(2)} driveLevel=${st.driveLevel.toFixed(2)} winners: ${wStr}`)
        st.logAcc = 0
        st.logN = 0
      }

      // Cumulative mode-win histogram every ~15s — the real diagnostic: do the same few modes dominate
      // across every track, or do the winners genuinely vary? Counts are since page load (never reset);
      // percentage is of live frames. Only modes above 1% are printed, sorted by frequency of winning.
      st.histAcc += dt
      if (st.histAcc >= 15) {
        st.histAcc = 0
        if (st.winFrames > 0) {
          const rows = []
          for (let i = 0; i < MODE_COUNT; i++) {
            const pct = (st.winCount[i] / st.winFrames) * 100
            if (pct > 1) rows.push({ i, pct })
          }
          rows.sort((a, b) => b.pct - a.pct)
          const hStr = rows.map((r) => `#${r.i} n=${MODES[r.i].n} m=${MODES[r.i].m} ${Math.round(MODES[r.i].freq)}Hz ${r.pct.toFixed(1)}%`).join('  ')
          console.log(`[chladni] mode histogram (${st.winFrames} live frames): ${hStr}`)
        }
      }

      // —— DEV STATS (?stats=1). Last in the frame so posRead is the just-written, just-drawn positions.
      // Gated entirely on the flag: no stats, no cost. Measurement only (see the DEV-ONLY CLARITY STATS note).
      if (stats_) collectStats(dt)
    }

    // —— DEV STATS summary (?stats=1; triggered by U in the wrapper). Reports the overall mean active-mode
    // count, then the one-second samples two ways: bucketed by driveLevel thirds (quiet/medium/loud), and
    // bucketed by active-mode count (≤5 / 6–15 / 16+ modes >10% of max — the clean-vs-mushy split). Each row
    // gives mean top-1 / top-2 share, their gap, mean active count, switches/second and crispness. Then: how
    // many modes ever reached top-1, and the 10 that spent the most time there. Pure read; changes nothing.
    this.logStats = () => {
      if (!this.statsEnabled) return
      const s = stats_.samples
      if (s.length === 0) { console.log('[chladni:stats] no samples yet — run with ?stats=1 for ≥1s'); return }
      const n = s.length
      const mean = (arr, f) => (arr.length ? arr.reduce((a, x) => a + f(x), 0) / arr.length : NaN)
      const meanCrisp = (arr) => { const v = arr.filter((x) => x.crisp != null); return v.length ? v.reduce((a, x) => a + x.crisp, 0) / v.length : null }
      // One row of means for a bucket's samples — top1/top2 share and their gap, the mush gauge (active
      // modes >10% of max), switches/s and crispness. Shared by both bucketings below.
      const row = (label, b) => {
        if (!b.length) { console.log(`  ${label} (no samples)`); return }
        const c = meanCrisp(b)
        const m1 = mean(b, (x) => x.top1), m2 = mean(b, (x) => x.top2)
        console.log(`  ${label} | top1 ${m1.toFixed(2)} top2 ${m2.toFixed(2)} gap ${(m1 - m2).toFixed(2)} | active ${mean(b, (x) => x.active).toFixed(1)} | switches/s ${mean(b, (x) => x.switches).toFixed(2)} | crisp ${c == null ? 'n/a' : c.toFixed(3)} (${b.length}s)`)
      }
      console.log(`[chladni:stats] ${n} one-second samples. overall mean active >10% of max: ${mean(s, (x) => x.active).toFixed(1)}`)

      // —— Buckets by driveLevel thirds (loud sections vs quiet).
      const byDrive = s.slice().sort((a, b) => a.drive - b.drive)
      const t1 = Math.floor(n / 3), t2 = Math.floor((2 * n) / 3)
      console.log('Buckets by driveLevel (thirds):')
      for (const [name, lo, hi] of [['quiet ', 0, t1], ['medium', t1, t2], ['loud  ', t2, n]]) {
        const b = byDrive.slice(lo, hi)
        row(b.length ? `${name} drive ${b[0].drive.toFixed(2)}–${b[b.length - 1].drive.toFixed(2)}` : name, b)
      }

      // —— Buckets by active-mode count: directly separates the clean (few modes) from the mushy (many).
      console.log('Buckets by active-mode count (>10% of max):')
      row('≤5   ', s.filter((x) => x.active <= 5))
      row('6–15 ', s.filter((x) => x.active >= 6 && x.active <= 15))
      row('16+  ', s.filter((x) => x.active >= 16))

      let reached = 0
      for (let i = 0; i < MODE_COUNT; i++) if (stats_.everTop1[i]) reached++
      let totalTop1 = 0
      for (let i = 0; i < MODE_COUNT; i++) totalTop1 += stats_.top1Time[i]
      const rows = []
      for (let i = 0; i < MODE_COUNT; i++) if (stats_.top1Time[i] > 0) rows.push({ i, t: stats_.top1Time[i] })
      rows.sort((a, b) => b.t - a.t)
      console.log(`  modes reaching top-1: ${reached} of ${MODE_COUNT}`)
      const inv = totalTop1 > 0 ? 100 / totalTop1 : 0
      const top10 = rows.slice(0, 10).map((r) => `#${r.i} n=${MODES[r.i].n} m=${MODES[r.i].m} ${Math.round(MODES[r.i].freq)}Hz ${r.t.toFixed(1)}s (${(r.t * inv).toFixed(0)}%)`).join('  ')
      console.log(`  top 10 modes by time-as-top1: ${top10 || '(none)'}`)
    }

    this.setOverlay = (v) => {
      st.overlay = v
      st.overlayModeIdx = -1
    }

    // Asymmetric music-mode smoothing (K toggle; H/J tuning). Physics only — the wrapper owns the keys and
    // the live value; these just write st, which the smoothing loop reads. No effect in tone/ink mode.
    this.setRelease = (v) => { st.releaseOn = v }
    this.setReleaseTau = (tau) => { st.releaseTau = tau }

    // Queue a one-shot re-sprinkle of the given mix (0..1 fraction of grains re-spawned), applied at the
    // start of the next step. Physics only — the wrapper decides WHEN to call this (tone changes, the T
    // key), so it stays tone-mode-only without this method knowing anything about tones.
    this.resprinkle = (mix) => {
      st.resprinkleMix = mix
      st.resprinkleSeed = Math.random() * 1000.0
      st.resprinklePending = true
    }

    // Copy the CURRENT grain positions into the snapshot target — the "before" image for the render-only tone
    // dissolve. Call this at the instant a tone is turned off, BEFORE resprinkle() replaces the figure: the
    // display then cross-fades each grain from this frozen figure to its live (re-sprinkled) position. Render
    // only — it never touches the simulation ping-pong, so the physics is identical whether or not it runs.
    this.snapshot = () => {
      copyMat.uniforms.uSource.value = st.posRead.texture
      blit(copyMat, snapshotTarget)
    }

    this.setFrozen = (v) => {
      st.frozen = v
      if (st.frozen) {
        // Log the frozen distribution: the modes carrying any share, sorted by share (unit-sum).
        let ds = 0
        for (let i = 0; i < MODE_COUNT; i++) ds += st.dist[i]
        const inv = ds > 1e-9 ? 1 / ds : 0
        const modes = []
        for (let i = 0; i < MODE_COUNT; i++) if (st.dist[i] * inv > 0.01) modes.push(i)
        modes.sort((a, b) => st.dist[b] - st.dist[a])
        const mStr = modes.map((i) => `[#${i} n=${MODES[i].n} m=${MODES[i].m} ${Math.round(MODES[i].freq)}Hz ${(st.dist[i] * inv).toFixed(2)}]`).join(' ')
        console.log(`[chladni] DEBUG freeze ON — distribution pinned. ${st.aboveFloor} modes above floor. Frozen modes: ${mStr}`)
      } else {
        console.log('[chladni] DEBUG freeze OFF — resuming audio-driven selection.')
      }
    }

    this.dispose = () => {
      ro.disconnect()
      // Remove before forceContextLoss below, so the synthetic context-loss it fires doesn't trip the
      // fallback during a normal unmount.
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      posA.dispose()
      posB.dispose()
      velA.dispose()
      velB.dispose()
      snapshotTarget.dispose()
      densityTarget.dispose()
      posSeed.dispose()
      velSeed.dispose()
      copyMat.dispose()
      resprinkleMat.dispose()
      freshPosTex.dispose()
      freshVelTex.dispose()
      velocityMat.dispose()
      positionMat.dispose()
      densityMat.dispose()
      quadGeo.dispose()
      geometry.dispose()   // shared by `points` and `densityPoints` — one dispose, not two
      pointsMat.dispose()
      wispSource.dispose()
      wispState.dispose()
      wispScratch.dispose()
      wispSourceMat.dispose()
      wispSimMat.dispose()
      wispBlurMat.dispose()
      bloom.dispose()
      inkPass.dispose()   // composer.dispose() doesn't dispose its passes
      overlayGeo.dispose()
      overlayMat.dispose()
      composer.dispose()
      renderer.dispose()
      // Actively drop the GL context (WEBGL_lose_context). renderer.dispose() alone frees three's own
      // resources but leaves the context to be reclaimed by GC — so rapidly opening/closing decks could
      // pile up live contexts and hit the browser's ~16-context ceiling, at which point NEW contexts fail
      // and the visualizer goes black. Forcing the loss here keeps the count at one.
      renderer.forceContextLoss()
      host.removeChild(renderer.domElement)
    }
  }
}
