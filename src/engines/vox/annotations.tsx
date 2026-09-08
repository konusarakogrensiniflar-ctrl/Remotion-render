import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { RED, hash } from "./palette";

/**
 * annotations.tsx — the hand-drawn marker layer.
 *
 * The reference channels' signature move is not a transition, it is ANNOTATION:
 * a red marker circle thrown around the word that matters, an arrow pointing at
 * the thing being described, a box stamped around a name. It reads as a person
 * reacting to the material rather than a template playing back, and it gives a
 * beat a second visual event without a cut (see SKILL §9.3b).
 *
 * Everything here is one SVG path drawn in with `strokeDashoffset`, so the cost
 * is a handful of DOM nodes — no images, no WebGL, nothing the GPU-less render
 * PC has to think about.
 *
 * Geometry is SEEDED, never random: the same beat draws the same stroke on every
 * re-render, which is what keeps chunked renders frame-identical at the seams.
 */

/** Deterministic [-1,1] noise from a seed and an index. */
const wob = (seed: number, i: number) => Math.sin((seed * 97.13 + i * 12.9898) * 43758.5453) % 1;

/** Path + its length, so the dash draw-in doesn't need getTotalLength(). */
type Stroke = { d: string; len: number };

function polyline(pts: [number, number][]): Stroke {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return { d, len };
}

/**
 * A marker loop: an ellipse sampled with seeded wobble, swept a little past its
 * own start so it ends in the overshoot a real hand leaves behind.
 */
function loopPath(w: number, h: number, seed: number): Stroke {
  const cx = w / 2;
  const cy = h / 2;
  const a = w / 2 - 4;
  const b = h / 2 - 4;
  const start = -0.35 + wob(seed, 1) * 0.3;
  const sweep = Math.PI * 2 + 0.42 + wob(seed, 2) * 0.25; // overshoot past the start
  const N = 56;
  const tilt = wob(seed, 3) * 0.07; // the loop is never drawn perfectly upright
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = start + (i / N) * sweep;
    // radius wobble grows slightly along the stroke, like pressure easing off
    const r = 1 + wob(seed, i) * 0.035 + (i / N) * 0.02;
    const x = Math.cos(t) * a * r;
    const y = Math.sin(t) * b * r;
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return polyline(pts);
}

/** A rough four-sided box — the corners never quite meet. */
function boxPath(w: number, h: number, seed: number): Stroke {
  const j = (i: number, amt = 7) => wob(seed, i) * amt;
  const pts: [number, number][] = [
    [6 + j(1), 8 + j(2)],
    [w - 6 + j(3), 4 + j(4)],
    [w - 4 + j(5), h - 8 + j(6)],
    [8 + j(7), h - 5 + j(8)],
    [4 + j(9), 12 + j(10)], // closes past the start
  ];
  return polyline(pts);
}

/** A struck-through word: one decisive slash with a slight arc. */
function strikePath(w: number, h: number, seed: number): Stroke {
  const y = h / 2;
  const lift = 6 + wob(seed, 4) * 8;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push([-6 + t * (w + 12), y + Math.sin(t * Math.PI) * -lift + wob(seed, i) * 2]);
  }
  return polyline(pts);
}

/**
 * A curved arrow from one corner of the box toward its target edge, with a head
 * that snaps on once the shaft has finished drawing.
 */
function arrowPath(w: number, h: number, seed: number, dir: "left" | "right"): { shaft: Stroke; head: Stroke } {
  const sx = dir === "right" ? 6 : w - 6;
  const ex = dir === "right" ? w - 10 : 10;
  const sy = h * (0.86 + wob(seed, 2) * 0.08);
  const ey = h * (0.16 + wob(seed, 3) * 0.1);
  const bend = (dir === "right" ? 1 : -1) * (0.35 + wob(seed, 4) * 0.2);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    // quadratic bezier with the control pushed out sideways
    const cx = (sx + ex) / 2 + bend * w * 0.42;
    const cy = (sy + ey) / 2 - h * 0.1;
    const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
    const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey;
    pts.push([x, y]);
  }
  const shaft = polyline(pts);
  // head: two barbs off the final direction of travel
  const [px, py] = pts[pts.length - 2];
  const ang = Math.atan2(ey - py, ex - px);
  const L = Math.max(20, Math.min(46, h * 0.22));
  const barb = (spread: number): [number, number] => [
    ex - Math.cos(ang + spread) * L,
    ey - Math.sin(ang + spread) * L,
  ];
  const head = polyline([barb(0.44), [ex, ey], barb(-0.44)]);
  return { shaft, head };
}

export type AnnotationKind = "circle" | "box" | "arrow" | "strike";

/**
 * Annotation — draws a marker stroke over the box it is placed in.
 *
 * Place it as an absolutely-positioned sibling INSIDE a `position:relative`
 * wrapper around whatever it annotates, sized with `inset` padding so the loop
 * clears the glyphs. `w`/`h` are the stroke's own canvas in px.
 */
export const Annotation: React.FC<{
  kind: AnnotationKind;
  w: number;
  h: number;
  startFrame: number;
  seed?: number;
  color?: string;
  /** Draw duration in frames. Fast reads as decisive; slow reads as hesitant. */
  frames?: number;
  strokeWidth?: number;
  /** Which way an `arrow` travels. Ignored by the other kinds. */
  dir?: "left" | "right";
}> = ({ kind, w, h, startFrame, seed = 0.5, color = RED, frames = 16, strokeWidth, dir = "right" }) => {
  const frame = useCurrentFrame();
  if (w <= 0 || h <= 0) return null;
  const p = interpolate(frame, [startFrame, startFrame + frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;
  const sw = strokeWidth ?? Math.max(6, Math.min(14, h * 0.075));

  const arrow = kind === "arrow" ? arrowPath(w, h, seed, dir) : null;
  const main: Stroke =
    kind === "circle" ? loopPath(w, h, seed)
      : kind === "box" ? boxPath(w, h, seed)
        : kind === "strike" ? strikePath(w, h, seed)
          : arrow!.shaft;

  // The head lands only once the shaft is essentially there.
  const headOp = arrow
    ? interpolate(frame, [startFrame + frames * 0.82, startFrame + frames * 0.82 + 5], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })
    : 0;

  const common = {
    fill: "none" as const,
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", zIndex: 14 }}
      aria-hidden
    >
      <path
        {...common}
        d={main.d}
        strokeDasharray={main.len}
        strokeDashoffset={main.len * (1 - p)}
        opacity={0.94}
      />
      {arrow ? (
        <path {...common} d={arrow.head.d} opacity={headOp * 0.94} />
      ) : null}
    </svg>
  );
};

/**
 * annotationFor — the deterministic director for the marker layer.
 *
 * Annotating every beat would be noise, so a beat only earns a stroke about a
 * third of the time, chosen from its id. Returns null otherwise. Callers still
 * decide WHERE it goes; this only decides whether and which.
 */
export function annotationFor(beatId: string, allowed: AnnotationKind[] = ["circle", "box", "arrow"]): { kind: AnnotationKind; seed: number } | null {
  const h = hash(beatId + "ann");
  if (h > 0.34) return null;
  const kind = allowed[Math.floor(hash(beatId + "annk") * allowed.length) % allowed.length];
  return { kind, seed: hash(beatId + "anns") };
}

/**
 * Annotated — throws a hand-drawn marker stroke around whatever it wraps.
 *
 * The stroke needs a pixel box and text cannot be measured in Remotion, so the
 * box is estimated from the glyph count. A marker loop is deliberately loose
 * around its subject, so an estimate is not just tolerable here — a stroke that
 * hugged the letters exactly would look machine-drawn, which is the opposite of
 * the point.
 */
export const Annotated: React.FC<{
  text: string; size: number; kind: "circle" | "box" | "strike" | "arrow"; seed: number; startFrame: number; children: React.ReactNode;
}> = ({ text, size, kind, seed, startFrame, children }) => {
  // 0.66em average advance for uppercase Arial Black; the loop sits just wide
  // of the glyphs. Height is kept TIGHT on purpose — a taller loop is rounder
  // but slices through the stacked line above it and reads as a bug, not a mark.
  const w = Math.max(140, text.replace(/\s+/g, " ").trim().length * size * 0.66) + 44;
  const h = size * 1.02 + 14;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {children}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: w, height: h, transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
        <Annotation kind={kind} w={w} h={h} seed={seed} startFrame={startFrame} />
      </div>
    </div>
  );
};
