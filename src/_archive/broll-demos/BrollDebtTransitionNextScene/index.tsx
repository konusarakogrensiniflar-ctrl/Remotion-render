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

export const BROLL_DEBT_TRANSITION_NEXT_SCENE_DURATION = 300;

export const brollDebtTransitionNextSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),
  mapAsset: z.string().default("broll-inflation-debt/us-map.png"),
  debtAmountText: z.string().default("$39 TRILLION"),
  interestLabelText: z.string().default("interest: $1 trillion for 2026"),
  workGearAsset: z.string().default("broll-debt-transition-next/work-gear.png"),
  usWorkerAsset: z.string().default("broll-debt-transition-next/us-worker.png"),
  tankAsset: z.string().default("broll-debt-transition-next/tank.png"),
  usSoldierAsset: z
    .string()
    .default("broll-debt-transition-next/us-soldier-2.png"),
  mapX: z.number().default(0),
  mapY: z.number().default(-151),
  mapScale: z.number().default(1.04),
  mapWidth: z.number().default(780),
  mapHeight: z.number().default(520),
  debtTextX: z.number().default(25),
  debtTextY: z.number().default(-380),
  debtTextScale: z.number().default(1.08),
  interestLabelX: z.number().default(25),
  interestLabelY: z.number().default(-262),
  interestLabelScale: z.number().default(1),
  interestLabelStartFrame: z.number().default(82),
  interestLabelEndFrame: z.number().default(106),
  interestLabelFontSize: z.number().default(38),
  leftGroupX: z.number().default(-455),
  rightGroupX: z.number().default(455),
  workGearX: z.number().default(50),
  workGearY: z.number().default(252),
  workGearScale: z.number().default(0.56),
  workerX: z.number().default(-120),
  workerY: z.number().default(128),
  workerScale: z.number().default(0.42),
  tankX: z.number().default(-7),
  tankY: z.number().default(270),
  tankScale: z.number().default(0.48),
  soldierX: z.number().default(170),
  soldierY: z.number().default(120),
  soldierScale: z.number().default(0.42),
  workGearStartFrame: z.number().default(45),
  workGearEndFrame: z.number().default(85),
  workerStartFrame: z.number().default(68),
  workerEndFrame: z.number().default(108),
  tankStartFrame: z.number().default(160),
  tankEndFrame: z.number().default(200),
  soldierStartFrame: z.number().default(188),
  soldierEndFrame: z.number().default(228),
  darkTextColor: z.string().default("#1A1A1A"),
  mapShadowColor: z.string().default("rgba(71, 50, 28, 0.26)"),
  cutoutShadowColor: z.string().default("rgba(71, 50, 28, 0.3)"),
  strokeColor: z.string().default("#E04329"),
  strokeOpacity: z.number().default(0.86),
  workerStrokeX: z.number().default(-24),
  workerStrokeY: z.number().default(10),
  soldierStrokeX: z.number().default(24),
  soldierStrokeY: z.number().default(10),
});

export type BrollDebtTransitionNextSceneProps = z.infer<
  typeof brollDebtTransitionNextSceneSchema
>;

const getEntrance = (
  frame: number,
  fps: number,
  startFrame: number,
  endFrame: number,
) => {
  const durationInFrames = Math.max(1, endFrame - startFrame);
  const progress = spring({
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

  return { opacity, progress };
};

const Cutout: React.FC<{
  asset: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  scale: number;
  startFrame: number;
  endFrame: number;
  riseDistance: number;
  zIndex: number;
  shadowColor: string;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeX?: number;
  strokeY?: number;
}> = ({
  asset,
  alt,
  x,
  y,
  width,
  scale,
  startFrame,
  endFrame,
  riseDistance,
  zIndex,
  shadowColor,
  strokeColor,
  strokeOpacity,
  strokeX,
  strokeY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity, progress } = getEntrance(frame, fps, startFrame, endFrame);
  const rise = interpolate(progress, [0, 1], [riseDistance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const assetUrl = staticFile(asset);

  return (
    <div
      style={{
        position: "absolute",
        left: 960 + x,
        bottom: 540 - y,
        width,
        opacity,
        transform: `translateX(-50%) translateY(${rise}px) scale(${scale})`,
        transformOrigin: "center bottom",
        zIndex,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "13%",
          right: "13%",
          bottom: -18,
          height: 48,
          borderRadius: "50%",
          background: "rgba(55, 39, 22, 0.18)",
          filter: "blur(18px)",
          transform: `scaleX(${interpolate(progress, [0, 1], [0.55, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
        }}
      />
      {strokeColor && strokeOpacity ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: strokeColor,
            maskImage: `url(${assetUrl})`,
            maskRepeat: "no-repeat",
            maskSize: "100% 100%",
            maskPosition: "center bottom",
            opacity: strokeOpacity,
            transform: `translate(${strokeX ?? 0}px, ${strokeY ?? 0}px)`,
            WebkitMaskImage: `url(${assetUrl})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            WebkitMaskPosition: "center bottom",
            willChange: "transform, opacity",
            zIndex: 0,
          }}
        />
      ) : null}
      <Img
        src={assetUrl}
        alt={alt}
        style={{
          position: "relative",
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "contain",
          objectPosition: "center bottom",
          filter: `drop-shadow(0 26px 22px ${shadowColor}) saturate(0.94) contrast(1.02)`,
          zIndex: 1,
        }}
      />
    </div>
  );
};

export const BrollDebtTransitionNextScene: React.FC<
  BrollDebtTransitionNextSceneProps
> = ({
  backgroundAsset = "broll-ocean-tanker/mo-photoshop-background.png",
  mapAsset = "broll-inflation-debt/us-map.png",
  debtAmountText = "$39 TRILLION",
  interestLabelText = "interest: $1 trillion for 2026",
  workGearAsset = "broll-debt-transition-next/work-gear.png",
  usWorkerAsset = "broll-debt-transition-next/us-worker.png",
  tankAsset = "broll-debt-transition-next/tank.png",
  usSoldierAsset = "broll-debt-transition-next/us-soldier-2.png",
  mapX = 0,
  mapY = -151,
  mapScale = 1.04,
  mapWidth = 780,
  mapHeight = 520,
  debtTextX = 25,
  debtTextY = -380,
  debtTextScale = 1.08,
  interestLabelX = 25,
  interestLabelY = -262,
  interestLabelScale = 1,
  interestLabelStartFrame = 82,
  interestLabelEndFrame = 106,
  interestLabelFontSize = 38,
  leftGroupX = -455,
  rightGroupX = 455,
  workGearX = 50,
  workGearY = 252,
  workGearScale = 0.56,
  workerX = -120,
  workerY = 128,
  workerScale = 0.42,
  tankX = -7,
  tankY = 270,
  tankScale = 0.48,
  soldierX = 170,
  soldierY = 120,
  soldierScale = 0.42,
  workGearStartFrame = 45,
  workGearEndFrame = 85,
  workerStartFrame = 68,
  workerEndFrame = 108,
  tankStartFrame = 160,
  tankEndFrame = 200,
  soldierStartFrame = 188,
  soldierEndFrame = 228,
  darkTextColor = "#1A1A1A",
  mapShadowColor = "rgba(71, 50, 28, 0.26)",
  cutoutShadowColor = "rgba(71, 50, 28, 0.3)",
  strokeColor = "#E04329",
  strokeOpacity = 0.86,
  workerStrokeX = -24,
  workerStrokeY = 10,
  soldierStrokeX = 24,
  soldierStrokeY = 10,
}) => {
  const frame = useCurrentFrame();
  const interestLabelOpacity = interpolate(
    frame,
    [interestLabelStartFrame, interestLabelEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
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

      <div
        style={{
          position: "absolute",
          left: 960 + mapX,
          top: 540 + mapY,
          width: mapWidth,
          height: mapHeight,
          opacity: 1,
          transform: `translate(-50%, -50%) scale(${mapScale})`,
          transformOrigin: "center bottom",
          zIndex: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: 34,
            height: 66,
            borderRadius: "50%",
            background: "rgba(55, 39, 22, 0.18)",
            filter: "blur(14px)",
          }}
        />
        <Img
          src={staticFile(mapAsset)}
          alt="Isometric United States map with flag texture"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: `drop-shadow(0 34px 28px ${mapShadowColor}) saturate(0.86) contrast(1.03)`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 960 + debtTextX,
          top: 540 + debtTextY,
          transform: `translate(-50%, 0) scale(${debtTextScale})`,
          transformOrigin: "center bottom",
          opacity: 1,
          zIndex: 14,
        }}
      >
        <div
          style={{
            color: darkTextColor,
            fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
            fontSize: 96,
            fontWeight: 950,
            letterSpacing: -4,
            lineHeight: 0.9,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {debtAmountText}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 960 + interestLabelX,
          top: 540 + interestLabelY,
          transform: `translate(-50%, 0) scale(${interestLabelScale})`,
          transformOrigin: "center top",
          opacity: interestLabelOpacity,
          zIndex: 14,
        }}
      >
        <div
          style={{
            color: darkTextColor,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: interestLabelFontSize,
            fontWeight: 800,
            letterSpacing: -0.6,
            lineHeight: 1,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {interestLabelText}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 960,
          bottom: 66,
          width: 1540,
          opacity: 0.18,
          transform: "translateX(-50%)",
          zIndex: 4,
        }}
      >
        <div
          style={{
            height: 28,
            borderRadius: "50%",
            background: "rgba(55, 39, 22, 0.22)",
            filter: "blur(20px)",
          }}
        />
      </div>

      <Cutout
        asset={usWorkerAsset}
        alt="US worker rising behind work gear"
        x={workerX + leftGroupX}
        y={workerY}
        width={500}
        scale={workerScale}
        startFrame={workerStartFrame}
        endFrame={workerEndFrame}
        riseDistance={390}
        zIndex={25}
        shadowColor={cutoutShadowColor}
        strokeColor={strokeColor}
        strokeOpacity={strokeOpacity}
        strokeX={workerStrokeX}
        strokeY={workerStrokeY}
      />
      <Cutout
        asset={usSoldierAsset}
        alt="US soldier rising behind tank"
        x={soldierX + rightGroupX}
        y={soldierY}
        width={500}
        scale={soldierScale}
        startFrame={soldierStartFrame}
        endFrame={soldierEndFrame}
        riseDistance={390}
        zIndex={26}
        shadowColor={cutoutShadowColor}
        strokeColor={strokeColor}
        strokeOpacity={strokeOpacity}
        strokeX={soldierStrokeX}
        strokeY={soldierStrokeY}
      />
      <Cutout
        asset={workGearAsset}
        alt="Work gear foreground"
        x={workGearX + leftGroupX}
        y={workGearY}
        width={680}
        scale={workGearScale}
        startFrame={workGearStartFrame}
        endFrame={workGearEndFrame}
        riseDistance={360}
        zIndex={35}
        shadowColor={cutoutShadowColor}
      />
      <Cutout
        asset={tankAsset}
        alt="Tank foreground"
        x={tankX + rightGroupX}
        y={tankY}
        width={720}
        scale={tankScale}
        startFrame={tankStartFrame}
        endFrame={tankEndFrame}
        riseDistance={360}
        zIndex={36}
        shadowColor={cutoutShadowColor}
      />
    </AbsoluteFill>
  );
};
