import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { loadFont as loadTypewriter } from "@remotion/google-fonts/SpecialElite";

export const BROLL_EMPIRE_BILL_SCENE_DURATION = 240;

const typewriter = loadTypewriter();

export const brollEmpireBillSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),
  line1: z.string().default("EMPIRES DON'T END WITH A WAR."),
  line2: z.string().default("THEY END WITH A BILL THEY CAN NO LONGER PAY."),
  textColor: z.string().default("#1A1A1A"),
  accentColor: z.string().default("#E04329"),
  accentLine2: z.boolean().default(false),
  fontSize: z.number().default(60),
  containerWidth: z.number().default(1500),

  startFrame: z.number().default(10),
  perCharFrames: z.number().default(2),
  periodPauseFrames: z.number().default(18),
  commaPauseFrames: z.number().default(8),
  gapFrames: z.number().default(22),

  cursorChar: z.string().default("▌"),
  cursorBlinkFrames: z.number().default(7),

  vignetteStartFrame: z.number().default(200),
  vignetteEndFrame: z.number().default(240),
  vignetteIntensity: z.number().default(0.34),

  // Burning $100 bill (transparent webm)
  moneyAsset: z.string().default("broll-empire-bill/burning-bill.webm"),
  moneyX: z.number().default(0),
  moneyY: z.number().default(-208),
  moneyScale: z.number().default(0.6),
  moneyOpacity: z.number().default(1),
  moneyStartFrame: z.number().default(0),
  moneyFadeFrames: z.number().default(22),
});

export type BrollEmpireBillSceneProps = z.infer<
  typeof brollEmpireBillSceneSchema
>;

export const BrollEmpireBillScene: React.FC<BrollEmpireBillSceneProps> = ({
  backgroundAsset = "broll-ocean-tanker/mo-photoshop-background.png",
  line1 = "EMPIRES DON'T END WITH A WAR.",
  line2 = "THEY END WITH A BILL THEY CAN NO LONGER PAY.",
  textColor = "#1A1A1A",
  accentColor = "#E04329",
  accentLine2 = false,
  fontSize = 60,
  containerWidth = 1500,
  startFrame = 10,
  perCharFrames = 2,
  periodPauseFrames = 18,
  commaPauseFrames = 8,
  gapFrames = 22,
  cursorChar = "▌",
  cursorBlinkFrames = 7,
  vignetteStartFrame = 200,
  vignetteEndFrame = 240,
  vignetteIntensity = 0.34,
  moneyAsset = "broll-empire-bill/burning-bill.webm",
  moneyX = 0,
  moneyY = -208,
  moneyScale = 0.6,
  moneyOpacity = 1,
  moneyStartFrame = 0,
  moneyFadeFrames = 22,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  const moneyWidth = 1920 * moneyScale;
  const moneyHeight = (moneyWidth * 9) / 16;
  const moneyFadeIn = interpolate(
    frame,
    [moneyStartFrame, moneyStartFrame + moneyFadeFrames],
    [0, moneyOpacity],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Build a cumulative reveal timeline: line1 chars, an inter-sentence gap,
  // then line2 chars. Sentence/clause punctuation adds extra dwell.
  let t = 0;
  const line1Ends = [...line1].map((ch) => {
    t += perCharFrames;
    if (ch === ".") t += periodPauseFrames;
    else if (ch === "," || ch === ";") t += commaPauseFrames;
    return t;
  });
  t += gapFrames;
  const line2Ends = [...line2].map((ch) => {
    t += perCharFrames;
    if (ch === ".") t += periodPauseFrames;
    else if (ch === "," || ch === ";") t += commaPauseFrames;
    return t;
  });

  const line1Count = line1Ends.filter((e) => e <= elapsed).length;
  const line2Count = line2Ends.filter((e) => e <= elapsed).length;

  const line1Done = line1Count >= line1.length;
  const line2Done = line2Count >= line2.length;
  const typingStarted = elapsed >= 0;

  // Which line currently owns the cursor.
  const cursorOnLine1 = typingStarted && !line1Done;
  const cursorOnLine2 = typingStarted && line1Done && !line2Done;
  const cursorAtEnd = typingStarted && line1Done && line2Done;
  const cursorVisible =
    typingStarted &&
    Math.floor(frame / Math.max(1, cursorBlinkFrames)) % 2 === 0;

  const cursor = (
    <span style={{ opacity: cursorVisible ? 1 : 0 }}>{cursorChar}</span>
  );

  const minLineHeight = fontSize * 1.5;

  const vignette = interpolate(
    frame,
    [vignetteStartFrame, vignetteEndFrame],
    [0, vignetteIntensity],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#DAD9D5", overflow: "hidden" }}>
      <Img
        src={staticFile(backgroundAsset)}
        alt="Locked shared paper background"
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
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(63,54,42,0.12)), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16), transparent 44%)",
          mixBlendMode: "soft-light",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Burning $100 bill */}
      {frame >= moneyStartFrame ? (
        <OffthreadVideo
          src={staticFile(moneyAsset)}
          muted
          transparent
          style={{
            position: "absolute",
            left: 960 + moneyX,
            top: 540 + moneyY,
            width: moneyWidth,
            height: moneyHeight,
            transform: "translate(-50%, -50%)",
            opacity: moneyFadeIn,
            filter: "drop-shadow(0 18px 26px rgba(40,24,10,0.34))",
            zIndex: 6,
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          zIndex: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: containerWidth,
            fontFamily: typewriter.fontFamily,
            fontSize,
            lineHeight: 1.5,
            letterSpacing: 0.5,
            textAlign: "left",
          }}
        >
          <div style={{ minHeight: minLineHeight, color: textColor }}>
            {line1.slice(0, line1Count)}
            {cursorOnLine1 ? cursor : null}
          </div>
          <div
            style={{
              minHeight: minLineHeight,
              color: accentLine2 ? accentColor : textColor,
            }}
          >
            {line2.slice(0, line2Count)}
            {cursorOnLine2 || cursorAtEnd ? cursor : null}
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        aria-hidden="true"
        style={{
          zIndex: 30,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 50%, transparent 42%, rgba(20,14,8,1) 100%)",
          opacity: vignette,
        }}
      />
    </AbsoluteFill>
  );
};

export const defaultBrollEmpireBillSceneProps: BrollEmpireBillSceneProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  line1: "EMPIRES DON'T END WITH A WAR.",
  line2: "THEY END WITH A BILL THEY CAN NO LONGER PAY.",
  textColor: "#1A1A1A",
  accentColor: "#E04329",
  accentLine2: false,
  fontSize: 60,
  containerWidth: 1500,
  startFrame: 10,
  perCharFrames: 2,
  periodPauseFrames: 18,
  commaPauseFrames: 8,
  gapFrames: 22,
  cursorChar: "▌",
  cursorBlinkFrames: 7,
  vignetteStartFrame: 200,
  vignetteEndFrame: 240,
  vignetteIntensity: 0.34,
  moneyAsset: "broll-empire-bill/burning-bill.webm",
  moneyX: 0,
  moneyY: -208,
  moneyScale: 0.6,
  moneyOpacity: 1,
  moneyStartFrame: 0,
  moneyFadeFrames: 22,
};
