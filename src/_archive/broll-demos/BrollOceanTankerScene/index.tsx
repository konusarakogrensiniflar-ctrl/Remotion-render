import {
  AbsoluteFill,
  Img,
  Loop,
  Easing,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
export const BROLL_OCEAN_TANKER_DURATION = 270;

export const brollOceanTankerSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),
  shipAsset: z.string().default("broll-ocean-tanker/tanker-ship.png"),
  oceanAsset: z.string().default("broll-ocean-tanker/keyed-ocean.webm"),
  shipX: z.number().default(0),
  shipY: z.number().default(-305),
  shipScale: z.number().default(0.78),
  shipWidth: z.number().default(1420),
  shipTravelStartX: z.number().default(-240),
  shipTravelEndX: z.number().default(85),
  shipAcceleration: z.number().default(1),
  shipDrift: z.number().default(32),
  shipBob: z.number().default(10),
  shipOpacity: z.number().default(0.96),
  shipSaturation: z.number().default(0.2),
  shipContrast: z.number().default(1.04),
  oceanX: z.number().default(0),
  oceanY: z.number().default(325),
  oceanScale: z.number().default(1.18),
  oceanOpacity: z.number().default(0.96),
  oceanSaturation: z.number().default(0.62),
  drift: z.number().default(1),
  bob: z.number().default(1),
  foregroundOcclusionHeight: z.number().default(210),
  counterStartFrame: z.number().default(150),
  counterEndValue: z.number().default(115),
  counterDurationFrames: z.number().default(60),
  counterX: z.number().default(1110),
  counterY: z.number().default(322),
  counterScale: z.number().default(1),
  showBarrel: z.boolean().default(true),
  barrelAsset: z.string().default("broll-ocean-tanker/oil-barrel.png"),
  barrelHeight: z.number().default(140),
  barrelGap: z.number().default(28),
  barrelOffsetY: z.number().default(0),
  outroStartFrame: z.number().default(240),
  outroEndFrame: z.number().default(270),
  counterRetractX: z.number().default(2290),
  shipOutroY: z.number().default(820),
  oceanOutroY: z.number().default(850),
});

export type BrollOceanTankerSceneProps = z.infer<
  typeof brollOceanTankerSceneSchema
>;

const WARM_SHADOW = "rgba(77, 55, 31, 0.28)";
const PAPER_BLUE = "rgba(141, 157, 160, 0.34)";

const ShipLayer: React.FC<{
  asset: string;
  x: number;
  y: number;
  scale: number;
  width: number;
  travelStartX: number;
  travelEndX: number;
  acceleration: number;
  drift: number;
  driftMultiplier: number;
  bob: number;
  bobMultiplier: number;
  opacity: number;
  saturation: number;
  contrast: number;
  outroStartFrame: number;
  outroEndFrame: number;
  outroY: number;
}> = ({
  asset,
  x,
  y,
  scale,
  width,
  travelStartX,
  travelEndX,
  acceleration,
  drift,
  driftMultiplier,
  bob,
  bobMultiplier,
  opacity,
  saturation,
  contrast,
  outroStartFrame,
  outroEndFrame,
  outroY,
}) => {
  const frame = useCurrentFrame();
  const linearProgress = interpolate(
    frame,
    [0, BROLL_OCEAN_TANKER_DURATION - 1],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const safeAcceleration = Math.max(0.05, acceleration);
  const motionProgress = Math.pow(linearProgress, safeAcceleration);
  const travelX = interpolate(
    motionProgress,
    [0, 1],
    [travelStartX, travelEndX],
  );
  const slowDrift = Math.sin(frame / 74) * drift * driftMultiplier;
  const slowBob = Math.sin(frame / 31) * bob * bobMultiplier;
  const paperWarp = Math.sin(frame / 53) * 0.28;
  const outroProgress = interpolate(
    frame,
    [outroStartFrame, outroEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const retractY = Easing.inOut(Easing.cubic)(outroProgress) * outroY;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 190,
        width,
        transform: `translate(calc(-50% + ${
          x + travelX + slowDrift
        }px), ${y + slowBob + retractY}px) scale(${scale}) rotate(${paperWarp}deg)`,
        transformOrigin: "center bottom",
        opacity,
        willChange: "transform",
      }}
    >
      <Img
        src={staticFile(asset)}
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          filter: `grayscale(1) saturate(${saturation}) contrast(${contrast}) brightness(0.92) drop-shadow(0 22px 28px ${WARM_SHADOW}) drop-shadow(0 5px 0 rgba(255,245,224,0.22))`,
        }}
      />
    </div>
  );
};

const OceanLayer: React.FC<{
  asset: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  saturation: number;
  occlusionHeight: number;
  outroStartFrame: number;
  outroEndFrame: number;
  outroY: number;
}> = ({
  asset,
  x,
  y,
  scale,
  opacity,
  saturation,
  occlusionHeight,
  outroStartFrame,
  outroEndFrame,
  outroY,
}) => {
  const frame = useCurrentFrame();
  const outroProgress = interpolate(
    frame,
    [outroStartFrame, outroEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const retractY = Easing.inOut(Easing.cubic)(outroProgress) * outroY;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        transform: `translateY(${retractY}px)`,
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: occlusionHeight,
          background:
            "linear-gradient(180deg, rgba(218,217,213,0) 0%, rgba(186,190,184,0.46) 28%, rgba(170,178,176,0.62) 100%)",
          zIndex: 0,
        }}
      />
      <Loop durationInFrames={180}>
        <OffthreadVideo
          src={staticFile(asset)}
          muted
          transparent
          style={{
            position: "absolute",
            left: "50%",
            top: y,
            width: 1920,
            height: 1080,
            objectFit: "cover",
            transform: `translateX(calc(-50% + ${x}px)) scale(${scale})`,
            transformOrigin: "center top",
            opacity,
            filter: `grayscale(0.18) saturate(${saturation}) sepia(0.08) contrast(1.06) brightness(0.96) drop-shadow(0 -10px 20px rgba(36,33,28,0.08))`,
          }}
        />
      </Loop>
      <div
        style={{
          position: "absolute",
          left: -160,
          right: -160,
          bottom: -120,
          height: 300,
          background: PAPER_BLUE,
          filter: "blur(42px)",
          opacity: 0.52,
          zIndex: -1,
        }}
      />
    </AbsoluteFill>
  );
};

const OilPriceCounter: React.FC<{
  startFrame: number;
  endValue: number;
  durationFrames: number;
  x: number;
  y: number;
  scale: number;
  showBarrel: boolean;
  barrelAsset: string;
  barrelHeight: number;
  barrelGap: number;
  barrelOffsetY: number;
  outroStartFrame: number;
  outroEndFrame: number;
  retractX: number;
}> = ({
  startFrame,
  endValue,
  durationFrames,
  x,
  y,
  scale,
  showBarrel,
  barrelAsset,
  barrelHeight,
  barrelGap,
  barrelOffsetY,
  outroStartFrame,
  outroEndFrame,
  retractX,
}) => {
  const frame = useCurrentFrame();
  const countProgress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const value = Math.round(countProgress * endValue);
  const opacity =
    frame < startFrame
      ? 0
      : interpolate(frame, [startFrame, startFrame + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const riseY = interpolate(
    frame,
    [startFrame, startFrame + 22, startFrame + 34],
    [255, -10, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const popScale = interpolate(
    frame,
    [startFrame, startFrame + 22, startFrame + 34],
    [0.94, 1.03, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const outroProgress = interpolate(
    frame,
    [outroStartFrame, outroEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const easedOutro = Easing.inOut(Easing.cubic)(outroProgress);
  const currentX = interpolate(easedOutro, [0, 1], [x, retractX]);

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: y,
        width: 650,
        height: 330,
        transform: "translateX(-50%)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          transform: `translateY(${riseY}px) scale(${scale * popScale})`,
          transformOrigin: "center bottom",
          opacity,
          fontFamily: "Montserrat, Inter, system-ui, sans-serif",
          color: "#1A1A1A",
          textAlign: "center",
          willChange: "transform, opacity",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: barrelGap,
          }}
        >
          {showBarrel ? (
            <Img
              src={staticFile(barrelAsset)}
              alt="Oil barrel"
              style={{
                height: barrelHeight,
                width: "auto",
                transform: `translateY(${barrelOffsetY}px)`,
                filter: "drop-shadow(0 10px 14px rgba(44,37,28,0.28))",
              }}
            />
          ) : null}
          <div
            style={{
              fontSize: 126,
              fontWeight: 950,
              letterSpacing: -7,
              lineHeight: 0.9,
              textShadow:
                "0 3px 0 rgba(255,255,255,0.5), 0 12px 24px rgba(44,37,28,0.22)",
            }}
          >
            ${value}
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 36,
            fontWeight: 950,
            letterSpacing: 4,
            color: "#1A1A1A",
            textShadow:
              "0 2px 0 rgba(255,255,255,0.45), 0 8px 18px rgba(44,37,28,0.2)",
          }}
        >
          PER BARREL
        </div>
      </div>
    </div>
  );
};

export const BrollOceanTankerScene: React.FC<BrollOceanTankerSceneProps> = ({
  backgroundAsset,
  shipAsset,
  oceanAsset,
  shipX,
  shipY,
  shipScale,
  shipWidth,
  shipTravelStartX,
  shipTravelEndX,
  shipAcceleration,
  shipDrift,
  shipBob,
  shipOpacity,
  shipSaturation,
  shipContrast,
  oceanX,
  oceanY,
  oceanScale,
  oceanOpacity,
  oceanSaturation,
  drift,
  bob,
  foregroundOcclusionHeight,
  counterStartFrame,
  counterEndValue,
  counterDurationFrames,
  counterX,
  counterY,
  counterScale,
  showBarrel,
  barrelAsset,
  barrelHeight,
  barrelGap,
  barrelOffsetY,
  outroStartFrame,
  outroEndFrame,
  counterRetractX,
  shipOutroY,
  oceanOutroY,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#DAD9D5", overflow: "hidden" }}>
      <Img
        src={staticFile(backgroundAsset)}
        alt="Mo Photoshop ocean tanker background"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          zIndex: 0,
        }}
      />
      <AbsoluteFill style={{ zIndex: 2 }}>
        <ShipLayer
          asset={shipAsset}
          x={shipX}
          y={shipY}
          scale={shipScale}
          width={shipWidth}
          travelStartX={shipTravelStartX}
          travelEndX={shipTravelEndX}
          acceleration={shipAcceleration}
          drift={shipDrift}
          driftMultiplier={drift}
          bob={shipBob}
          bobMultiplier={bob}
          opacity={shipOpacity}
          saturation={shipSaturation}
          contrast={shipContrast}
          outroStartFrame={outroStartFrame}
          outroEndFrame={outroEndFrame}
          outroY={shipOutroY}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ zIndex: 3 }}>
        <OceanLayer
          asset={oceanAsset}
          x={oceanX}
          y={oceanY}
          scale={oceanScale}
          opacity={oceanOpacity}
          saturation={oceanSaturation}
          occlusionHeight={foregroundOcclusionHeight}
          outroStartFrame={outroStartFrame}
          outroEndFrame={outroEndFrame}
          outroY={oceanOutroY}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ zIndex: 4, pointerEvents: "none" }}>
        <OilPriceCounter
          startFrame={counterStartFrame}
          endValue={counterEndValue}
          durationFrames={counterDurationFrames}
          x={counterX}
          y={counterY}
          scale={counterScale}
          showBarrel={showBarrel}
          barrelAsset={barrelAsset}
          barrelHeight={barrelHeight}
          barrelGap={barrelGap}
          barrelOffsetY={barrelOffsetY}
          outroStartFrame={outroStartFrame}
          outroEndFrame={outroEndFrame}
          retractX={counterRetractX}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const defaultBrollOceanTankerSceneProps: BrollOceanTankerSceneProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  shipAsset: "broll-ocean-tanker/tanker-ship.png",
  oceanAsset: "broll-ocean-tanker/keyed-ocean.webm",
  shipX: 0,
  shipY: -305,
  shipScale: 0.78,
  shipWidth: 1420,
  shipTravelStartX: -240,
  shipTravelEndX: 85,
  shipAcceleration: 1,
  shipDrift: 32,
  shipBob: 10,
  shipOpacity: 0.96,
  shipSaturation: 0.2,
  shipContrast: 1.04,
  oceanX: 0,
  oceanY: 325,
  oceanScale: 1.18,
  oceanOpacity: 0.96,
  oceanSaturation: 0.62,
  drift: 1,
  bob: 1,
  foregroundOcclusionHeight: 210,
  showBarrel: true,
  barrelAsset: "broll-ocean-tanker/oil-barrel.png",
  barrelHeight: 140,
  barrelGap: 28,
  barrelOffsetY: 0,
  counterStartFrame: 150,
  counterEndValue: 115,
  counterDurationFrames: 60,
  counterX: 1110,
  counterY: 322,
  counterScale: 1,
  outroStartFrame: 240,
  outroEndFrame: 270,
  counterRetractX: 2290,
  shipOutroY: 820,
  oceanOutroY: 850,
};
