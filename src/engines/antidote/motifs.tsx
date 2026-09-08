import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { enter } from "./movements";
import { ANTIDOTE_FONT } from "./components/KineticText";
import type { PropSpec } from "./schema";

/**
 * motifs.tsx — the visual-metaphor library of the Antidote engine.
 *
 * Before this file the prop system drew exactly two things (money rain and an
 * arrow); coin / book / shape returned null. A book-summary channel lives on
 * metaphor — growth, balance, time, doors, mazes, crowds — so every abstract
 * beat now has a concrete thing to show, and the `insert` shot has something
 * worth cutting to.
 *
 * Every motif is a pure function of the local frame, drawn in flat vector at a
 * nominal 520×520 box, centered on (spec.x, spec.y) and multiplied by spec.scale.
 */

const BOX = 520;

type MotifProps = { spec: PropSpec; accent: string; ink: string };

/** Shared positioning wrapper: centers the motif and applies its enter animation. */
const Frame: React.FC<{ spec: PropSpec; children: React.ReactNode; w?: number; h?: number }> = ({ spec, children, w = BOX, h = BOX }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = enter(spec.enter, frame, fps);
  if (t.opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: spec.x,
        top: spec.y,
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        opacity: t.opacity,
        transform: `translate(${t.tx}px, ${t.ty}px) scale(${spec.scale * t.scale})`,
        transformOrigin: "center",
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
        {children}
      </svg>
    </div>
  );
};

/** 0→1 progress over `frames`, eased — the standard "draw yourself in" ramp. */
const draw = (frame: number, frames = 34, delay = 0) =>
  interpolate(frame - delay, [0, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

/** N-point star / impact-burst polygon points (shared by the star icon and the
 *  crash impact). rO = outer radius, rI = inner radius. */
function spikes(cx: number, cy: number, rO: number, rI: number, n: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? rO : rI;
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

// ── growth / data ───────────────────────────────────────────────────────────
const BarChart: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(3, Math.min(7, Math.round(spec.value ?? 5)));
  const gap = 26;
  const bw = (BOX - gap * (n - 1)) / n;
  return (
    <Frame spec={spec}>
      <line x1={0} y1={BOX} x2={BOX} y2={BOX} stroke={ink} strokeWidth={8} strokeLinecap="round" opacity={0.35} />
      {Array.from({ length: n }).map((_, i) => {
        const target = BOX * (0.24 + (i / (n - 1)) * 0.68);
        const s = spring({ frame, fps, delay: 6 + i * 5, config: { damping: 12, stiffness: 140, mass: 0.6 } });
        const h = target * s;
        return <rect key={i} x={i * (bw + gap)} y={BOX - h} width={bw} height={h} rx={10} fill={i === n - 1 ? accent : ink} opacity={i === n - 1 ? 1 : 0.72} />;
      })}
    </Frame>
  );
};

const LineGrowth: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 46, 4);
  const path = `M10,470 L120,392 L212,418 L318,258 L410,196 L508,54`;
  const LEN = 780;
  const head = { x: interpolate(p, [0, 1], [10, 508]), y: interpolate(p, [0, 1], [470, 54], { easing: Easing.in(Easing.quad) }) };
  return (
    <Frame spec={spec}>
      <g stroke={ink} strokeWidth={5} opacity={0.2}>
        {[130, 250, 370].map((y) => <line key={y} x1={0} y1={y} x2={BOX} y2={y} />)}
      </g>
      <path d={path} fill="none" stroke={accent} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={LEN} strokeDashoffset={LEN * (1 - p)} />
      {p > 0.96 ? <circle cx={508} cy={54} r={18} fill={accent} /> : <circle cx={head.x} cy={head.y} r={13} fill={accent} opacity={0.9} />}
    </Frame>
  );
};

const Counter: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const target = spec.value ?? 100;
  const p = draw(frame, 40, 3);
  const shown = Math.round(target * p);
  return (
    <Frame spec={spec}>
      <text x={BOX / 2} y={BOX / 2 + 10} textAnchor="middle" dominantBaseline="middle"
        fontFamily={ANTIDOTE_FONT} fontWeight={800} fontSize={188} fill={accent}>
        {shown.toLocaleString("en-US")}
      </text>
      {spec.label ? (
        <text x={BOX / 2} y={BOX / 2 + 148} textAnchor="middle" fontFamily={ANTIDOTE_FONT} fontWeight={700} fontSize={62} fill={ink} opacity={0.72}>
          {spec.label}
        </text>
      ) : null}
    </Frame>
  );
};

const Stack: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(3, Math.min(6, Math.round(spec.value ?? 5)));
  const bh = 62;
  return (
    <Frame spec={spec}>
      {Array.from({ length: n }).map((_, i) => {
        const s = spring({ frame, fps, delay: 4 + i * 7, config: { damping: 11, stiffness: 150 } });
        const y = BOX - (i + 1) * (bh + 10);
        const w = BOX - i * 34;
        return (
          <rect key={i} x={(BOX - w) / 2} y={interpolate(s, [0, 1], [y - 260, y])} width={w} height={bh} rx={12}
            fill={i === n - 1 ? accent : ink} opacity={i === n - 1 ? 1 : 0.78 - i * 0.06} />
        );
      })}
    </Frame>
  );
};

// ── choice / tension ────────────────────────────────────────────────────────
const Balance: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, delay: 10, config: { damping: 9, stiffness: 70, mass: 1.1 } });
  const tilt = interpolate(s, [0, 1], [0, 14]);
  const arm = (dx: number) => ({ x: BOX / 2 + dx, y: 200 + (dx > 0 ? 1 : -1) * Math.tan((tilt * Math.PI) / 180) * Math.abs(dx) });
  const L = arm(-180), R = arm(180);
  return (
    <Frame spec={spec}>
      <rect x={BOX / 2 - 12} y={190} width={24} height={280} rx={10} fill={ink} opacity={0.85} />
      <path d={`M${BOX / 2 - 110},490 L${BOX / 2 + 110},490 L${BOX / 2 + 78},452 L${BOX / 2 - 78},452 Z`} fill={ink} opacity={0.85} />
      <g transform={`rotate(${tilt} ${BOX / 2} 200)`}>
        <line x1={BOX / 2 - 190} y1={200} x2={BOX / 2 + 190} y2={200} stroke={ink} strokeWidth={16} strokeLinecap="round" />
      </g>
      <g>
        <line x1={L.x} y1={L.y} x2={L.x} y2={L.y + 64} stroke={ink} strokeWidth={6} />
        <path d={`M${L.x - 66},${L.y + 64} L${L.x + 66},${L.y + 64} L${L.x + 44},${L.y + 118} L${L.x - 44},${L.y + 118} Z`} fill={ink} opacity={0.7} />
        <line x1={R.x} y1={R.y} x2={R.x} y2={R.y + 64} stroke={ink} strokeWidth={6} />
        <path d={`M${R.x - 66},${R.y + 64} L${R.x + 66},${R.y + 64} L${R.x + 44},${R.y + 118} L${R.x - 44},${R.y + 118} Z`} fill={accent} />
      </g>
    </Frame>
  );
};

const Maze: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 58, 6);
  const path = "M60,60 L60,200 L200,200 L200,80 L340,80 L340,260 L120,260 L120,400 L300,400 L300,320 L460,320 L460,460";
  const LEN = 1560;
  return (
    <Frame spec={spec}>
      <g stroke={ink} strokeWidth={10} opacity={0.16} fill="none" strokeLinecap="square">
        <rect x={20} y={20} width={480} height={480} />
        <line x1={140} y1={20} x2={140} y2={150} /><line x1={260} y1={140} x2={400} y2={140} />
        <line x1={20} y1={330} x2={180} y2={330} /><line x1={380} y1={200} x2={380} y2={300} />
        <line x1={240} y1={380} x2={240} y2={500} />
      </g>
      <path d={path} fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={LEN} strokeDashoffset={LEN * (1 - p)} />
      <circle cx={60} cy={60} r={16} fill={ink} opacity={0.6} />
      <circle cx={460} cy={460} r={18} fill={accent} opacity={p > 0.95 ? 1 : 0.25} />
    </Frame>
  );
};

const Crack: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 26, 2);
  const branches = [
    "M260,20 L248,150 L286,258 L262,392 L292,500",
    "M248,150 L140,214 L96,300",
    "M286,258 L406,300 L452,392",
    "M262,392 L156,442",
  ];
  return (
    <Frame spec={spec}>
      <rect x={40} y={20} width={440} height={480} rx={18} fill={ink} opacity={0.12} />
      {branches.map((d, i) => {
        const q = draw(frame, 20, 2 + i * 5);
        return <path key={i} d={d} fill="none" stroke={accent} strokeWidth={i === 0 ? 14 : 9} strokeLinecap="round"
          strokeDasharray={600} strokeDashoffset={600 * (1 - q)} />;
      })}
      <circle cx={260} cy={20} r={10 + p * 6} fill={accent} opacity={0.5} />
    </Frame>
  );
};

// ── time / opportunity ──────────────────────────────────────────────────────
const Clock: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 30);
  const minute = frame * 6;
  const hour = frame * 0.5;
  return (
    <Frame spec={spec}>
      <circle cx={260} cy={260} r={222} fill="none" stroke={ink} strokeWidth={16} opacity={0.85}
        strokeDasharray={1396} strokeDashoffset={1396 * (1 - p)} transform="rotate(-90 260 260)" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={260 + Math.cos(a) * 188} y1={260 + Math.sin(a) * 188}
          x2={260 + Math.cos(a) * 208} y2={260 + Math.sin(a) * 208} stroke={ink} strokeWidth={i % 3 === 0 ? 10 : 5} strokeLinecap="round" opacity={0.5} />;
      })}
      <line x1={260} y1={260} x2={260 + Math.cos(((hour - 90) * Math.PI) / 180) * 108} y2={260 + Math.sin(((hour - 90) * Math.PI) / 180) * 108}
        stroke={ink} strokeWidth={16} strokeLinecap="round" />
      <line x1={260} y1={260} x2={260 + Math.cos(((minute - 90) * Math.PI) / 180) * 168} y2={260 + Math.sin(((minute - 90) * Math.PI) / 180) * 168}
        stroke={accent} strokeWidth={11} strokeLinecap="round" />
      <circle cx={260} cy={260} r={16} fill={accent} />
    </Frame>
  );
};

const Door: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, delay: 8, config: { damping: 14, stiffness: 60 } });
  const openW = interpolate(s, [0, 1], [190, 34]);
  return (
    <Frame spec={spec}>
      <path d="M120,60 L400,60 L400,500 L120,500 Z" fill={accent} opacity={interpolate(s, [0, 1], [0, 0.9])} />
      <path d={`M120,60 L400,60 L400,500 L120,500 Z`} fill="none" stroke={ink} strokeWidth={12} />
      <g>
        <rect x={120} y={60} width={openW} height={440} fill={ink} opacity={0.9} />
        <circle cx={120 + openW - 22} cy={300} r={11} fill={accent} opacity={openW > 60 ? 1 : 0} />
      </g>
      <path d={`M${120 + openW},60 L400,60 L400,500 L${120 + openW},500 Z`} fill="none" stroke={ink} strokeWidth={6} opacity={0.25} />
    </Frame>
  );
};

const Spotlight: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 26);
  const sway = Math.sin(frame * 0.03) * 16;
  return (
    <Frame spec={spec}>
      <defs>
        <linearGradient id="antidote-spot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.85} />
          <stop offset="100%" stopColor={accent} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <g transform={`rotate(${sway} 260 40)`} opacity={p}>
        <path d="M228,40 L292,40 L432,470 L88,470 Z" fill="url(#antidote-spot)" />
        <rect x={214} y={4} width={92} height={44} rx={10} fill={ink} />
      </g>
      <ellipse cx={260} cy={478} rx={176 * p} ry={30 * p} fill={accent} opacity={0.4} />
    </Frame>
  );
};

const Summit: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 48, 6);
  const climber = { x: interpolate(p, [0, 1], [96, 262]), y: interpolate(p, [0, 1], [472, 132]) };
  return (
    <Frame spec={spec}>
      <path d="M20,490 L180,240 L262,330 L360,120 L500,490 Z" fill={ink} opacity={0.85} />
      <path d="M360,120 L418,290 L302,290 Z" fill={accent} opacity={0.9} />
      <g opacity={p > 0.92 ? 1 : 0.35}>
        <line x1={360} y1={120} x2={360} y2={44} stroke={ink} strokeWidth={9} strokeLinecap="round" />
        <path d="M360,44 L432,66 L360,90 Z" fill={accent} />
      </g>
      <circle cx={climber.x} cy={climber.y} r={15} fill={accent} />
    </Frame>
  );
};

const Ladder: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(4, Math.min(8, Math.round(spec.value ?? 6)));
  const top = 40, bottom = 490;
  const step = (bottom - top) / n;
  const railP = draw(frame, 24);
  return (
    <Frame spec={spec}>
      <line x1={150} y1={bottom} x2={150} y2={interpolate(railP, [0, 1], [bottom, top])} stroke={ink} strokeWidth={16} strokeLinecap="round" />
      <line x1={370} y1={bottom} x2={370} y2={interpolate(railP, [0, 1], [bottom, top])} stroke={ink} strokeWidth={16} strokeLinecap="round" />
      {Array.from({ length: n }).map((_, i) => {
        const y = bottom - (i + 0.5) * step;
        const s = spring({ frame, fps, delay: 14 + i * 6, config: { damping: 13, stiffness: 170 } });
        return <line key={i} x1={150} y1={y} x2={interpolate(s, [0, 1], [150, 370])} y2={y}
          stroke={i === n - 1 ? accent : ink} strokeWidth={13} strokeLinecap="round" opacity={i === n - 1 ? 1 : 0.8} />;
      })}
    </Frame>
  );
};

// ── ambient / abstract ──────────────────────────────────────────────────────
const Orbit: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 24);
  const rings = [
    { r: 120, speed: 0.035, n: 3 },
    { r: 182, speed: -0.022, n: 4 },
    { r: 240, speed: 0.014, n: 5 },
  ];
  return (
    <Frame spec={spec}>
      <circle cx={260} cy={260} r={44 * p} fill={accent} />
      {rings.map((ring, ri) => (
        <g key={ri}>
          <circle cx={260} cy={260} r={ring.r} fill="none" stroke={ink} strokeWidth={4} opacity={0.18 * p} />
          {Array.from({ length: ring.n }).map((_, i) => {
            const a = frame * ring.speed + (i / ring.n) * Math.PI * 2;
            return <circle key={i} cx={260 + Math.cos(a) * ring.r} cy={260 + Math.sin(a) * ring.r} r={13} fill={ink} opacity={0.7 * p} />;
          })}
        </g>
      ))}
    </Frame>
  );
};

const Ripple: React.FC<MotifProps> = ({ spec, accent }) => {
  const frame = useCurrentFrame();
  const rings = 4;
  const period = 46;
  return (
    <Frame spec={spec}>
      {Array.from({ length: rings }).map((_, i) => {
        const t = ((frame + i * (period / rings)) % period) / period;
        return <circle key={i} cx={260} cy={260} r={30 + t * 230} fill="none" stroke={accent}
          strokeWidth={interpolate(t, [0, 1], [16, 3])} opacity={interpolate(t, [0, 1], [0.85, 0])} />;
      })}
      <circle cx={260} cy={260} r={22} fill={accent} />
    </Frame>
  );
};

const Shape: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 22);
  return (
    <Frame spec={spec}>
      <g transform={`rotate(${frame * 0.28} 260 260)`}>
        <rect x={120} y={120} width={280} height={280} rx={40} fill="none" stroke={ink} strokeWidth={12} opacity={0.35 * p} />
      </g>
      <g transform={`rotate(${-frame * 0.42} 260 260)`}>
        <path d="M260,110 L410,370 L110,370 Z" fill="none" stroke={accent} strokeWidth={14} strokeLinejoin="round" opacity={p} />
      </g>
      <circle cx={260} cy={260} r={54 * p} fill={accent} opacity={0.9} />
    </Frame>
  );
};

// ── objects ─────────────────────────────────────────────────────────────────
const Coin: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const spin = Math.abs(Math.cos(frame * 0.09));
  const bobY = Math.sin(frame * 0.06) * 14;
  return (
    <Frame spec={spec}>
      <g transform={`translate(0 ${bobY})`}>
        <ellipse cx={260} cy={280} rx={168 * spin + 6} ry={168} fill={accent} />
        <ellipse cx={260} cy={280} rx={(168 * spin + 6) * 0.76} ry={128} fill="none" stroke={ink} strokeWidth={9} opacity={0.35} />
        {spin > 0.34 ? (
          <text x={260} y={280} textAnchor="middle" dominantBaseline="middle" fontFamily={ANTIDOTE_FONT}
            fontWeight={800} fontSize={150 * spin} fill={ink} opacity={0.75}>$</text>
        ) : null}
      </g>
      <ellipse cx={260} cy={480} rx={110} ry={20} fill={ink} opacity={0.16} />
    </Frame>
  );
};

const Book: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, delay: 6, config: { damping: 13, stiffness: 90 } });
  const open = interpolate(s, [0, 1], [0, 1]);
  const lift = interpolate(open, [0, 1], [0, -18]);
  return (
    <Frame spec={spec}>
      <g transform={`translate(0 ${lift})`}>
        <path d={`M260,180 Q${260 - 220 * open},${150 - 20 * open} ${260 - 230 * open},${330}`} fill={accent} opacity={0.95} />
        <path d={`M260,180 Q${260 + 220 * open},${150 - 20 * open} ${260 + 230 * open},${330}`} fill={accent} opacity={0.8} />
        <path d={`M${260 - 230 * open},330 Q260,${372} ${260 + 230 * open},330 L260,392 Z`} fill={ink} opacity={0.82} />
        <rect x={252} y={175} width={16} height={215} rx={6} fill={ink} opacity={0.7} />
        {open > 0.6 ? (
          <g stroke={ink} strokeWidth={7} strokeLinecap="round" opacity={0.3}>
            {[236, 268, 300].map((y, i) => (
              <React.Fragment key={y}>
                <line x1={80 + i * 6} y1={y} x2={228} y2={y} />
                <line x1={292} y1={y} x2={440 - i * 6} y2={y} />
              </React.Fragment>
            ))}
          </g>
        ) : null}
      </g>
    </Frame>
  );
};

const Arrow: React.FC<MotifProps> = ({ spec, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = enter(spec.enter === "none" ? "pop" : spec.enter, frame, fps);
  const dash = interpolate(t.scale, [0, 1], [400, 0]);
  return (
    <div style={{ position: "absolute", left: spec.x, top: spec.y, transform: "translate(-50%,-50%)", opacity: t.opacity }}>
      <svg width={360 * spec.scale} height={200 * spec.scale} viewBox="0 0 360 200" style={{ overflow: "visible" }}>
        <path d="M20,150 Q180,20 320,90" fill="none" stroke={accent} strokeWidth={18}
          strokeLinecap="round" strokeDasharray={400} strokeDashoffset={dash} />
        <path d="M300,60 L336,92 L292,116 Z" fill={accent} opacity={t.scale > 0.85 ? 1 : 0} />
      </svg>
    </div>
  );
};

const MoneyRain: React.FC<MotifProps> = ({ spec }) => {
  const frame = useCurrentFrame();
  const bills = 16;
  return (
    <div style={{ position: "absolute", left: spec.x, top: spec.y, transform: "translate(-50%,-50%)", width: 900, height: 700 }}>
      {Array.from({ length: bills }).map((_, i) => {
        const seedX = random(`x${i}`) * 900 - 450;
        const speed = 90 + random(`s${i}`) * 90;
        const y = ((frame * (speed / 60) + random(`o${i}`) * 700) % 780) - 390;
        const rot = (frame * (1 + random(`r${i}`))) % 360;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: 450 + seedX, top: 390 + y,
              width: 74, height: 40, borderRadius: 7,
              background: spec.color || "#7FB77E", border: "2px solid #2f6b3a",
              transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#215a2b", fontWeight: 900, fontFamily: "Arial Black, sans-serif", fontSize: 24,
            }}
          >
            $
          </div>
        );
      })}
    </div>
  );
};

// ── SCENE ICONS (concrete narrative nouns/events) ───────────────────────────
// Not metaphors — the literal SUBJECT of a beat. Recognizable flat pictograms so
// "she survived the crash" shows a crash, not two talking heads. Same pure-frame
// / flat-vector / accent+ink model as the motifs above. A warm highlight (#F7D774)
// is reused for "light" accents (window glow, flame core, spark).
const GLOW = "#F7D774";
const PAPER_ICON = "#F1EFE9";

const Home: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 30, 2);
  const roof = draw(frame, 22, 0);
  const lit = frame > 26 ? 1 : 0;
  return (
    <Frame spec={spec}>
      <rect x={130} y={250} width={260} height={210} rx={8} fill={ink} opacity={0.9 * p} />
      <path d="M104,262 L260,140 L416,262 Z" fill={accent} opacity={roof} transform={`translate(0 ${(1 - roof) * -30})`} />
      <rect x={236} y={352} width={64} height={108} rx={6} fill={accent} opacity={p} />
      <rect x={168} y={300} width={56} height={56} rx={6} fill={lit ? GLOW : ink} opacity={0.9} />
    </Frame>
  );
};

const Family: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const person = (cx: number, cy: number, s: number, fill: string, delay: number) => {
    const sp = spring({ frame, fps, delay, config: { damping: 12, stiffness: 150 } });
    return (
      <g key={cx} transform={`translate(${cx} ${cy + (1 - sp) * 40})`} opacity={sp}>
        <circle cx={0} cy={-70 * s} r={38 * s} fill={fill} />
        <path d={`M${-46 * s},${70 * s} Q0,${-14 * s} ${46 * s},${70 * s} Z`} fill={fill} />
      </g>
    );
  };
  return (
    <Frame spec={spec}>
      {person(150, 300, 1.15, ink, 2)}
      {person(376, 300, 1.15, ink, 8)}
      {person(266, 344, 0.82, accent, 14)}
    </Frame>
  );
};

const Star: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 9, stiffness: 170 } });
  const tw = 0.85 + Math.sin(frame * 0.15) * 0.15;
  return (
    <Frame spec={spec}>
      <g stroke={accent} strokeWidth={10} strokeLinecap="round" opacity={0.5 * sp}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r0 = 172, r1 = 172 + 48 * tw;
          return <line key={i} x1={260 + Math.cos(a) * r0} y1={250 + Math.sin(a) * r0} x2={260 + Math.cos(a) * r1} y2={250 + Math.sin(a) * r1} />;
        })}
      </g>
      <g transform={`translate(260 250) scale(${0.7 + sp * 0.3}) translate(-260 -250)`}>
        <polygon points={spikes(260, 250, 138, 56, 5)} fill={accent} opacity={sp} />
      </g>
    </Frame>
  );
};

const Heart: React.FC<MotifProps> = ({ spec, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const beat = 1 + Math.max(0, Math.sin(frame * 0.35)) * 0.06;
  return (
    <Frame spec={spec}>
      <g transform={`translate(260 300) scale(${sp * beat}) translate(-260 -300)`}>
        <path d="M260,432 C118,330 118,198 210,180 C256,171 260,216 260,216 C260,216 264,171 310,180 C402,198 402,330 260,432 Z" fill={accent} />
      </g>
    </Frame>
  );
};

const Road: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 34, 2);
  const N = 5;
  return (
    <Frame spec={spec}>
      <path d="M150,470 L232,150 L288,150 L370,470 Z" fill={ink} opacity={0.9 * p} />
      {Array.from({ length: N }).map((_, i) => {
        const tt = i / N;
        const y = interpolate(tt, [0, 1], [452, 172]);
        const w = interpolate(tt, [0, 1], [26, 6]);
        const h = interpolate(tt, [0, 1], [40, 12]);
        return <rect key={i} x={260 - w / 2} y={y - h} width={w} height={h} rx={3} fill={accent} opacity={p > tt ? 1 : 0} />;
      })}
      <circle cx={260} cy={150} r={22 * p} fill={accent} opacity={0.85} />
    </Frame>
  );
};

const Storm: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 26, 2);
  return (
    <Frame spec={spec}>
      <g fill={ink} opacity={0.9 * p}>
        <circle cx={200} cy={212} r={64} /><circle cx={282} cy={188} r={84} /><circle cx={358} cy={214} r={62} />
        <rect x={196} y={214} width={166} height={64} rx={30} />
      </g>
      <g stroke={accent} strokeWidth={9} strokeLinecap="round">
        {Array.from({ length: 5 }).map((_, i) => {
          const x = 192 + i * 42;
          const y = 300 + ((frame * 8 + i * 30) % 130);
          return <line key={i} x1={x} y1={y} x2={x - 12} y2={y + 32} opacity={y < 468 ? 0.8 : 0} />;
        })}
      </g>
      <path d="M300,298 L266,372 L300,372 L260,452 L342,350 L306,350 L332,298 Z" fill={GLOW} opacity={Math.sin(frame * 0.4) > 0.5 ? 1 : 0.25} />
    </Frame>
  );
};

const School: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const swing = Math.sin(frame * 0.12) * 8;
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(0 ${(1 - sp) * -24})`}>
        <polygon points="260,170 430,240 260,310 90,240" fill={ink} />
        <path d="M170,276 L170,340 Q260,392 350,340 L350,276" fill={accent} />
        <circle cx={260} cy={240} r={14} fill={accent} />
        <line x1={260} y1={240} x2={360 + swing} y2={240} stroke={accent} strokeWidth={6} />
        <line x1={360 + swing} y1={240} x2={360 + swing} y2={330} stroke={accent} strokeWidth={6} />
        <circle cx={360 + swing} cy={336} r={12} fill={accent} />
      </g>
    </Frame>
  );
};

const Phone: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const bub = spring({ frame, fps, delay: 16, config: { damping: 9, stiffness: 180 } });
  return (
    <Frame spec={spec}>
      <g opacity={sp}>
        <rect x={196} y={150} width={168} height={300} rx={28} fill={ink} />
        <rect x={214} y={186} width={132} height={210} rx={8} fill={PAPER_ICON} />
        <circle cx={280} cy={424} r={12} fill={PAPER_ICON} />
      </g>
      <g transform={`translate(300 210) scale(${bub})`} opacity={bub}>
        <rect x={0} y={-40} width={150} height={92} rx={20} fill={accent} />
        <path d="M20,52 L20,86 L54,52 Z" fill={accent} />
        <g fill={PAPER_ICON}><circle cx={44} cy={6} r={10} /><circle cx={78} cy={6} r={10} /><circle cx={112} cy={6} r={10} /></g>
      </g>
    </Frame>
  );
};

const Ledge: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 30, 2);
  const sway = Math.sin(frame * 0.08) * 4;
  return (
    <Frame spec={spec}>
      <rect x={70} y={150} width={210} height={340} fill={ink} opacity={0.92 * p} />
      <g stroke={ink} strokeWidth={5} opacity={0.22}>
        {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={290} y1={190 + i * 60} x2={454} y2={210 + i * 60} />)}
      </g>
      <g transform={`translate(${250 + sway} 150)`} opacity={p}>
        <circle cx={0} cy={-40} r={20} fill={accent} />
        <rect x={-14} y={-24} width={28} height={54} rx={10} fill={accent} />
      </g>
      <g stroke={accent} strokeWidth={6} strokeLinecap="round" opacity={0.6}>
        <line x1={300} y1={118} x2={382} y2={118} /><line x1={322} y1={148} x2={422} y2={148} />
      </g>
    </Frame>
  );
};

const Medical: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const pulse = draw(frame, 40, 10);
  const LEN = 560;
  return (
    <Frame spec={spec}>
      <g transform={`translate(260 206) scale(${sp})`}>
        <circle cx={0} cy={0} r={96} fill={accent} />
        <rect x={-22} y={-56} width={44} height={112} rx={8} fill={PAPER_ICON} />
        <rect x={-56} y={-22} width={112} height={44} rx={8} fill={PAPER_ICON} />
      </g>
      <path d="M60,390 L170,390 L200,330 L242,460 L282,390 L460,390" fill="none" stroke={ink}
        strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={LEN} strokeDashoffset={LEN * (1 - pulse)} opacity={0.85} />
    </Frame>
  );
};

const Grave: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <Frame spec={spec}>
      <path d="M70,440 Q260,388 450,440 L450,470 L70,470 Z" fill={ink} opacity={0.82} />
      <g opacity={sp} transform={`translate(0 ${(1 - sp) * 24})`}>
        <path d="M186,442 L186,250 Q260,168 334,250 L334,442 Z" fill={ink} />
        <rect x={250} y={276} width={20} height={96} rx={4} fill={accent} />
        <rect x={224} y={300} width={72} height={20} rx={4} fill={accent} />
      </g>
      <circle cx={150} cy={430} r={14} fill={accent} opacity={sp} />
      <line x1={150} y1={430} x2={150} y2={462} stroke={ink} strokeWidth={5} opacity={sp} />
    </Frame>
  );
};

const Notes: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = 4, rows = 3, s = 96, gap = 16;
  const w = cols * s + (cols - 1) * gap, h = rows * s + (rows - 1) * gap;
  const x0 = (BOX - w) / 2, y0 = (BOX - h) / 2;
  return (
    <Frame spec={spec}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const cx = i % cols, cy = Math.floor(i / cols);
        const sp = spring({ frame, fps, delay: 3 + i * 3, config: { damping: 11, stiffness: 180 } });
        const rot = (random(`n${i}`) - 0.5) * 10;
        const fill = i % 3 === 0 ? accent : ink;
        return (
          <g key={i} transform={`translate(${x0 + cx * (s + gap) + s / 2} ${y0 + cy * (s + gap) + s / 2}) scale(${sp}) rotate(${rot})`} opacity={sp}>
            <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={6} fill={fill} opacity={fill === ink ? 0.8 : 1} />
            <line x1={-s / 2 + 16} y1={-10} x2={s / 2 - 16} y2={-10} stroke={PAPER_ICON} strokeWidth={5} opacity={0.7} />
            <line x1={-s / 2 + 16} y1={12} x2={s / 2 - 28} y2={12} stroke={PAPER_ICON} strokeWidth={5} opacity={0.7} />
          </g>
        );
      })}
    </Frame>
  );
};

const Water: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const p = draw(frame, 30, 2);
  const wave = (y: number, amp: number, ph: number, col: string, op: number) => {
    let d = `M0,${y}`;
    for (let x = 0; x <= BOX; x += 40) d += ` Q${x + 20},${(y + Math.sin((x + frame * 4) * 0.02 + ph) * amp).toFixed(1)} ${x + 40},${y}`;
    d += ` L${BOX},${BOX} L0,${BOX} Z`;
    return <path d={d} fill={col} opacity={op * p} />;
  };
  return (
    <Frame spec={spec}>
      {wave(300, 18, 0, ink, 0.35)}
      {wave(342, 22, 1.4, accent, 0.5)}
      {wave(386, 16, 2.6, ink, 0.72)}
    </Frame>
  );
};

const Fire: React.FC<MotifProps> = ({ spec, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const flick = 1 + Math.sin(frame * 0.5) * 0.05;
  return (
    <Frame spec={spec}>
      <g transform={`translate(260 300) scale(${sp * flick})`}>
        <path d="M0,-170 C70,-90 96,-30 96,30 C96,110 40,160 0,160 C-40,160 -96,110 -96,30 C-96,-20 -60,-40 -40,-90 C-30,-40 -8,-40 0,-80 C6,-120 0,-170 0,-170 Z" fill={accent} />
        <path d="M0,-40 C34,0 46,40 46,70 C46,120 22,150 0,150 C-22,150 -46,120 -46,70 C-46,36 -20,20 0,-40 Z" fill={GLOW} />
      </g>
    </Frame>
  );
};

const Crash: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const burst = spring({ frame, fps, delay: 8, config: { damping: 8, stiffness: 200 } });
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(0 ${(1 - sp) * 20})`}>
        <path d="M120,360 L156,300 L300,300 L340,250 L420,300 L440,360 Z" fill={ink} />
        <rect x={120} y={356} width={320} height={24} rx={8} fill={ink} />
        <circle cx={186} cy={392} r={30} fill={ink} /><circle cx={186} cy={392} r={13} fill={PAPER_ICON} />
        <circle cx={378} cy={392} r={30} fill={ink} /><circle cx={378} cy={392} r={13} fill={PAPER_ICON} />
        <path d="M120,360 L156,300 L150,330 L170,320 L156,352 Z" fill={accent} />
      </g>
      <g transform={`translate(150 300) scale(${burst})`} opacity={burst > 0.05 ? 1 : 0}>
        <polygon points={spikes(0, 0, 96, 40, 10)} fill={accent} />
        <polygon points={spikes(0, 0, 56, 22, 10)} fill={GLOW} />
      </g>
    </Frame>
  );
};

const Tree: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const leafY = (frame * 3) % 220;
  const sway = Math.sin(frame * 0.06) * 6;
  return (
    <Frame spec={spec}>
      <path d="M244,460 L236,300 Q260,286 284,300 L276,460 Z" fill={ink} opacity={sp} />
      <g opacity={sp} transform={`translate(${sway} ${(1 - sp) * -20})`}>
        <circle cx={260} cy={220} r={110} fill={accent} />
        <circle cx={186} cy={250} r={72} fill={accent} opacity={0.9} />
        <circle cx={336} cy={250} r={72} fill={accent} opacity={0.9} />
      </g>
      <circle cx={330 + Math.sin(leafY * 0.05) * 20} cy={250 + leafY} r={9} fill={accent} opacity={leafY < 200 ? 0.8 : 0} />
    </Frame>
  );
};

// ── SCENE ICONS · Phase 2 (next frequency tier) ─────────────────────────────
const Work: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(0 ${(1 - sp) * 24})`}>
        <path d="M214,232 Q260,192 306,232" fill="none" stroke={ink} strokeWidth={16} strokeLinecap="round" />
        <rect x={150} y={244} width={220} height={190} rx={16} fill={ink} />
        <rect x={150} y={318} width={220} height={26} fill={accent} />
        <rect x={244} y={300} width={32} height={62} rx={6} fill={accent} />
      </g>
    </Frame>
  );
};

const Game: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const shine = 0.5 + Math.sin(frame * 0.2) * 0.5;
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(260 270) scale(${0.7 + sp * 0.3}) translate(-260 -270)`}>
        <path d="M186,180 L334,180 L320,300 Q260,352 200,300 Z" fill={accent} />
        <path d="M186,196 Q120,196 140,270 Q160,300 200,286" fill="none" stroke={accent} strokeWidth={16} />
        <path d="M334,196 Q400,196 380,270 Q360,300 320,286" fill="none" stroke={accent} strokeWidth={16} />
        <rect x={248} y={330} width={24} height={44} fill={ink} />
        <rect x={196} y={372} width={128} height={26} rx={6} fill={ink} />
        <polygon points={spikes(260, 236, 40, 16, 5)} fill={PAPER_ICON} opacity={0.4 + shine * 0.6} />
      </g>
    </Frame>
  );
};

const War: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const sword = (rot: number) => (
    <g transform={`translate(260 270) rotate(${rot})`}>
      <rect x={-8} y={-150} width={16} height={220} rx={4} fill={ink} />
      <polygon points="-8,-150 8,-150 0,-178" fill={ink} />
      <rect x={-30} y={70} width={60} height={14} rx={4} fill={ink} />
      <rect x={-8} y={84} width={16} height={40} rx={4} fill={ink} />
    </g>
  );
  return (
    <Frame spec={spec}>
      <g opacity={sp}>
        {sword(38)}
        {sword(-38)}
        <path d="M260,200 L340,228 Q340,340 260,384 Q180,340 180,228 Z" fill={accent} />
        <path d="M260,200 L340,228 Q340,340 260,384 Z" fill={ink} opacity={0.18} />
      </g>
    </Frame>
  );
};

const Food: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <Frame spec={spec}>
      <g opacity={sp}>
        <circle cx={260} cy={280} r={120} fill={ink} />
        <circle cx={260} cy={280} r={78} fill={PAPER_ICON} />
        <circle cx={260} cy={280} r={44} fill={accent} />
        <g stroke={ink} strokeWidth={10} strokeLinecap="round">
          <line x1={120} y1={172} x2={120} y2={400} />
          <line x1={104} y1={172} x2={104} y2={222} /><line x1={136} y1={172} x2={136} y2={222} />
        </g>
        <rect x={396} y={172} width={16} height={228} rx={6} fill={ink} />
      </g>
    </Frame>
  );
};

const City: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const buildings = [
    { x: 96, w: 74, h: 200 }, { x: 178, w: 62, h: 300 }, { x: 248, w: 84, h: 250 },
    { x: 340, w: 58, h: 340 }, { x: 406, w: 70, h: 220 },
  ];
  return (
    <Frame spec={spec}>
      {buildings.map((b, i) => {
        const sp = spring({ frame, fps, delay: 3 + i * 4, config: { damping: 13, stiffness: 150 } });
        const h = b.h * sp;
        return (
          <g key={i}>
            <rect x={b.x} y={470 - h} width={b.w} height={h} rx={4} fill={i === 3 ? accent : ink} opacity={i === 3 ? 1 : 0.9} />
            {sp > 0.85
              ? Array.from({ length: Math.floor(h / 46) }).map((_, r) =>
                  [0, 1].map((c) => (
                    <rect key={`${r}-${c}`} x={b.x + 12 + c * (b.w - 34)} y={470 - h + 16 + r * 46} width={16} height={22} fill={GLOW} opacity={0.8} />
                  )),
                )
              : null}
          </g>
        );
      })}
    </Frame>
  );
};

const Photo: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const rot = (1 - sp) * -8;
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(260 280) rotate(${rot}) translate(-260 -280)`}>
        <rect x={140} y={150} width={240} height={260} rx={10} fill={ink} />
        <rect x={162} y={172} width={196} height={166} rx={4} fill={PAPER_ICON} />
        <circle cx={312} cy={210} r={22} fill={accent} />
        <path d="M162,338 L226,270 L280,320 L330,278 L358,306 L358,338 Z" fill={accent} opacity={0.85} />
        <rect x={162} y={356} width={196} height={40} rx={4} fill={PAPER_ICON} opacity={0.5} />
      </g>
    </Frame>
  );
};

const Law: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const strike = Math.max(0, Math.sin(frame * 0.25)) * 10;
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(260 250) rotate(${-18 - strike}) translate(-260 -250)`}>
        <rect x={196} y={150} width={128} height={72} rx={12} fill={ink} />
        <rect x={186} y={150} width={16} height={72} rx={4} fill={accent} />
        <rect x={318} y={150} width={16} height={72} rx={4} fill={accent} />
        <rect x={250} y={218} width={20} height={150} rx={8} fill={ink} />
      </g>
      <rect x={170} y={392} width={180} height={26} rx={8} fill={accent} opacity={sp} />
    </Frame>
  );
};

const Mask: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <Frame spec={spec}>
      <g opacity={sp}>
        <path d="M260,150 Q380,160 372,290 Q360,410 260,410 Q160,410 148,290 Q140,160 260,150 Z" fill={ink} />
        <path d="M196,262 Q222,238 250,262 Q222,278 196,262 Z" fill={PAPER_ICON} />
        <path d="M270,262 Q296,238 324,262 Q296,278 270,262 Z" fill={PAPER_ICON} />
        <path d="M206,330 Q260,388 314,330" fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round" />
        <line x1={148} y1={280} x2={96} y2={264} stroke={accent} strokeWidth={8} strokeLinecap="round" />
        <line x1={372} y1={280} x2={424} y2={264} stroke={accent} strokeWidth={8} strokeLinecap="round" />
      </g>
    </Frame>
  );
};

const Key: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const turn = Math.sin(frame * 0.1) * 6;
  return (
    <Frame spec={spec}>
      <g opacity={sp} transform={`translate(260 270) rotate(${-40 + turn}) translate(-260 -270)`}>
        <circle cx={188} cy={270} r={68} fill={accent} />
        <circle cx={188} cy={270} r={30} fill={PAPER_ICON} />
        <rect x={252} y={252} width={190} height={36} rx={8} fill={ink} />
        <rect x={392} y={288} width={22} height={40} fill={ink} />
        <rect x={352} y={288} width={22} height={30} fill={ink} />
      </g>
    </Frame>
  );
};

const Mirror: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const sheen = interpolate(Math.sin(frame * 0.1), [-1, 1], [-40, 40]);
  return (
    <Frame spec={spec}>
      <g opacity={sp}>
        <ellipse cx={260} cy={236} rx={116} ry={132} fill={ink} />
        <ellipse cx={260} cy={236} rx={90} ry={106} fill={accent} opacity={0.35} />
        <rect x={220 + sheen} y={150} width={26} height={172} rx={12} fill={PAPER_ICON} opacity={0.5} transform="rotate(18 260 236)" />
        <rect x={244} y={358} width={32} height={110} rx={14} fill={ink} />
        <circle cx={260} cy={478} r={22} fill={ink} />
      </g>
    </Frame>
  );
};

// ── Archetypal / Philosophical Metaphors (Anthem, Psychology, Strategy) ─────
const Lightbulb: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 140 } });
  const glowPulse = 0.85 + Math.sin(frame * 0.2) * 0.15;
  return (
    <Frame spec={spec}>
      <g stroke={accent} strokeWidth={8} strokeLinecap="round" opacity={0.6 * sp * glowPulse}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const r0 = 175, r1 = 175 + 40 * glowPulse;
          return <line key={i} x1={260 + Math.cos(a) * r0} y1={210 + Math.sin(a) * r0} x2={260 + Math.cos(a) * r1} y2={210 + Math.sin(a) * r1} />;
        })}
      </g>
      <path
        d="M180,210 C180,145 220,110 260,110 C300,110 340,145 340,210 C340,250 315,275 305,305 L215,305 C205,275 180,250 180,210 Z"
        fill={accent}
        opacity={0.18 * sp}
      />
      <path
        d="M180,210 C180,145 220,110 260,110 C300,110 340,145 340,210 C340,250 315,275 305,305 L215,305 C205,275 180,250 180,210 Z"
        fill="none"
        stroke={ink}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={sp}
      />
      <path
        d="M235,305 L240,200 L250,225 L260,185 L270,225 L280,200 L285,305"
        fill="none"
        stroke={GLOW}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={sp * glowPulse}
      />
      <rect x={220} y={315} width={80} height={16} rx={6} fill={ink} opacity={sp} />
      <rect x={224} y={337} width={72} height={16} rx={6} fill={ink} opacity={sp} />
      <rect x={232} y={359} width={56} height={16} rx={6} fill={ink} opacity={sp} />
      <ellipse cx={260} cy={382} rx={16} ry={8} fill={accent} opacity={sp} />
    </Frame>
  );
};

const ShadowSelf: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const drift = Math.sin(frame * 0.08) * 12;
  return (
    <Frame spec={spec}>
      <line x1={40} y1={440} x2={480} y2={440} stroke={ink} strokeWidth={8} opacity={0.3} strokeLinecap="round" />
      <g transform="translate(180, 240) scale(0.72)" opacity={sp}>
        <circle cx={0} cy={-60} r={32} fill={ink} />
        <path d="M-36,50 L-24,-15 C-24,-25 24,-25 24,-15 L36,50 Z" fill={ink} />
        <rect x={-32} y={50} width={22} height={150} rx={10} fill={ink} />
        <rect x={10} y={50} width={22} height={150} rx={10} fill={ink} />
      </g>
      <g transform={`translate(${330 + drift}, 250) scale(0.75, 0.65) skewX(-24)`} opacity={sp * 0.85}>
        <circle cx={0} cy={-60} r={34} fill={accent} />
        <circle cx={-10} cy={-62} r={5} fill={PAPER_ICON} />
        <circle cx={10} cy={-62} r={5} fill={PAPER_ICON} />
        <path d="M-40,60 L-26,-15 C-26,-25 26,-25 26,-15 L40,60 Z" fill={accent} />
        <rect x={-36} y={60} width={24} height={130} rx={10} fill={accent} />
        <rect x={12} y={60} width={24} height={130} rx={10} fill={accent} />
      </g>
    </Frame>
  );
};

const Puppeteer: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 140 } });
  const tilt = Math.sin(frame * 0.06) * 9;
  return (
    <Frame spec={spec}>
      <g transform={`translate(260, 100) rotate(${tilt}) translate(-260, -100)`} opacity={sp}>
        <rect x={160} y={88} width={200} height={24} rx={6} fill={ink} />
        <rect x={248} y={30} width={24} height={140} rx={6} fill={ink} />
        <circle cx={260} cy={100} r={10} fill={accent} />
      </g>
      <g stroke={ink} strokeWidth={4} opacity={0.35 * sp} strokeDasharray="6,4">
        <line x1={175} y1={100} x2={210} y2={310} />
        <line x1={225} y1={100} x2={242} y2={230} />
        <line x1={295} y1={100} x2={278} y2={230} />
        <line x1={345} y1={100} x2={310} y2={310} />
      </g>
      <g transform={`translate(260, 310) rotate(${-tilt * 0.7}) translate(-260, -310)`} opacity={sp}>
        <circle cx={260} cy={220} r={28} fill={accent} />
        <rect x={236} y={252} width={48} height={90} rx={12} fill={ink} />
        <rect x={194} y={262} width={38} height={14} rx={6} fill={ink} transform="rotate(25 232 268)" />
        <rect x={288} y={262} width={38} height={14} rx={6} fill={ink} transform="rotate(-25 288 268)" />
        <rect x={238} y={345} width={18} height={80} rx={8} fill={ink} />
        <rect x={264} y={345} width={18} height={80} rx={8} fill={ink} />
      </g>
    </Frame>
  );
};

const Iceberg: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 13, stiffness: 110 } });
  const bob = Math.sin(frame * 0.05) * 6;
  return (
    <Frame spec={spec}>
      <line x1={30} y1={210} x2={490} y2={210} stroke={accent} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
      <g transform={`translate(0, ${bob})`} opacity={sp}>
        <polygon points="260,110 305,206 215,206" fill={PAPER_ICON} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        <polygon
          points="215,214 305,214 390,320 340,460 260,490 180,450 140,310"
          fill={accent}
          opacity={0.35}
        />
        <polygon
          points="215,214 305,214 390,320 340,460 260,490 180,450 140,310"
          fill="none"
          stroke={ink}
          strokeWidth={8}
          strokeLinejoin="round"
          opacity={0.7}
        />
      </g>
    </Frame>
  );
};

const Chains: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const breakShift = interpolate(frame, [15, 30], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const broken = frame > 18;
  return (
    <Frame spec={spec}>
      <g transform={`translate(${-breakShift}, 0)`} opacity={sp}>
        <rect x={40} y={232} width={100} height={56} rx={28} fill="none" stroke={ink} strokeWidth={18} />
        <rect x={110} y={232} width={100} height={56} rx={28} fill="none" stroke={ink} strokeWidth={18} />
      </g>
      <g transform="translate(260, 260)" opacity={sp}>
        {broken ? (
          <>
            <polygon points={spikes(0, 0, 56, 20, 8)} fill={accent} />
            <path d="M-28,-24 L-12,-8" stroke={ink} strokeWidth={16} strokeLinecap="round" />
            <path d="M28,24 L12,8" stroke={ink} strokeWidth={16} strokeLinecap="round" />
          </>
        ) : (
          <rect x={-50} y={-28} width={100} height={56} rx={28} fill="none" stroke={accent} strokeWidth={18} />
        )}
      </g>
      <g transform={`translate(${breakShift}, 0)`} opacity={sp}>
        <rect x={310} y={232} width={100} height={56} rx={28} fill="none" stroke={ink} strokeWidth={18} />
        <rect x={380} y={232} width={100} height={56} rx={28} fill="none" stroke={ink} strokeWidth={18} />
      </g>
    </Frame>
  );
};

const Compass: React.FC<MotifProps> = ({ spec, accent, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 11, stiffness: 130 } });
  const needleAngle = interpolate(Math.sin(frame * 0.08), [-1, 1], [-14, 14]);
  return (
    <Frame spec={spec}>
      <g opacity={sp}>
        <circle cx={260} cy={260} r={180} fill="none" stroke={ink} strokeWidth={14} />
        <circle cx={260} cy={260} r={155} fill="none" stroke={accent} strokeWidth={3} strokeDasharray="6,8" opacity={0.6} />
        <text x={260} y={130} fill={accent} fontSize={32} fontWeight="bold" textAnchor="middle" fontFamily={ANTIDOTE_FONT}>N</text>
        <text x={260} y={420} fill={ink} fontSize={24} textAnchor="middle" fontFamily={ANTIDOTE_FONT} opacity={0.6}>S</text>
        <text x={400} y={268} fill={ink} fontSize={24} textAnchor="middle" fontFamily={ANTIDOTE_FONT} opacity={0.6}>E</text>
        <text x={120} y={268} fill={ink} fontSize={24} textAnchor="middle" fontFamily={ANTIDOTE_FONT} opacity={0.6}>W</text>
        <g transform={`translate(260, 260) rotate(${needleAngle}) translate(-260, -260)`}>
          <polygon points="260,140 280,260 260,250 240,260" fill={accent} />
          <polygon points="260,380 280,260 260,270 240,260" fill={ink} opacity={0.8} />
          <circle cx={260} cy={260} r={14} fill={PAPER_ICON} stroke={ink} strokeWidth={5} />
        </g>
      </g>
    </Frame>
  );
};

const REGISTRY: Record<PropSpec["type"], React.FC<MotifProps>> = {
  moneyRain: MoneyRain, coin: Coin, book: Book, arrow: Arrow, shape: Shape,
  barChart: BarChart, lineGrowth: LineGrowth, balance: Balance, ladder: Ladder,
  door: Door, clock: Clock, maze: Maze, spotlight: Spotlight, counter: Counter,
  orbit: Orbit, stack: Stack, crack: Crack, ripple: Ripple, summit: Summit,
  // scene icons — Phase 1
  home: Home, family: Family, star: Star, heart: Heart, road: Road, storm: Storm,
  school: School, phone: Phone, ledge: Ledge, medical: Medical, grave: Grave,
  notes: Notes, water: Water, fire: Fire, crash: Crash, tree: Tree,
  // scene icons — Phase 2
  work: Work, game: Game, war: War, food: Food, city: City, photo: Photo,
  law: Law, mask: Mask, key: Key, mirror: Mirror,
  // Archetypal / Philosophical Metaphors
  lightbulb: Lightbulb, shadowSelf: ShadowSelf, puppeteer: Puppeteer,
  iceberg: Iceberg, chains: Chains, compass: Compass,
};

/** The concrete narrative icons — the vocabulary the `illustration` shot draws from. */
export const SCENE_ICONS: PropSpec["type"][] = [
  "home", "family", "star", "heart", "road", "storm", "school", "phone",
  "ledge", "medical", "grave", "notes", "water", "fire", "crash", "tree",
  "work", "game", "war", "food", "city", "photo", "law", "mask", "key", "mirror",
  "lightbulb", "shadowSelf", "puppeteer", "iceberg", "chains", "compass",
];

/** Motifs that read as the sole subject of an `insert` shot. */
export const INSERT_MOTIFS: PropSpec["type"][] = [
  "barChart", "lineGrowth", "balance", "clock", "maze", "counter",
  "orbit", "stack", "crack", "ripple", "summit", "ladder", "door", "spotlight",
  ...SCENE_ICONS,
];

export const Motif: React.FC<{ spec: PropSpec; accent: string; ink: string }> = ({ spec, accent, ink }) => {
  const Component = REGISTRY[spec.type];
  if (!Component) return null;
  return <Component spec={spec} accent={spec.color || accent} ink={spec.color2 || ink} />;
};
