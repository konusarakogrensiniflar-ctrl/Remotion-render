import React from "react";
import { interpolate, spring, Easing } from "remotion";
import type { DiagramSpec } from "../schema";

/**
 * Diagram.tsx — Antidote 4.0 EXPLANATORY GRAPHICS.
 *
 * Motifs (motifs.tsx) NAME a beat's subject with an icon; a diagram EXPLAINS it —
 * the self-drawing conceptual graphic that is the signature of the reference
 * channels (a taxonomy sorting into buckets, two rhythms locking into sync, a
 * cause flowing to an effect, a marker on a spectrum). Every archetype is pure
 * SVG + interpolate/spring, deterministic (a function of the local frame), so it
 * is CPU-cheap and frame-identical across chunked renders.
 *
 * A diagram is data-driven: the director/planner hands it `labels` (bucket /
 * node / pole names) and optional `values`, and it draws itself. It renders on
 * the focal plane as the hero of the beat (usually with the cast dropped).
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// viewBox the archetypes draw into; the parent scales it to the stage.
const VW = 1200;
const VH = 620;

type ArchProps = {
  spec: DiagramSpec;
  accent: string;
  ink: string;
  paper: string;
  frame: number; // local frames since the diagram appeared
  fps: number;
  durationFrames: number;
};

const Title: React.FC<{ text?: string; ink: string; show: number }> = ({ text, ink, show }) =>
  text ? (
    <text x={VW / 2} y={54} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800}
      fontSize={46} fill={ink} opacity={show} letterSpacing={1}>
      {text.toUpperCase()}
    </text>
  ) : null;

// ── sorter — items route into N labelled buckets (a taxonomy / classification) ─
const Sorter: React.FC<ArchProps> = ({ spec, accent, ink, paper, frame, fps }) => {
  const labels = spec.labels.length ? spec.labels.slice(0, 4) : ["ONE", "TWO", "THREE"];
  const n = labels.length;
  const gap = 44;
  const totalW = VW - 120;
  const bw = (totalW - gap * (n - 1)) / n;
  const top = 210;
  const bh = 300;
  const show = spring({ frame, fps, config: { damping: 16 } });
  return (
    <g>
      <Title text={spec.title} ink={ink} show={show} />
      {labels.map((lab, i) => {
        const x = 60 + i * (bw + gap);
        const enter = spring({ frame: frame - i * 6, fps, config: { damping: 15, stiffness: 120 } });
        const dots = Math.max(1, Math.min(6, spec.values?.[i] ?? 3));
        return (
          <g key={i} opacity={enter} transform={`translate(0 ${(1 - enter) * 24})`}>
            {/* open-top container */}
            <path
              d={`M${x},${top} L${x},${top + bh} Q${x},${top + bh + 22} ${x + 22},${top + bh + 22} L${x + bw - 22},${top + bh + 22} Q${x + bw},${top + bh + 22} ${x + bw},${top + bh} L${x + bw},${top}`}
              fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" opacity={0.85}
            />
            <rect x={x} y={top + bh - 4} width={bw} height={26} fill={accent} opacity={0.16} />
            {/* tokens dropping in on a stagger */}
            {Array.from({ length: dots }).map((_, d) => {
              const start = 14 + i * 8 + d * 9;
              const fall = clamp01((frame - start) / 20);
              const cy = interpolate(Easing.out(Easing.quad)(fall), [0, 1], [top - 70, top + bh - 40 - d * 34]);
              const cx = x + bw / 2 + (d % 2 === 0 ? -1 : 1) * (18 + (d % 3) * 14);
              return <circle key={d} cx={cx} cy={cy} r={16} fill={accent} opacity={fall > 0 ? 1 : 0} />;
            })}
            <text x={x + bw / 2} y={top + bh + 66} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif"
              fontWeight={800} fontSize={34} fill={ink}>{lab.toUpperCase()}</text>
          </g>
        );
      })}
    </g>
  );
};

// ── matchWave — two rhythms drift out of phase, then LOCK into sync ───────────
const MatchWave: React.FC<ArchProps> = ({ spec, accent, ink, frame, fps, durationFrames }) => {
  const t = clamp01((frame / Math.max(1, durationFrames) - 0.15) / 0.6);
  const mism = 1 - Easing.inOut(Easing.ease)(t); // 1 mismatched → 0 locked
  const midY = VH / 2 + 10;
  const amp = 92;
  const scroll = frame * 0.06;
  const path = (offset: number, freqMul: number, phase: number, yOff: number) => {
    let d = "";
    for (let px = 60; px <= VW - 60; px += 12) {
      const k = (px / (VW - 120)) * Math.PI * 2 * 2.2 * freqMul;
      const y = midY + yOff + Math.sin(k + phase + scroll) * amp;
      d += `${px === 60 ? "M" : "L"}${px.toFixed(1)},${y.toFixed(1)} `;
    }
    return d;
  };
  const show = spring({ frame, fps, config: { damping: 16 } });
  return (
    <g opacity={show}>
      <Title text={spec.title} ink={ink} show={show} />
      {/* wave A (steady reference) */}
      <path d={path(0, 1, 0, -34)} fill="none" stroke={ink} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
      {/* wave B converges to A's frequency + phase as mism → 0 */}
      <path d={path(0, 1 + 0.55 * mism, mism * Math.PI, 34 - 34 * (1 - mism))} fill="none" stroke={accent} strokeWidth={8} strokeLinecap="round" />
      <text x={VW / 2} y={VH - 26} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800}
        fontSize={40} fill={accent} opacity={interpolate(mism, [0.05, 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        {(spec.labels[0] || "IN SYNC").toUpperCase()}
      </text>
    </g>
  );
};

// ── flow — cause → effect, a token travelling A → B (→ C) ─────────────────────
const Flow: React.FC<ArchProps> = ({ spec, accent, ink, paper, frame, fps, durationFrames }) => {
  const nodes = spec.labels.length ? spec.labels.slice(0, 3) : ["CAUSE", "EFFECT"];
  const n = nodes.length;
  const y = VH / 2;
  const r = 92;
  const xs = nodes.map((_, i) => interpolate(i, [0, n - 1], [60 + r, VW - 60 - r]));
  const show = spring({ frame, fps, config: { damping: 16 } });
  // token travels the whole chain, looping over the beat
  const loop = ((frame % Math.max(30, durationFrames)) / Math.max(30, durationFrames));
  const seg = Math.min(n - 2, Math.floor(loop * (n - 1)));
  const segT = clamp01(loop * (n - 1) - seg);
  // travel EDGE to EDGE along the connector, never through a node (which would
  // drag the token across the node's label).
  const tokenX = interpolate(segT, [0, 1], [xs[seg] + r, (xs[seg + 1] ?? xs[seg]) - r]);
  return (
    <g opacity={show}>
      <Title text={spec.title} ink={ink} show={show} />
      {nodes.slice(0, n - 1).map((_, i) => {
        const drawn = clamp01((frame - 12 - i * 8) / 14);
        return (
          <g key={`a${i}`}>
            <line x1={xs[i] + r} y1={y} x2={xs[i] + r + (xs[i + 1] - xs[i] - 2 * r) * drawn} y2={y}
              stroke={ink} strokeWidth={7} strokeLinecap="round" opacity={0.6} />
            {drawn > 0.9 && <path d={`M${xs[i + 1] - r - 4},${y - 12} L${xs[i + 1] - r + 10},${y} L${xs[i + 1] - r - 4},${y + 12}`} fill={ink} opacity={0.6} />}
          </g>
        );
      })}
      {nodes.map((lab, i) => {
        const enter = spring({ frame: frame - i * 10, fps, config: { damping: 14, stiffness: 130 } });
        return (
          <g key={i} opacity={enter} transform={`translate(${xs[i]} ${y}) scale(${enter})`}>
            <circle r={r} fill={paper} stroke={i === 0 ? ink : accent} strokeWidth={8} />
            <text y={12} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800}
              fontSize={lab.length > 8 ? 30 : 38} fill={ink}>{lab.toUpperCase()}</text>
          </g>
        );
      })}
      <circle cx={tokenX} cy={y} r={20} fill={accent} opacity={frame > 20 ? 1 : 0} />
    </g>
  );
};

// ── spectrum — a marker on a continuum between two poles ──────────────────────
const Spectrum: React.FC<ArchProps> = ({ spec, accent, ink, frame, fps }) => {
  const y = VH / 2;
  const x0 = 120, x1 = VW - 120;
  const target = clamp01(spec.values?.[0] ?? 0.5);
  const p = spring({ frame: frame - 12, fps, config: { damping: 13, stiffness: 90 } });
  const mx = interpolate(p, [0, 1], [(x0 + x1) / 2, interpolate(target, [0, 1], [x0, x1])]);
  const show = spring({ frame, fps, config: { damping: 16 } });
  const poles = spec.labels.length >= 2 ? spec.labels : ["LESS", "MORE"];
  return (
    <g opacity={show}>
      <Title text={spec.title} ink={ink} show={show} />
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={ink} strokeWidth={8} strokeLinecap="round" opacity={0.4} />
      <line x1={x0} y1={y} x2={mx} y2={y} stroke={accent} strokeWidth={8} strokeLinecap="round" />
      {[x0, x1].map((x, i) => <circle key={i} cx={x} cy={y} r={12} fill={ink} opacity={0.5} />)}
      <g transform={`translate(${mx} ${y})`}>
        <circle r={26} fill={accent} />
        <circle r={26} fill="none" stroke={ink} strokeWidth={4} opacity={0.25} />
      </g>
      <text x={x0} y={y + 70} textAnchor="start" fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={34} fill={ink}>{poles[0].toUpperCase()}</text>
      <text x={x1} y={y + 70} textAnchor="end" fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={34} fill={ink}>{poles[1].toUpperCase()}</text>
    </g>
  );
};

const ARCH: Record<DiagramSpec["type"], React.FC<ArchProps>> = {
  sorter: Sorter,
  matchWave: MatchWave,
  flow: Flow,
  spectrum: Spectrum,
};

/**
 * Diagram — places one archetype at its stage anchor. `frame` is local (frames
 * since the diagram appeared); the parent (Scene) handles the depth plane.
 */
export const Diagram: React.FC<{
  spec: DiagramSpec; accent: string; ink: string; paper: string; frame: number; fps: number; durationFrames: number;
}> = ({ spec, accent, ink, paper, frame, fps, durationFrames }) => {
  const Arch = ARCH[spec.type] ?? Sorter;
  const scale = spec.scale ?? 1;
  const cx = spec.x ?? 960;
  const cy = spec.y ?? 486; // biased up, clear of the caption band
  const w = VW * scale;
  const h = VH * scale;
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: "translate(-50%, -50%)", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.12))" }}>
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: "visible" }}>
        <Arch spec={spec} accent={accent} ink={ink} paper={paper} frame={frame} fps={fps} durationFrames={durationFrames} />
      </svg>
    </div>
  );
};
