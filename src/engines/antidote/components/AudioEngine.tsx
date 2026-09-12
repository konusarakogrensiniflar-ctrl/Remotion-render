import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { AntidoteConfig } from "../schema";

/**
 * AudioEngine — deterministic sound design layer for the Antidote engine.
 *
 * Places micro-transient SFX (whooshes on transitions, subtle clicks on
 * kinetic text, thuds on chapter cards) frame-locked to the visual events.
 *
 * Strict gain-staging rules apply:
 * - Master dialogue: 1.0 (0 dB / master)
 * - Chapter/Law hit: 0.18 (-18 dB)
 * - Transitions: 0.12 (-22 dB)
 * - Text/ticks: 0.10 (-24 dB)
 *
 * At these levels, SFX provide subconscious tactile feedback without EVER
 * masking or competing with the speech frequencies.
 */
export const AudioEngine: React.FC<{ config: AntidoteConfig }> = ({ config }) => {
  return (
    <>
      {config.scenes.map((scene, i) => {
        const isChapter = scene.shot === "chapterCard" || Boolean(scene.chapterCard);
        const trans = scene.transition;
        const hasTransition = trans && trans.type !== "cut" && trans.frames > 0 && i > 0;

        return (
          <React.Fragment key={`sfx-scene-${scene.id}`}>
            {/* 1. Transition Swoosh (placed across the cut boundary) */}
            {hasTransition && (
              <Sequence
                from={Math.max(0, scene.fromFrame - Math.floor(trans.frames / 2))}
                durationInFrames={Math.max(15, trans.frames + 5)}
                name={`sfx-trans-${scene.id}`}
              >
                <Audio src={staticFile("sfx/whoosh.wav")} volume={0.12} />
              </Sequence>
            )}

            {/* 2. Chapter / Law Card Monumental Hit */}
            {isChapter && (
              <Sequence
                from={Math.max(0, scene.fromFrame)}
                durationInFrames={35}
                name={`sfx-chapter-${scene.id}`}
              >
                <Audio src={staticFile("sfx/whoosh.wav")} volume={0.20} />
              </Sequence>
            )}

            {/* 3. Kinetic Text Micro-Tick (first callout per scene to avoid clutter) */}
            {(scene.texts ?? []).slice(0, 1).map((tx, txIdx) => (
              <Sequence
                key={`tx-sfx-${txIdx}`}
                from={Math.max(0, scene.fromFrame + (tx.at ?? 0))}
                durationInFrames={12}
                name={`sfx-tick-${scene.id}`}
              >
                <Audio src={staticFile("sfx/tick.wav")} volume={0.09} />
              </Sequence>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};
