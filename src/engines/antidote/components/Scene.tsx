import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Everyman } from "../characters/Everyman";
import { KineticText } from "./KineticText";
import { Backdrop } from "./Backdrop";
import { ChapterCard } from "./ChapterCard";
import { transitionRender } from "./Transition";
import { Motif } from "../motifs";
import { resolveBody, shotPreset, stageChar, stageText } from "../shots";
import { DEFAULT_TRANSITION, DEFAULT_VARIANT } from "../schema";
import { enter, pose, ambient, arcOf } from "../movements";
import { interpolate } from "remotion";
import { camera } from "../movements";
import type { SceneSpec, CharacterSpec, ShotName, VariantSpec, CastBible, BodyPlan, HandProp } from "../schema";

/**
 * Scene — one beat of the film.
 *
 * Composition order: backdrop (parallax) → motifs → cast → kinetic copy, all
 * inside the scene camera, with the transition reveal wrapping the whole thing.
 * Staging comes from the SHOT preset unless the scene overrides it, which is
 * what turned "163 identical presenter frames" into an actual shot list.
 */

const mute = (hex: string, amt = 0.55) => {
  const m = String(hex).replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  const g = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  const r = Math.round(((n >> 16) & 255) + (g - ((n >> 16) & 255)) * amt);
  const gg = Math.round(((n >> 8) & 255) + (g - ((n >> 8) & 255)) * amt);
  const b = Math.round((n & 255) + (g - (n & 255)) * amt);
  return `rgb(${r},${gg},${b})`;
};

const Rig: React.FC<{
  variant: VariantSpec; poseValue: ReturnType<typeof pose>; silhouette?: boolean;
  body?: BodyPlan; holds?: HandProp; accent?: string;
}> = ({ variant, poseValue, silhouette, body, holds, accent }) => {
  if (!silhouette) return <Everyman variant={variant} pose={poseValue} body={body} holds={holds} accent={accent} />;
  // Flat dark cut-out: the overShoulder foreground and the silhouette shot.
  // Fully opaque on purpose — any transparency lets the backdrop bleed through
  // the shoulder and turns the rig's overlapping parts into visible seams.
  return (
    <div style={{ filter: "brightness(0)" }}>
      <Everyman variant={variant} pose={poseValue} body={body} holds={holds} accent={accent} />
    </div>
  );
};

/**
 * Who this body looks like. A scene names a ROLE and the look comes from the
 * book's cast bible, so the same protagonist recurs across the film; `variant`
 * is a per-scene override, and `expression` layers the scene's face on top.
 * Configs written before the bible carry a full `variant` and are unaffected.
 */
function resolveVariant(spec: CharacterSpec, cast?: CastBible): VariantSpec {
  const fromRole = spec.role && cast ? cast[spec.role]?.variant : undefined;
  const base = { ...DEFAULT_VARIANT, ...(fromRole ?? {}), ...(spec.variant ?? {}) };
  return spec.expression ? { ...base, expression: spec.expression } : base;
}

// ── a placed, entering, acting character ────────────────────────────────────
const CharacterLayer: React.FC<{
  spec: CharacterSpec; shot: ShotName; index: number; cast?: CastBible;
  durationFrames: number; accent?: string;
}> = ({ spec, shot, index, cast, durationFrames, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const variant = resolveVariant(spec, cast);
  const st = stageChar(shot, spec, index);
  const body = resolveBody(shot, spec);
  const e = enter(spec.enter, frame, fps);
  const p = pose(spec.action, frame + (spec.poseAt ?? 0), fps);
  const scale = st.scale * e.scale;
  // TRAVEL — the figure actually crosses the set over the beat. Without it a
  // `walk` is a gait cycle on a treadmill: the legs move and the person never
  // goes anywhere, which reads worse than not animating the legs at all.
  const travel = spec.travel
    ? interpolate(frame, [0, Math.max(1, durationFrames)], spec.travel, { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: st.x,
        top: st.y,
        opacity: e.opacity,
        filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.14))",
        transform: `translate(-50%, -50%) translate(${e.tx + travel}px, ${e.ty}px) scale(${scale}) scaleX(${st.flip ? -1 : 1})`,
        transformOrigin: "center",
      }}
    >
      <Rig variant={variant} poseValue={p} silhouette={st.silhouette} body={body} holds={spec.holds} accent={accent} />
    </div>
  );
};

// ── the everyman, multiplied — "most people…", "everyone around you…" ───────
const CrowdLayer: React.FC<{ spec: CharacterSpec; shot: ShotName; cast?: CastBible; accent?: string }> = ({ spec, shot, cast, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hero = resolveVariant(spec, cast);
  const st = stageChar(shot, spec, 0);
  const body = resolveBody(shot, spec);
  const full = body === "full";
  const e = enter(spec.enter, frame, fps);
  const total = Math.max(3, Math.min(12, Math.round(spec.crowd ?? 9)));
  // Three depth rows: back row smallest and most muted, hero stands in front.
  // Full-body figures are ~1.6x taller and ~40% narrower on the same anchor, so
  // the rows step further apart vertically and pack tighter horizontally —
  // otherwise a crowd of whole people is a pile of overlapping heads.
  const nBack = Math.min(6, Math.ceil(total * 0.45));
  const nMid = Math.min(5, Math.ceil(total * 0.33));
  const nFront = Math.max(1, total - nBack - nMid);
  const rows = full
    ? [
        // Gaps must clear the figure's own width (~248px at this scale) or the
        // rows overlap; the half-gap stagger stops back-row heads landing
        // directly above front-row heads, which read as one stacked column.
        { n: nBack, z: 0.6, dy: -196, gap: 258, opacity: 0.5, mutedBy: 0.75, stagger: 0.5 },
        { n: nMid, z: 0.8, dy: -92, gap: 296, opacity: 0.72, mutedBy: 0.5, stagger: 0 },
        { n: nFront, z: 1, dy: 34, gap: 330, opacity: 1, mutedBy: 0, stagger: 0.5 },
      ]
    : [
        { n: nBack, z: 0.6, dy: -132, gap: 250, opacity: 0.5, mutedBy: 0.75 },
        { n: nMid, z: 0.8, dy: -58, gap: 300, opacity: 0.72, mutedBy: 0.5 },
        { n: nFront, z: 1, dy: 30, gap: 360, opacity: 1, mutedBy: 0 },
      ];
  return (
    <>
      {rows.map((row, ri) =>
        Array.from({ length: row.n }).map((_, i) => {
          const isHero = ri === 2 && i === Math.floor(row.n / 2);
          const offset = (i - (row.n - 1) / 2 + ((row as { stagger?: number }).stagger ?? 0)) * row.gap;
          const phase = ri * 37 + i * 53; // deterministic desync so nobody breathes in lockstep
          const variant = isHero
            ? hero
            : { ...hero, suit: mute(hero.suit, 0.55 + row.mutedBy * 0.4), shirt: mute(hero.shirt, 0.5), hair: mute(hero.hair, 0.35), expression: "neutral" as const };
          const p = pose(isHero ? spec.action : "idle", frame + phase, fps);
          return (
            <div
              key={`${ri}-${i}`}
              style={{
                position: "absolute",
                left: st.x + offset,
                top: st.y + row.dy,
                opacity: e.opacity * (isHero ? 1 : row.opacity),
                filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.12))",
                transform: `translate(-50%, -50%) translate(${e.tx}px, ${e.ty}px) scale(${st.scale * row.z * e.scale}) scaleX(${i % 2 === 1 && !isHero ? -1 : 1})`,
                transformOrigin: "center",
                zIndex: ri,
              }}
            >
              <Rig variant={variant} poseValue={p} silhouette={st.silhouette} body={body} holds={isHero ? spec.holds : undefined} accent={accent} />
            </div>
          );
        }),
      )}
    </>
  );
};

// ── the scene: backdrop + camera-transformed stage + transition reveal ──────
export const Scene: React.FC<{ scene: SceneSpec; transIn?: number; cast?: CastBible }> = ({ scene, transIn = 0, cast }) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - transIn); // frames since the narration for this scene starts
  // Runtime defaults, not schema defaults: Remotion passes `defaultProps` to the
  // renderer without parsing them, so a config written before the shot grammar
  // has `shot` / `transition` / `bg.accent` genuinely undefined here.
  const preset = shotPreset(scene.shot);
  const transition = scene.transition ?? DEFAULT_TRANSITION;
  const cam = camera(scene.camera ?? { zoom: [1, 1], panX: [0, 0], panY: [0, 0] }, local, scene.durationFrames);
  const t = transitionRender(transition, frame);
  const bg = scene.bg ?? { type: "flat" as const, colors: ["#8FC0E8"], set: "none" as const, texture: "none" as const };
  const accent = transition.color || bg.accent || "#E23B57";
  const ink = bg.accent || "#1E1E22";
  const bodies = preset.dropsCast ? [] : scene.characters ?? [];

  if (scene.shot === "chapterCard" || scene.chapterCard) {
    const cardSpec = scene.chapterCard ?? {
      title: scene.texts[0]?.text || "CHAPTER",
      subtitle: scene.texts[1]?.text,
    };
    return (
      <AbsoluteFill style={t.style}>
        <ChapterCard spec={cardSpec} accent={accent} durationFrames={scene.durationFrames} />
        {t.overlay}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={t.style}>
      <Backdrop bg={bg} cam={cam} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`, transformOrigin: "center" }}>
        {(scene.props ?? []).map((p, i) => {
          // A motif left at scale 1 means "however big this shot wants it";
          // an authored scale is taken literally.
          const s = p.scale ?? 1;
          // A Sequence (layout="none", so it adds no wrapper) shifts the motif's
          // whole internal clock, which is what makes `at` actually delay the
          // drawing-in rather than just its fade.
          // Ambient float: a prop that stops moving after its draw-in is what
          // makes a long scene read as a still. Seeded by index so no two
          // props on the same stage drift in phase.
          const amb = ambient((i * 0.37 + 0.11) % 1, local);
          // The metaphor's arc: what this object DOES over the beat. Runs from
          // the motif's own entrance to the end of the scene, composed on top
          // of the ambient float (ambient keeps it alive, the arc gives it
          // meaning). See movements.arcOf.
          const from = (p.at ?? 0);
          const arc = arcOf(p.arc, local - from, Math.max(1, scene.durationFrames - from));
          return (
            <Sequence key={`p${i}`} from={from + transIn} layout="none" name={`motif-${p.type}`}>
              {/* inset:0 — a transformed wrapper becomes the containing block for the
                  motif's absolute left/top, so it must cover the full stage or
                  every prop snaps to the top-left. */}
              <div style={{ position: "absolute", inset: 0, opacity: arc.opacity, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.14))", transform: `translate(${amb.tx}px, ${amb.ty + arc.ty}px) rotate(${amb.rotate + arc.rotate}deg) scale(${amb.scale * arc.scale})`, transformOrigin: "center" }}>
                <Motif
                  spec={{ ...p, x: p.x ?? preset.motif.x, y: p.y ?? preset.motif.y, scale: s * (s === 1 ? preset.motif.scale : 1) }}
                  accent={accent}
                  ink={ink}
                />
              </div>
            </Sequence>
          );
        })}
        {bodies.map((c, i) =>
          c.crowd && c.crowd > 1 ? (
            <CrowdLayer key={c.id} spec={c} shot={scene.shot} cast={cast} accent={accent} />
          ) : (
            <CharacterLayer key={c.id} spec={c} shot={scene.shot} index={i} cast={cast} durationFrames={scene.durationFrames} accent={accent} />
          ),
        )}
        {(scene.texts ?? []).map((tx, i) => {
          const st = stageText(scene.shot, tx, i);
          // `at` is authored against the narration, so it shifts with the pre-roll
          return <KineticText key={`t${i}`} spec={{ ...tx, x: st.x, y: st.y, size: st.size, at: (tx.at ?? 0) + transIn }} />;
        })}
      </AbsoluteFill>
      {t.overlay}
    </AbsoluteFill>
  );
};
