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

export const BROLL_PEACE_DEAL_SCENE_DURATION = 270;

export const brollPeaceDealSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),
  trumpAsset: z.string().default("broll-peace-deal/trump-halftone.png"),
  khameneiAsset: z.string().default("broll-peace-deal/iran-halftone.png"),
  whiteHouseAsset: z
    .string()
    .default("broll-peace-deal/white-house-foreground.png"),
  whiteHouseX: z.number().default(0),
  whiteHouseY: z.number().default(0),
  whiteHouseScale: z.number().default(1),
  whiteHouseStartFrame: z.number().default(15),
  whiteHouseEndFrame: z.number().default(55),
  trumpX: z.number().default(-430),
  trumpY: z.number().default(30),
  trumpScale: z.number().default(1),
  trumpStartFrame: z.number().default(45),
  trumpEndFrame: z.number().default(85),
  khameneiX: z.number().default(430),
  khameneiY: z.number().default(30),
  khameneiScale: z.number().default(1),
  khameneiStartFrame: z.number().default(80),
  khameneiEndFrame: z.number().default(120),
  portraitStrokeColor: z.string().default("#E04329"),
  portraitStrokeOpacity: z.number().default(0.95),
  trumpStrokeX: z.number().default(-28),
  trumpStrokeY: z.number().default(10),
  khameneiStrokeX: z.number().default(28),
  khameneiStrokeY: z.number().default(10),
});

export type BrollPeaceDealSceneProps = z.infer<
  typeof brollPeaceDealSceneSchema
>;

const SHADOW = "rgba(55, 45, 31, 0.28)";

const getEntrance = (
  frame: number,
  fps: number,
  startFrame: number,
  endFrame: number,
) => {
  const durationInFrames = Math.max(1, endFrame - startFrame);
  const bounce = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 18,
      mass: 0.75,
      stiffness: 110,
    },
    durationInFrames,
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return { opacity, progress: bounce };
};

const PortraitAsset: React.FC<{
  side: "trump" | "khamenei";
  asset: string;
  x: number;
  y: number;
  scale: number;
  startFrame: number;
  endFrame: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeX: number;
  strokeY: number;
}> = ({
  side,
  asset,
  x,
  y,
  scale,
  startFrame,
  endFrame,
  strokeColor,
  strokeOpacity,
  strokeX,
  strokeY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, progress } = getEntrance(frame, fps, startFrame, endFrame);
  const rise = interpolate(progress, [0, 1], [390, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const assetUrl = staticFile(asset);
  const width = side === "trump" ? 520 : 500;
  const baseStyle = {
    position: "absolute" as const,
    bottom: 330 + y,
    width,
    height: 580,
    opacity,
    objectFit: "contain" as const,
    objectPosition: "center bottom",
    transformOrigin: "center bottom",
  };

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          ...baseStyle,
          left: 960 + x + strokeX,
          backgroundColor: strokeColor,
          maskImage: `url(${assetUrl})`,
          maskRepeat: "no-repeat",
          maskSize: "100% 100%",
          maskPosition: "center bottom",
          opacity: opacity * strokeOpacity,
          transform: `translate(-50%, ${rise + strokeY}px) scale(${scale})`,
          WebkitMaskImage: `url(${assetUrl})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          WebkitMaskPosition: "center bottom",
          willChange: "transform, opacity",
          zIndex: 11,
        }}
      />
      <Img
        src={assetUrl}
        alt={
          side === "trump" ? "Trump halftone cutout" : "Iran halftone cutout"
        }
        style={{
          ...baseStyle,
          left: 960 + x,
          transform: `translate(-50%, ${rise}px) scale(${scale})`,
          filter: `drop-shadow(0 28px 26px ${SHADOW})`,
          willChange: "transform, opacity",
          zIndex: 12,
        }}
      />
    </>
  );
};

const WhiteHouseForeground: React.FC<{
  asset: string;
  x: number;
  y: number;
  scale: number;
  startFrame: number;
  endFrame: number;
}> = ({ asset, x, y, scale, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, progress } = getEntrance(frame, fps, startFrame, endFrame);
  const rise = interpolate(progress, [0, 1], [360, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Img
      src={staticFile(asset)}
      alt="White House foreground cutout"
      style={{
        position: "absolute",
        left: 960 + x,
        bottom: -120 + y,
        width: 1320,
        height: 760,
        opacity,
        objectFit: "contain",
        objectPosition: "center bottom",
        transform: `translate(-50%, ${rise}px) scale(${scale})`,
        transformOrigin: "center bottom",
        filter: `drop-shadow(0 34px 28px ${SHADOW})`,
        zIndex: 24,
      }}
    />
  );
};

export const BrollPeaceDealScene: React.FC<BrollPeaceDealSceneProps> = ({
  backgroundAsset = "broll-ocean-tanker/mo-photoshop-background.png",
  trumpAsset = "broll-peace-deal/trump-halftone.png",
  khameneiAsset = "broll-peace-deal/iran-halftone.png",
  whiteHouseAsset = "broll-peace-deal/white-house-foreground.png",
  whiteHouseX = 0,
  whiteHouseY = 0,
  whiteHouseScale = 1,
  whiteHouseStartFrame = 15,
  whiteHouseEndFrame = 55,
  trumpX = -430,
  trumpY = 30,
  trumpScale = 1,
  trumpStartFrame = 45,
  trumpEndFrame = 85,
  khameneiX = 430,
  khameneiY = 30,
  khameneiScale = 1,
  khameneiStartFrame = 80,
  khameneiEndFrame = 120,
  portraitStrokeColor = "#E04329",
  portraitStrokeOpacity = 0.95,
  trumpStrokeX = -28,
  trumpStrokeY = 10,
  khameneiStrokeX = 28,
  khameneiStrokeY = 10,
}) => {
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
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(63,54,42,0.12)), radial-gradient(circle at 50% 72%, rgba(255,255,255,0.18), transparent 38%)",
          mixBlendMode: "soft-light",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <PortraitAsset
        side="trump"
        asset={trumpAsset}
        x={trumpX}
        y={trumpY}
        scale={trumpScale}
        startFrame={trumpStartFrame}
        endFrame={trumpEndFrame}
        strokeColor={portraitStrokeColor}
        strokeOpacity={portraitStrokeOpacity}
        strokeX={trumpStrokeX}
        strokeY={trumpStrokeY}
      />
      <PortraitAsset
        side="khamenei"
        asset={khameneiAsset}
        x={khameneiX}
        y={khameneiY}
        scale={khameneiScale}
        startFrame={khameneiStartFrame}
        endFrame={khameneiEndFrame}
        strokeColor={portraitStrokeColor}
        strokeOpacity={portraitStrokeOpacity}
        strokeX={khameneiStrokeX}
        strokeY={khameneiStrokeY}
      />
      <WhiteHouseForeground
        asset={whiteHouseAsset}
        x={whiteHouseX}
        y={whiteHouseY}
        scale={whiteHouseScale}
        startFrame={whiteHouseStartFrame}
        endFrame={whiteHouseEndFrame}
      />
    </AbsoluteFill>
  );
};
