import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { loadFont as loadComic } from "@remotion/google-fonts/Bangers";

export const BROLL_DOLLAR_DECLINE_SCENE_DURATION = 180;

const comic = loadComic();

// Native aspect ratios of the supplied cutouts.
const PEOPLE_AR = 1024 / 765;
const BUILDING_AR = 2000 / 1334;

export const brollDollarDeclineSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),

  // Midground: Putin & Xi
  peopleAsset: z.string().default("broll-dollar-yuan/putin-xi.png"),
  peopleX: z.number().default(0),
  peopleY: z.number().default(150),
  peopleWidth: z.number().default(1180),
  peopleStartFrame: z.number().default(30),
  peopleRisePx: z.number().default(410),
  peopleRiseDurationFrames: z.number().default(42),

  // Peace-deal style offset stroke on the people cutout
  strokeColor: z.string().default("#E04329"),
  strokeOpacity: z.number().default(0.95),
  peopleStrokeX: z.number().default(-26),
  peopleStrokeY: z.number().default(8),

  // Foreground: Tiananmen
  buildingAsset: z.string().default("broll-dollar-yuan/china-building.png"),
  buildingX: z.number().default(0),
  buildingWidth: z.number().default(1240),
  buildingBottom: z.number().default(-110),
  buildingStartFrame: z.number().default(6),
  buildingRisePx: z.number().default(360),
  buildingRiseDurationFrames: z.number().default(40),

  // Bubble styling
  bubbleAccentColor: z.string().default("#E04329"),
  bubbleTextColor: z.string().default("#1A1A1A"),
  bubbleFontSize: z.number().default(50),

  // Xi bubble (doodle)
  xiBubbleAsset: z.string().default("broll-dollar-yuan/bubble-round.png"),
  xiTextPrefix: z.string().default("Let's trade in"),
  xiTextAccent: z.string().default("Yuan ¥"),
  xiBubbleX: z.number().default(650),
  xiBubbleY: z.number().default(178),
  xiBubbleWidth: z.number().default(480),
  xiBubbleFlipX: z.boolean().default(false),
  xiBubbleTilt: z.number().default(-4),
  xiBubbleStartFrame: z.number().default(82),
  xiTextTopPct: z.number().default(18),
  xiTextHeightPct: z.number().default(48),
  xiTextWidthPct: z.number().default(72),

  // Putin bubble (doodle)
  putinBubbleAsset: z.string().default("broll-dollar-yuan/bubble-rect.png"),
  putinTextPrefix: z.string().default("Ok,"),
  putinTextAccent: z.string().default("deal!"),
  putinBubbleX: z.number().default(1336),
  putinBubbleY: z.number().default(156),
  putinBubbleWidth: z.number().default(380),
  putinBubbleFlipX: z.boolean().default(false),
  putinBubbleTilt: z.number().default(4),
  putinBubbleStartFrame: z.number().default(112),
  putinTextTopPct: z.number().default(10),
  putinTextHeightPct: z.number().default(54),
  putinTextWidthPct: z.number().default(80),
});

export type BrollDollarDeclineSceneProps = z.infer<
  typeof brollDollarDeclineSceneSchema
>;

const SHADOW = "rgba(50, 40, 27, 0.34)";

// Aspect ratio (height / width) for the doodle bubbles, keyed by asset.
const BUBBLE_AR: Record<string, number> = {
  "broll-dollar-yuan/bubble-oval.png": 918 / 1300,
  "broll-dollar-yuan/bubble-square.png": 1109 / 884,
  "broll-dollar-yuan/bubble-long.png": 423 / 1300,
  "broll-dollar-yuan/bubble-round.png": 1222 / 1300,
  "broll-dollar-yuan/bubble-rect.png": 540 / 1300,
};

const SpeechDoodle: React.FC<{
  asset: string;
  prefix: string;
  accent: string;
  accentColor: string;
  textColor: string;
  fontSize: number;
  x: number;
  y: number;
  width: number;
  flipX: boolean;
  tilt: number;
  startFrame: number;
  textTopPct: number;
  textHeightPct: number;
  textWidthPct: number;
}> = ({
  asset,
  prefix,
  accent,
  accentColor,
  textColor,
  fontSize,
  x,
  y,
  width,
  flipX,
  tilt,
  startFrame,
  textTopPct,
  textHeightPct,
  textWidthPct,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 9, mass: 0.6, stiffness: 150 },
    durationInFrames: 22,
  });
  const opacity = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const float = local > 0 ? Math.sin(local * 0.12) * 5 : 0;

  const height = width * (BUBBLE_AR[asset] ?? 0.75);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        width,
        height,
        transform: `translate(-50%, -50%) scale(${pop}) rotate(${tilt}deg)`,
        transformOrigin: "center 150%",
        opacity,
        zIndex: 30,
        willChange: "transform, opacity",
      }}
    >
      <Img
        src={staticFile(asset)}
        alt="Speech bubble"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          transform: flipX ? "scaleX(-1)" : "none",
          filter: `drop-shadow(0 14px 16px ${SHADOW})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: `${textTopPct}%`,
          height: `${textHeightPct}%`,
          left: `${(100 - textWidthPct) / 2}%`,
          width: `${textWidthPct}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: comic.fontFamily,
          fontSize,
          lineHeight: 1.02,
          letterSpacing: 1.2,
          color: textColor,
        }}
      >
        <span>
          {prefix}{" "}
          <span style={{ color: accentColor, whiteSpace: "nowrap" }}>
            {accent}
          </span>
        </span>
      </div>
    </div>
  );
};

export const BrollDollarDeclineScene: React.FC<
  BrollDollarDeclineSceneProps
> = ({
  backgroundAsset = "broll-ocean-tanker/mo-photoshop-background.png",
  peopleAsset = "broll-dollar-yuan/putin-xi.png",
  peopleX = 0,
  peopleY = 150,
  peopleWidth = 1180,
  peopleStartFrame = 30,
  peopleRisePx = 410,
  peopleRiseDurationFrames = 42,
  strokeColor = "#E04329",
  strokeOpacity = 0.95,
  peopleStrokeX = -26,
  peopleStrokeY = 8,
  buildingAsset = "broll-dollar-yuan/china-building.png",
  buildingX = 0,
  buildingWidth = 1240,
  buildingBottom = -110,
  buildingStartFrame = 6,
  buildingRisePx = 360,
  buildingRiseDurationFrames = 40,
  bubbleAccentColor = "#E04329",
  bubbleTextColor = "#1A1A1A",
  bubbleFontSize = 50,
  xiBubbleAsset = "broll-dollar-yuan/bubble-round.png",
  xiTextPrefix = "Let's trade in",
  xiTextAccent = "Yuan ¥",
  xiBubbleX = 650,
  xiBubbleY = 178,
  xiBubbleWidth = 480,
  xiBubbleFlipX = false,
  xiBubbleTilt = -4,
  xiBubbleStartFrame = 82,
  xiTextTopPct = 18,
  xiTextHeightPct = 48,
  xiTextWidthPct = 72,
  putinBubbleAsset = "broll-dollar-yuan/bubble-rect.png",
  putinTextPrefix = "Ok,",
  putinTextAccent = "deal!",
  putinBubbleX = 1336,
  putinBubbleY = 156,
  putinBubbleWidth = 380,
  putinBubbleFlipX = false,
  putinBubbleTilt = 4,
  putinBubbleStartFrame = 112,
  putinTextTopPct = 10,
  putinTextHeightPct = 54,
  putinTextWidthPct = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const peopleHeight = peopleWidth / PEOPLE_AR;
  const peopleLeft = 960 + peopleX;
  const buildingHeight = buildingWidth / BUILDING_AR;

  const peopleRise = spring({
    frame: frame - peopleStartFrame,
    fps,
    config: { damping: 18, mass: 0.75, stiffness: 110 },
    durationInFrames: Math.max(1, peopleRiseDurationFrames),
  });
  const peopleRiseY = interpolate(peopleRise, [0, 1], [peopleRisePx, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const peopleOpacity = interpolate(
    frame,
    [peopleStartFrame, peopleStartFrame + 16],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const buildingRise = spring({
    frame: frame - buildingStartFrame,
    fps,
    config: { damping: 18, mass: 0.85, stiffness: 100 },
    durationInFrames: Math.max(1, buildingRiseDurationFrames),
  });
  const buildingRiseY = interpolate(buildingRise, [0, 1], [buildingRisePx, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buildingOpacity = interpolate(
    frame,
    [buildingStartFrame, buildingStartFrame + 18],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const peopleUrl = staticFile(peopleAsset);
  const peopleBox = {
    position: "absolute" as const,
    left: peopleLeft,
    top: peopleY,
    width: peopleWidth,
    height: peopleHeight,
    transformOrigin: "center bottom" as const,
    willChange: "transform, opacity",
  };

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
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(63,54,42,0.12)), radial-gradient(circle at 50% 58%, rgba(255,255,255,0.16), transparent 42%)",
          mixBlendMode: "soft-light",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Midground: Putin & Xi — offset orange/red stroke (peace-deal style) */}
      <div
        aria-hidden="true"
        style={{
          ...peopleBox,
          backgroundColor: strokeColor,
          opacity: peopleOpacity * strokeOpacity,
          transform: `translate(calc(-50% + ${peopleStrokeX}px), ${peopleRiseY + peopleStrokeY}px)`,
          maskImage: `url(${peopleUrl})`,
          maskRepeat: "no-repeat",
          maskSize: "100% 100%",
          maskPosition: "center",
          WebkitMaskImage: `url(${peopleUrl})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          WebkitMaskPosition: "center",
          zIndex: 9,
        }}
      />
      <Img
        src={peopleUrl}
        alt="Xi and Putin shaking hands"
        style={{
          ...peopleBox,
          objectFit: "contain",
          opacity: peopleOpacity,
          transform: `translate(-50%, ${peopleRiseY}px)`,
          filter: `grayscale(0.1) contrast(1.04) drop-shadow(0 26px 26px ${SHADOW})`,
          zIndex: 10,
        }}
      />

      {/* Foreground: Tiananmen */}
      <Img
        src={staticFile(buildingAsset)}
        alt="Tiananmen gate"
        style={{
          position: "absolute",
          left: 960 + buildingX,
          bottom: buildingBottom,
          width: buildingWidth,
          height: buildingHeight,
          objectFit: "contain",
          opacity: buildingOpacity,
          transform: `translate(-50%, ${buildingRiseY}px)`,
          transformOrigin: "center bottom",
          filter: `drop-shadow(0 -6px 24px rgba(40,30,18,0.18))`,
          zIndex: 20,
          willChange: "transform, opacity",
        }}
      />

      {/* Xi speaks */}
      <SpeechDoodle
        asset={xiBubbleAsset}
        prefix={xiTextPrefix}
        accent={xiTextAccent}
        accentColor={bubbleAccentColor}
        textColor={bubbleTextColor}
        fontSize={bubbleFontSize}
        x={xiBubbleX}
        y={xiBubbleY}
        width={xiBubbleWidth}
        flipX={xiBubbleFlipX}
        tilt={xiBubbleTilt}
        startFrame={xiBubbleStartFrame}
        textTopPct={xiTextTopPct}
        textHeightPct={xiTextHeightPct}
        textWidthPct={xiTextWidthPct}
      />

      {/* Putin replies */}
      <SpeechDoodle
        asset={putinBubbleAsset}
        prefix={putinTextPrefix}
        accent={putinTextAccent}
        accentColor={bubbleAccentColor}
        textColor={bubbleTextColor}
        fontSize={bubbleFontSize}
        x={putinBubbleX}
        y={putinBubbleY}
        width={putinBubbleWidth}
        flipX={putinBubbleFlipX}
        tilt={putinBubbleTilt}
        startFrame={putinBubbleStartFrame}
        textTopPct={putinTextTopPct}
        textHeightPct={putinTextHeightPct}
        textWidthPct={putinTextWidthPct}
      />
    </AbsoluteFill>
  );
};

export const defaultBrollDollarDeclineSceneProps: BrollDollarDeclineSceneProps =
  {
    backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
    peopleAsset: "broll-dollar-yuan/putin-xi.png",
    peopleX: 0,
    peopleY: 150,
    peopleWidth: 1180,
    peopleStartFrame: 30,
    peopleRisePx: 410,
    peopleRiseDurationFrames: 42,
    strokeColor: "#E04329",
    strokeOpacity: 0.95,
    peopleStrokeX: -26,
    peopleStrokeY: 8,
    buildingAsset: "broll-dollar-yuan/china-building.png",
    buildingX: 0,
    buildingWidth: 1240,
    buildingBottom: -110,
    buildingStartFrame: 6,
    buildingRisePx: 360,
    buildingRiseDurationFrames: 40,
    bubbleAccentColor: "#E04329",
    bubbleTextColor: "#1A1A1A",
    bubbleFontSize: 50,
    xiBubbleAsset: "broll-dollar-yuan/bubble-round.png",
    xiTextPrefix: "Let's trade in",
    xiTextAccent: "Yuan ¥",
    xiBubbleX: 650,
    xiBubbleY: 178,
    xiBubbleWidth: 480,
    xiBubbleFlipX: false,
    xiBubbleTilt: -4,
    xiBubbleStartFrame: 82,
    xiTextTopPct: 18,
    xiTextHeightPct: 48,
    xiTextWidthPct: 72,
    putinBubbleAsset: "broll-dollar-yuan/bubble-rect.png",
    putinTextPrefix: "Ok,",
    putinTextAccent: "deal!",
    putinBubbleX: 1336,
    putinBubbleY: 156,
    putinBubbleWidth: 380,
    putinBubbleFlipX: false,
    putinBubbleTilt: 4,
    putinBubbleStartFrame: 112,
    putinTextTopPct: 10,
    putinTextHeightPct: 54,
    putinTextWidthPct: 80,
  };
