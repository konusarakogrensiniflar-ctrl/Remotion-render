import React from "react";
import type { HandProp } from "./schema";

/**
 * handprops.tsx — the things a character can actually HOLD.
 *
 * The motif library and the character rig existed side by side and never
 * touched: a beat about a letter drew a 500px letter next to a person whose
 * hands hung at their sides. That is the difference between "an illustration
 * about a letter" and "someone reading a letter", and it is most of what makes
 * the reference channel read as animation rather than as slides.
 *
 * Each glyph draws around its own ORIGIN (0,0) inside roughly a ±62 box, in the
 * rig's own 400×600/400×900 viewBox units, so the rig can drop it straight into
 * the hand group and let the arm's rotation carry it. Pure vector, two colors,
 * no per-frame math — a held prop costs the renderer nothing.
 */

type G = React.FC<{ ink: string; accent: string }>;

const Book: G = ({ ink, accent }) => (
  <g>
    <path d="M-52,-34 L-2,-26 L-2,38 L-52,30 Z" fill={accent} />
    <path d="M52,-34 L2,-26 L2,38 L52,30 Z" fill={accent} />
    <path d="M-52,-34 L-2,-26 L2,-26 L52,-34 L52,-40 L2,-32 L-2,-32 L-52,-40 Z" fill={ink} opacity={0.8} />
    <rect x={-3} y={-30} width={6} height={70} fill={ink} opacity={0.75} />
  </g>
);

const Phone: G = ({ ink, accent }) => (
  <g>
    <rect x={-28} y={-48} width={56} height={96} rx={10} fill={ink} />
    <rect x={-21} y={-38} width={42} height={70} rx={4} fill={accent} opacity={0.85} />
    <circle cx={0} cy={40} r={5} fill={accent} opacity={0.5} />
  </g>
);

const Key: G = ({ ink, accent }) => (
  <g>
    <circle cx={-28} cy={0} r={22} fill="none" stroke={accent} strokeWidth={11} />
    <rect x={-8} y={-6} width={62} height={12} rx={4} fill={accent} />
    <rect x={30} y={4} width={10} height={18} rx={3} fill={accent} />
    <rect x={48} y={4} width={10} height={14} rx={3} fill={accent} />
  </g>
);

const Notes: G = ({ ink, accent }) => (
  <g>
    <rect x={-44} y={-46} width={88} height={92} rx={5} fill="#FFFFFF" />
    <rect x={-44} y={-46} width={88} height={16} fill={accent} />
    <g stroke={ink} strokeWidth={5} strokeLinecap="round" opacity={0.55}>
      <line x1={-30} y1={-14} x2={30} y2={-14} />
      <line x1={-30} y1={4} x2={30} y2={4} />
      <line x1={-30} y1={22} x2={8} y2={22} />
    </g>
  </g>
);

const Letter: G = ({ ink, accent }) => (
  <g>
    <rect x={-56} y={-36} width={112} height={72} rx={5} fill="#FFFFFF" stroke={ink} strokeWidth={4} />
    <path d="M-56,-36 L0,10 L56,-36" fill="none" stroke={accent} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

const Coin: G = ({ ink, accent }) => (
  <g>
    <circle cx={0} cy={0} r={40} fill={accent} />
    <circle cx={0} cy={0} r={40} fill="none" stroke={ink} strokeWidth={5} opacity={0.5} />
    <text x={0} y={15} textAnchor="middle" fontSize={46} fontWeight={800} fill={ink} opacity={0.7} fontFamily="Georgia, serif">$</text>
  </g>
);

const Cup: G = ({ ink, accent }) => (
  <g>
    <path d="M-34,-26 L34,-26 L28,34 Q26,44 14,44 L-14,44 Q-26,44 -28,34 Z" fill={accent} />
    <path d="M34,-14 Q58,-12 56,8 Q54,26 32,26" fill="none" stroke={accent} strokeWidth={9} />
    <rect x={-36} y={-32} width={72} height={10} rx={4} fill={ink} opacity={0.75} />
  </g>
);

const Lightbulb: G = ({ ink, accent }) => (
  <g>
    <path d="M0,-52 Q34,-52 34,-16 Q34,6 18,20 L18,32 L-18,32 L-18,20 Q-34,6 -34,-16 Q-34,-52 0,-52 Z" fill={accent} />
    <rect x={-18} y={34} width={36} height={9} rx={3} fill={ink} />
    <rect x={-14} y={46} width={28} height={9} rx={3} fill={ink} />
    <path d="M-10,-4 L0,-22 L10,-4" fill="none" stroke={ink} strokeWidth={5} opacity={0.55} />
  </g>
);

const Mask: G = ({ ink, accent }) => (
  <g>
    <path d="M-46,-30 Q0,-44 46,-30 Q46,20 0,44 Q-46,20 -46,-30 Z" fill={accent} />
    <ellipse cx={-18} cy={-8} rx={11} ry={7} fill={ink} />
    <ellipse cx={18} cy={-8} rx={11} ry={7} fill={ink} />
    <path d="M-14,20 Q0,28 14,20" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
    <rect x={44} y={-14} width={22} height={6} rx={3} fill={ink} opacity={0.6} />
  </g>
);

const Photo: G = ({ ink, accent }) => (
  <g>
    <rect x={-46} y={-40} width={92} height={84} rx={4} fill="#FFFFFF" stroke={ink} strokeWidth={4} />
    <rect x={-38} y={-32} width={76} height={54} fill={accent} opacity={0.55} />
    <circle cx={-14} cy={-14} r={9} fill={ink} opacity={0.5} />
    <path d="M-38,22 L-8,-4 L14,14 L30,2 L38,22 Z" fill={ink} opacity={0.5} />
  </g>
);

const Mirror: G = ({ ink, accent }) => (
  <g>
    <ellipse cx={0} cy={-10} rx={36} ry={44} fill={accent} opacity={0.55} stroke={ink} strokeWidth={7} />
    <path d="M-16,-30 L6,-4" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
    <rect x={-7} y={32} width={14} height={30} rx={5} fill={ink} />
  </g>
);

const Flower: G = ({ ink, accent }) => (
  <g>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-24} rx={13} ry={22} fill={accent} transform={`rotate(${a} 0 -4)`} />
    ))}
    <circle cx={0} cy={-4} r={11} fill={ink} opacity={0.75} />
    <path d="M0,6 Q4,32 0,54" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g>
);

const Compass: G = ({ ink, accent }) => (
  <g>
    <circle cx={0} cy={0} r={40} fill="#FFFFFF" stroke={ink} strokeWidth={6} />
    <path d="M0,-26 L11,4 L0,26 L-11,4 Z" fill={accent} />
    <circle cx={0} cy={0} r={5} fill={ink} />
  </g>
);

const Briefcase: G = ({ ink, accent }) => (
  <g>
    <rect x={-52} y={-22} width={104} height={68} rx={7} fill={accent} />
    <rect x={-52} y={0} width={104} height={9} fill={ink} opacity={0.35} />
    <path d="M-18,-22 L-18,-34 Q-18,-40 -12,-40 L12,-40 Q18,-40 18,-34 L18,-22" fill="none" stroke={ink} strokeWidth={7} />
    <rect x={-9} y={-2} width={18} height={14} rx={3} fill={ink} opacity={0.6} />
  </g>
);

export const HAND_PROPS: Record<HandProp, G> = {
  book: Book, phone: Phone, key: Key, notes: Notes, letter: Letter, coin: Coin,
  cup: Cup, lightbulb: Lightbulb, mask: Mask, photo: Photo, mirror: Mirror,
  flower: Flower, compass: Compass, briefcase: Briefcase,
};

/**
 * HeldProp — the glyph, placed at the rig's hand.
 *
 * Rendered INSIDE the arm group, so it inherits the arm's rotation for free:
 * raise the arm and the object comes with it, exactly as a real rig would.
 */
export const HeldProp: React.FC<{ prop: HandProp; ink: string; accent: string; scale?: number }> = ({ prop, ink, accent, scale = 1 }) => {
  const Glyph = HAND_PROPS[prop];
  if (!Glyph) return null;
  return (
    <g transform={`scale(${scale})`}>
      <Glyph ink={ink} accent={accent} />
    </g>
  );
};
