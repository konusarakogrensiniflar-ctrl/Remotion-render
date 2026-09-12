import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadType } from "@remotion/google-fonts/SpecialElite";

const { fontFamily: DISPLAY } = loadDisplay();
const { fontFamily: TYPE } = loadType();

// ── Locked visual system (Vox / paper-cutout) ──────────────────────────────
const PAPER = "#DAD9D5";
const INK = "#1A1A1A";
const RED = "#E04329";
const HEADLINE = "'Arial Black', 'Arial Black Std', Arial, sans-serif";

const BG = "broll-ocean-tanker/mo-photoshop-background.png";
const AUDIO = "audio/single_dad_dilemma.m4a";

export const singleDadDilemmaVoxSchema = z.object({});
export const SINGLE_DAD_DILEMMA_VOX_DURATION = 1320; // 44s @30fps

// Shared locked paper background + soft-light wash.
const PaperBackground: React.FC = () => (
  <>
    <Img
      src={staticFile(BG)}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(63,54,42,0.12)), radial-gradient(circle at 50% 60%, rgba(255,255,255,0.20), transparent 42%)",
        mixBlendMode: "soft-light",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  </>
);

// Red marker underline that draws in horizontally.
const MarkerUnderline: React.FC<{
  startFrame: number;
  width: number;
  height?: number;
  color?: string;
  rotate?: number;
}> = ({ startFrame, width, height = 16, color = RED, rotate = -1.2 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        width: width * p,
        height,
        backgroundColor: color,
        borderRadius: height,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "left center",
        opacity: 0.92,
      }}
    />
  );
};

// A word that springs up + fades in, staggered by index.
const KineticWords: React.FC<{
  text: string;
  startFrame: number;
  perWord?: number;
  fontSize: number;
  color?: string;
  fontFamily?: string;
  weight?: number | string;
  letterSpacing?: number;
  lineHeight?: number;
  maxWidth?: number;
  align?: "left" | "center";
}> = ({
  text,
  startFrame,
  perWord = 3,
  fontSize,
  color = INK,
  fontFamily = HEADLINE,
  weight = 900,
  letterSpacing = 0,
  lineHeight = 1.02,
  maxWidth = 1500,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `${fontSize * 0.14}px ${fontSize * 0.32}px`,
        maxWidth,
        justifyContent: align === "center" ? "center" : "flex-start",
        lineHeight,
      }}
    >
      {words.map((w, i) => {
        const sf = startFrame + i * perWord;
        const s = spring({
          frame: frame - sf,
          fps,
          config: { damping: 16, mass: 0.6, stiffness: 120 },
          durationInFrames: 20,
        });
        const y = interpolate(s, [0, 1], [46, 0]);
        const op = interpolate(frame, [sf, sf + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity: op,
              fontFamily,
              fontWeight: weight,
              fontSize,
              color,
              letterSpacing,
              textTransform: "uppercase",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Halftone-treated image inside a framed card, with an offset red stroke box.
const HalftoneCard: React.FC<{
  asset: string;
  startFrame: number;
  width: number;
  height: number;
  strokeX?: number;
  strokeY?: number;
  tint?: string;
}> = ({ asset, startFrame, width, height, strokeX = 22, strokeY = 20, tint = RED }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 110 },
    durationInFrames: 26,
  });
  const rise = interpolate(s, [0, 1], [90, 0]);
  const op = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        transform: `translateY(${rise}px)`,
        opacity: op,
      }}
    >
      {/* offset red stroke frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${strokeX}px, ${strokeY}px)`,
          backgroundColor: tint,
        }}
      />
      {/* image with halftone / duotone treatment */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", border: `4px solid ${INK}` }}>
        <Img
          src={staticFile(asset)}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) contrast(1.35) brightness(1.02)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: tint,
            mixBlendMode: "multiply",
            opacity: 0.22,
          }}
        />
        {/* halftone dot texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(${INK} 1px, transparent 1.4px)`,
            backgroundSize: "5px 5px",
            mixBlendMode: "overlay",
            opacity: 0.35,
          }}
        />
      </div>
    </div>
  );
};

// ── Beat scenes ────────────────────────────────────────────────────────────

const BeatHook: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <KineticWords text="Let's unpack this" startFrame={4} fontSize={40} color={RED} letterSpacing={6} />
        <MarkerUnderline startFrame={22} width={360} />
      </div>
      <KineticWords
        text="Carla Sorensen"
        startFrame={34}
        perWord={6}
        fontSize={150}
        fontFamily={DISPLAY}
        weight={800}
      />
      <div style={{ opacity: 0.85 }}>
        <KineticWords
          text="the highly praised world of"
          startFrame={64}
          perWord={2}
          fontSize={34}
          color={INK}
          weight={600}
          letterSpacing={2}
        />
      </div>
    </div>
  </AbsoluteFill>
);

const BeatTitle: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 70, paddingInline: 120 }}>
      <HalftoneCard asset="scenes/single-dad-vox/dad-child.png" startFrame={6} width={520} height={620} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <KineticWords text="The Kings · Book Two" startFrame={20} perWord={2} fontSize={34} color={RED} weight={800} letterSpacing={4} align="left" maxWidth={720} />
          <MarkerUnderline startFrame={34} width={300} height={12} />
        </div>
        <KineticWords text="Single Dad Dilemma" startFrame={40} perWord={5} fontSize={116} align="left" maxWidth={720} lineHeight={0.98} />
      </div>
    </div>
  </AbsoluteFill>
);

const BeatMoreThan: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, maxWidth: 1500 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <KineticWords text="More than a" startFrame={4} fontSize={70} color={INK} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <KineticWords text="Romance Novel" startFrame={16} perWord={4} fontSize={128} color={RED} />
          <MarkerUnderline startFrame={40} width={720} height={20} />
        </div>
      </div>
      <div style={{ opacity: 0.9 }}>
        <KineticWords text="the structure is something else" startFrame={72} perWord={2} fontSize={40} color={INK} weight={600} letterSpacing={2} />
      </div>
    </div>
  </AbsoluteFill>
);

const MasterItem: React.FC<{ label: string; startFrame: number; index: number }> = ({ label, startFrame, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { damping: 16, mass: 0.6, stiffness: 120 }, durationInFrames: 18 });
  const x = interpolate(s, [0, 1], [-60, 0]);
  const op = interpolate(frame, [startFrame, startFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `translateX(${x}px)`, opacity: op }}>
      <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 48, color: RED }}>{`0${index + 1}`}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 72, color: INK, textTransform: "uppercase" }}>{label}</span>
        <MarkerUnderline startFrame={startFrame + 6} width={label.length * 42} height={10} />
      </div>
    </div>
  );
};

const BeatMasterclass: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <KineticWords text="A masterclass in" startFrame={2} fontSize={56} color={INK} align="left" maxWidth={900} />
      <MasterItem label="Trope" startFrame={22} index={0} />
      <MasterItem label="Execution" startFrame={40} index={1} />
      <MasterItem label="Character Depth" startFrame={58} index={2} />
    </div>
  </AbsoluteFill>
);

const BeatFootball: React.FC = () => {
  const frame = useCurrentFrame();
  const obliterate = interpolate(frame, [150, 168], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [150, 175], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40, paddingInline: 90 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <HalftoneCard asset="scenes/single-dad-vox/football-stadium.png" startFrame={4} width={560} height={430} tint={RED} />
          <KineticWords text="high-stakes world" startFrame={20} perWord={2} fontSize={34} color={INK} weight={800} letterSpacing={2} />
        </div>
        <div style={{ fontFamily: HEADLINE, fontWeight: 900, fontSize: 64, color: RED, opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          VS
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <HalftoneCard asset="scenes/single-dad-vox/defenses-man.png" startFrame={70} width={430} height={430} tint={INK} />
          <KineticWords text="emotional defenses" startFrame={86} perWord={2} fontSize={34} color={INK} weight={800} letterSpacing={2} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 90,
          transform: `scale(${scale})`,
          opacity: obliterate,
          fontFamily: HEADLINE,
          fontWeight: 900,
          fontSize: 92,
          color: RED,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        Obliterated
      </div>
    </AbsoluteFill>
  );
};

// Char-by-char typewriter punchline (SpecialElite).
const BeatSurgical: React.FC = () => {
  const frame = useCurrentFrame();
  const line = "A surgical operation disguised as a happily ever after.";
  const start = 8;
  const perChar = 2.2;
  const shown = Math.max(0, Math.floor((frame - start) / perChar));
  const text = line.slice(0, shown);
  const cursorOn = Math.floor(frame / 7) % 2 === 0;
  const vignette = interpolate(frame, [120, 165], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          maxWidth: 1300,
          textAlign: "center",
          fontFamily: TYPE,
          fontSize: 76,
          lineHeight: 1.25,
          color: INK,
        }}
      >
        {text}
        <span style={{ color: RED, opacity: cursorOn ? 1 : 0 }}>▌</span>
      </div>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 460px rgba(20,15,10,${vignette})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Master sequence (timed to captions.vtt) ────────────────────────────────
export const SingleDadDilemmaVox: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <Audio src={staticFile(AUDIO)} />
      <PaperBackground />
      {/* B1 Hook + author  0.0–7.4s */}
      <Sequence from={0} durationInFrames={222}>
        <BeatHook />
      </Sequence>
      {/* B2 Book title  7.4–14.0s */}
      <Sequence from={222} durationInFrames={198}>
        <BeatTitle />
      </Sequence>
      {/* B3 More than a romance novel  14.0–21.3s */}
      <Sequence from={420} durationInFrames={219}>
        <BeatMoreThan />
      </Sequence>
      {/* B4 Masterclass list  21.3–27.8s */}
      <Sequence from={639} durationInFrames={195}>
        <BeatMasterclass />
      </Sequence>
      {/* B5 Football vs emotional defenses  27.8–38.5s */}
      <Sequence from={834} durationInFrames={321}>
        <BeatFootball />
      </Sequence>
      {/* B6 Surgical operation punchline  38.5–44.0s */}
      <Sequence from={1155} durationInFrames={165}>
        <BeatSurgical />
      </Sequence>
    </AbsoluteFill>
  );
};
