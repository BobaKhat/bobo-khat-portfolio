"use client";

import { useRef, useEffect, useCallback, type CSSProperties } from "react";

/* ───────── Config ───────── */
const NODE_COUNT = 60;
const NODE_RADIUS = 3;
const CONNECT_DIST = 65;
const NOISE_SPEED = 0.7;
const NOISE_AMP = 38;

// Snake / trail
const TRAIL_SPRING = 0.12;
const TRAIL_DAMPING = 0.72;
const TRAIL_SPACING = 22;
const CLUSTER_SPRING = 0.018;
const SPREAD_WIDTH = 72;

// Sphere
const SPHERE_RADIUS = 160;
const SPHERE_FOV = 500; // perspective distance
const SPHERE_ROTATE_SPEED = 0.6;
const SPHERE_NOISE_SPEED = 3.0; // erratic node movement in sphere mode
const SPHERE_NOISE_AMP = 40; // how far nodes wander on the sphere
const SPHERE_CONNECT_DIST = 160; // way more connections — messy web

/* ───────── Noise ───────── */
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}
function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  return (
    (1 - sy) * ((1 - sx) * hash(ix, iy) + sx * hash(ix + 1, iy)) +
    sy * ((1 - sx) * hash(ix, iy + 1) + sx * hash(ix + 1, iy + 1))
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface NNode {
  // actual position
  x: number;
  y: number;
  // velocity
  vx: number;
  vy: number;
  // noise phase
  phaseX: number;
  phaseY: number;
  // chain index (0 = head, follows cursor)
  chainIdx: number;
  // perpendicular offset from chain spine (for width)
  perpOffset: number;
  // 3D sphere coords (fibonacci)
  sTheta: number;
  sPhi: number;
  // projected sphere position
  sx: number;
  sy: number;
  sz: number; // for depth sorting/scaling
}

export function LiquidBlob({ className, style }: { className?: string; style?: CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    cx: 0, cy: 0, // head position (follows cursor)
    vx: 0, vy: 0,
    mx: 0, my: 0,
    mouseInDomain: false,
    w: 0, h: 0,
    time: 0,
    animId: 0,
    isSphere: false,
    sphereT: 0,
    sphereRotY: 0,
    sphereRotX: 0,
    sphereVel: 0,
    nodes: [] as NNode[],
    // Trail spine — positions for the chain to follow
    spine: [] as { x: number; y: number }[],
  });

  useEffect(() => {
    const s = stateRef.current;
    s.nodes = [];

    // Fibonacci sphere distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < NODE_COUNT; i++) {
      // Chain ordering: nodes are sorted along the chain
      const chainIdx = i;
      // Perpendicular offset — alternate sides, varied distance
      const side = (i % 2 === 0 ? 1 : -1);
      const perpOffset = side * (Math.random() * SPREAD_WIDTH);

      // Fibonacci sphere coords
      const y3d = 1 - (i / (NODE_COUNT - 1)) * 2; // -1 to 1
      const theta = goldenAngle * i;

      s.nodes.push({
        x: 0, y: 0,
        vx: 0, vy: 0,
        phaseX: Math.random() * 100,
        phaseY: Math.random() * 100,
        chainIdx,
        perpOffset,
        sTheta: theta,
        sPhi: Math.acos(y3d),
        sx: 0, sy: 0, sz: 0,
      });
    }

    // Initialize spine
    s.spine = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      s.spine.push({ x: 0, y: 0 });
    }
  }, []);

  const toggleSphere = useCallback(() => {
    stateRef.current.isSphere = !stateRef.current.isSphere;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = rect.width;
      s.h = rect.height;
      if (s.cx === 0 && s.cy === 0) {
        s.cx = rect.width / 2;
        s.cy = rect.height / 2;
        // Init spine + nodes at center
        for (let i = 0; i < s.spine.length; i++) {
          s.spine[i].x = s.cx;
          s.spine[i].y = s.cy;
        }
        for (const n of s.nodes) {
          n.x = s.cx;
          n.y = s.cy;
        }
      }
    }
    resize();
    window.addEventListener("resize", resize);
    // Re-measure whenever the canvas box actually changes — the card animates
    // in on scroll (scaled down at first), so a mount-only measure locks in a
    // wrong size. ResizeObserver catches the settle and any responsive resize.
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      s.mx = e.clientX - rect.left;
      s.my = e.clientY - rect.top;
      s.mouseInDomain =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;
    }
    function onMouseLeave() { s.mouseInDomain = false; }
    function onMouseDown() { if (s.mouseInDomain) s.isSphere = true; }
    function onMouseUp() { s.isSphere = false; }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseup", onMouseUp); // catch release outside canvas

    function frame() {
      ctx.clearRect(0, 0, s.w, s.h);
      s.time += 0.012;

      const sphereTarget = s.isSphere ? 1 : 0;
      // Springy transition: overshoot then settle
      const diff = sphereTarget - s.sphereT;
      s.sphereVel = (s.sphereVel || 0) * 0.82 + diff * 0.12;
      s.sphereT += s.sphereVel;
      // Clamp to prevent runaway
      if (s.sphereT > 1.15) { s.sphereT = 1.15; s.sphereVel *= -0.3; }
      if (s.sphereT < -0.15) { s.sphereT = -0.15; s.sphereVel *= -0.3; }

      updateSpine(s);
      updateNodes(s);

      if (s.sphereT > 0.01) {
        updateSpherePositions(s);
      }

      // Blend and draw
      drawAll(ctx, s);

      s.animId = requestAnimationFrame(frame);
    }
    s.animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(s.animId);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [toggleSphere]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        userSelect: "none",
        WebkitUserSelect: "none",
        position: "relative",
        ...style,
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "crosshair",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        Hover to attract · hold for neural network
      </div>
    </div>
  );
}

/* ───────── Spine: snake-like chain that follows cursor ───────── */
function updateSpine(s: any) {
  const homeX = s.w / 2;
  const homeY = s.h / 2;

  // Head follows cursor
  const targetX = s.mouseInDomain ? s.mx : homeX;
  const targetY = s.mouseInDomain ? s.my : homeY;

  s.vx += (targetX - s.cx) * 0.06;
  s.vy += (targetY - s.cy) * 0.06;
  s.vx *= 0.85;
  s.vy *= 0.85;
  s.cx += s.vx;
  s.cy += s.vy;

  // Spine[0] = head
  s.spine[0].x = s.cx;
  s.spine[0].y = s.cy;

  // Each subsequent spine segment follows the one before it
  for (let i = 1; i < s.spine.length; i++) {
    const prev = s.spine[i - 1];
    const curr = s.spine[i];
    const dx = prev.x - curr.x;
    const dy = prev.y - curr.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > TRAIL_SPACING) {
      // Pull toward previous, maintaining max spacing
      const pull = (dist - TRAIL_SPACING) / dist;
      curr.x += dx * pull * TRAIL_SPRING;
      curr.y += dy * pull * TRAIL_SPRING;
    }

    // Also spring toward head when idle (cluster up)
    const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    const clusterAmt = Math.max(0, 1 - speed / 2) * CLUSTER_SPRING;
    curr.x += (s.cx - curr.x) * clusterAmt;
    curr.y += (s.cy - curr.y) * clusterAmt;
  }
}

/* ───────── Update node blob positions ───────── */
function updateNodes(s: any) {
  const t = s.time;

  for (const node of s.nodes as NNode[]) {
    // Find which spine point this node follows
    const spineIdx = Math.min(node.chainIdx, s.spine.length - 1);
    const sp = s.spine[spineIdx];

    // Direction of spine at this point (for perpendicular offset)
    const prevSp = s.spine[Math.max(0, spineIdx - 1)];
    const nextSp = s.spine[Math.min(s.spine.length - 1, spineIdx + 1)];
    const dirX = nextSp.x - prevSp.x;
    const dirY = nextSp.y - prevSp.y;
    const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    // Perpendicular
    const perpX = -dirY / dirLen;
    const perpY = dirX / dirLen;

    // Noise jitter
    const nx = smoothNoise(node.phaseX + t * NOISE_SPEED, t * 0.5) * NOISE_AMP;
    const ny = smoothNoise(node.phaseY + 50, t * NOISE_SPEED * 0.8 + 50) * NOISE_AMP;

    // Target position: spine point + perpendicular offset + noise
    const targetX = sp.x + perpX * node.perpOffset + nx;
    const targetY = sp.y + perpY * node.perpOffset + ny;

    // Spring toward target
    node.vx += (targetX - node.x) * TRAIL_SPRING;
    node.vy += (targetY - node.y) * TRAIL_SPRING;
    node.vx *= TRAIL_DAMPING;
    node.vy *= TRAIL_DAMPING;
    node.x += node.vx;
    node.y += node.vy;
  }
}

/* ───────── 3D Sphere projection ───────── */
function updateSpherePositions(s: any) {
  s.sphereRotY += SPHERE_ROTATE_SPEED * 0.012;
  s.sphereRotX = Math.sin(s.time * 0.4) * 0.4; // more tilt

  const cosRY = Math.cos(s.sphereRotY);
  const sinRY = Math.sin(s.sphereRotY);
  const cosRX = Math.cos(s.sphereRotX);
  const sinRX = Math.sin(s.sphereRotX);

  for (const node of s.nodes as NNode[]) {
    // 3D point on sphere
    const sinPhi = Math.sin(node.sPhi);
    let x3 = SPHERE_RADIUS * sinPhi * Math.cos(node.sTheta);
    const y3base = SPHERE_RADIUS * Math.cos(node.sPhi);
    let z3 = SPHERE_RADIUS * sinPhi * Math.sin(node.sTheta);

    // Erratic noise displacement — nodes wander wildly on the sphere
    const t = s.time;
    x3 += smoothNoise(node.phaseX + t * SPHERE_NOISE_SPEED, t * 1.2) * SPHERE_NOISE_AMP;
    let y3 = y3base + smoothNoise(node.phaseY + 30, t * SPHERE_NOISE_SPEED * 0.9 + 30) * SPHERE_NOISE_AMP;
    z3 += smoothNoise(node.phaseX + 60, t * SPHERE_NOISE_SPEED * 0.7 + 60) * SPHERE_NOISE_AMP;

    // Rotate Y
    const rx = x3 * cosRY - z3 * sinRY;
    const rz = x3 * sinRY + z3 * cosRY;
    // Rotate X
    const ry = y3 * cosRX - rz * sinRX;
    const rz2 = y3 * sinRX + rz * cosRX;

    // Perspective projection
    const scale = SPHERE_FOV / (SPHERE_FOV + rz2);
    node.sx = s.cx + rx * scale;
    node.sy = s.cy + ry * scale;
    node.sz = rz2; // depth for sizing/alpha
  }
}

/* ───────── Draw everything ───────── */
function drawAll(ctx: CanvasRenderingContext2D, s: any) {
  const nodes = s.nodes as NNode[];
  const sT = s.sphereT;

  // Compute final draw positions (blend blob ↔ sphere)
  const drawPts: { x: number; y: number; z: number; idx: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const x = lerp(n.x, n.sx, sT);
    const y = lerp(n.y, n.sy, sT);
    const z = lerp(0, n.sz, sT); // z only matters in sphere mode
    drawPts.push({ x, y, z, idx: i });
  }

  // Sort by z for depth (back to front)
  drawPts.sort((a, b) => a.z - b.z);

  // Draw connections
  ctx.save();
  ctx.lineCap = "round";

  for (let i = 0; i < drawPts.length; i++) {
    for (let j = i + 1; j < drawPts.length; j++) {
      const a = drawPts[i];
      const b = drawPts[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // In sphere mode, much longer connect distance for more wiring
      const maxDist = lerp(CONNECT_DIST, SPHERE_CONNECT_DIST, sT);

      if (dist < maxDist) {
        // Depth-based alpha: connections to "back" nodes are dimmer
        const depthAlpha = sT > 0.01
          ? Math.min(1, lerp(1, (1 - Math.max(0, Math.min(1, (Math.max(a.z, b.z) + SPHERE_RADIUS) / (2 * SPHERE_RADIUS)))) * 0.7 + 0.3, sT))
          : 1;
        const alpha = (1 - dist / maxDist) * lerp(0.4, 0.55, sT) * depthAlpha;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = lerp(0.8, 0.6, sT);
        ctx.stroke();
      }
    }
  }

  // Draw nodes (back to front)
  for (const pt of drawPts) {
    // Depth scaling for 3D effect
    const depthScale = sT > 0.01
      ? lerp(1, 0.5 + 0.8 * ((pt.z + SPHERE_RADIUS) / (2 * SPHERE_RADIUS)), sT)
      : 1;
    const depthAlpha = sT > 0.01
      ? lerp(1, 0.3 + 0.7 * ((pt.z + SPHERE_RADIUS) / (2 * SPHERE_RADIUS)), sT)
      : 1;

    const r = NODE_RADIUS * depthScale;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${depthAlpha})`;
    ctx.shadowColor = `rgba(255,255,255,${0.5 * depthAlpha})`;
    ctx.shadowBlur = 6 * depthScale;
    ctx.fill();
  }

  ctx.restore();
}
