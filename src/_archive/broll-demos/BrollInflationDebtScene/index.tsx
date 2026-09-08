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

export const BROLL_INFLATION_DEBT_SCENE_DURATION = 300;

export const brollInflationDebtSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),
  mapAsset: z.string().default("broll-inflation-debt/us-map.png"),
  graphX: z.number().default(0),
  graphY: z.number().default(-14),
  graphScale: z.number().default(1),
  graphFinalX: z.number().default(-438),
  graphFinalY: z.number().default(-12),
  graphFinalScale: z.number().default(0.74),
  mapX: z.number().default(478),
  mapY: z.number().default(132),
  mapScale: z.number().default(0.82),
  debtAmountText: z.string().default("$39 TRILLION"),
  debtTextX: z.number().default(503),
  debtTextY: z.number().default(-106),
  debtTextScale: z.number().default(1),
  closerStartFrame: z.number().default(270),
  closerEndFrame: z.number().default(300),
  chartExitX: z.number().default(-1550),
  chartExitY: z.number().default(-12),
  chartExitScale: z.number().default(0.74),
  mapCloserX: z.number().default(0),
  mapCloserY: z.number().default(-25),
  mapCloserScale: z.number().default(1.04),
  debtTextCloserX: z.number().default(25),
  debtTextCloserY: z.number().default(-258),
  debtTextCloserScale: z.number().default(1.08),
  blueLineColor: z.string().default("#1676C2"),
  greyLineColor: z.string().default("#888C91"),
  darkTextColor: z.string().default("#1A1A1A"),
  orangeAccentColor: z.string().default("#E85D24"),
  graphStartFrame: z.number().default(0),
  graphRiseEndFrame: z.number().default(30),
  graphDrawEndFrame: z.number().default(150),
  graphMoveStartFrame: z.number().default(150),
  graphMoveEndFrame: z.number().default(185),
  mapStartFrame: z.number().default(165),
  mapEndFrame: z.number().default(210),
  debtStartFrame: z.number().default(190),
  debtEndFrame: z.number().default(240),
});

export type BrollInflationDebtSceneProps = z.infer<
  typeof brollInflationDebtSceneSchema
>;

const WARM_SHADOW = "rgba(71, 50, 28, 0.26)";
const PAPER = "rgba(255, 252, 243, 0.88)";
const INK = "rgba(26, 26, 26, 0.18)";

const mainCpi = [1.3, 2.1, 2.4, 1.8, 1.2, 4.7, 8.1, 4.1, 3.2, 3.5, 4.2];
const comparison = [1.6, 1.9, 2.2, 2.0, 1.4, 3.2, 5.8, 3.6, 2.7, 2.9, 3.1];
const years = [
  2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
];

const chart = {
  width: 1050,
  height: 610,
  left: 96,
  top: 86,
  right: 48,
  bottom: 76,
};

const plotWidth = chart.width - chart.left - chart.right;
const plotHeight = chart.height - chart.top - chart.bottom;

const xFor = (index: number) => chart.left + (index / 10) * plotWidth;
const yFor = (value: number) => chart.top + (1 - value / 9) * plotHeight;

const linePath = (values: number[]) =>
  values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"} ${xFor(index).toFixed(1)} ${yFor(value).toFixed(1)}`,
    )
    .join(" ");

const roundRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) =>
  `M ${x + radius} ${y} H ${x + width - radius} Q ${x + width} ${y} ${x + width} ${y + radius} V ${y + height - radius} Q ${x + width} ${y + height} ${x + width - radius} ${y + height} H ${x + radius} Q ${x} ${y + height} ${x} ${y + height - radius} V ${y + radius} Q ${x} ${y} ${x + radius} ${y} Z`;

const InflationChart: React.FC<{
  blueLineColor: string;
  greyLineColor: string;
  darkTextColor: string;
  orangeAccentColor: string;
  graphDrawEndFrame: number;
}> = ({
  blueLineColor,
  greyLineColor,
  darkTextColor,
  orangeAccentColor,
  graphDrawEndFrame,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [30, graphDrawEndFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const gridOpacity = interpolate(frame, [4, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 1 + Math.sin((frame - graphDrawEndFrame) * 0.34) * 0.24;
  const blink = interpolate(
    Math.sin((frame - graphDrawEndFrame) * 0.34),
    [-1, 1],
    [0.42, 1],
  );
  const highX = xFor(10);
  const highY = yFor(mainCpi[10]);
  const highCalloutOpacity = interpolate(
    frame,
    [graphDrawEndFrame, graphDrawEndFrame + 12],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <svg
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <clipPath id="inflation-chart-draw-clip">
          <rect
            x={chart.left - 14}
            y={chart.top - 18}
            width={(plotWidth + 34) * draw}
            height={plotHeight + 42}
          />
        </clipPath>
        <filter
          id="chart-paper-shadow"
          x="-15%"
          y="-20%"
          width="130%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="24"
            stdDeviation="18"
            floodColor="rgba(61,43,26,0.22)"
          />
        </filter>
      </defs>
      <path
        d={roundRectPath(10, 10, chart.width - 20, chart.height - 20, 28)}
        fill={PAPER}
        stroke="rgba(26,26,26,0.13)"
        strokeWidth="3"
        filter="url(#chart-paper-shadow)"
      />
      <text
        x="72"
        y="58"
        fill={darkTextColor}
        fontSize="26"
        fontWeight="800"
        letterSpacing="2.4"
      >
        U.S. INFLATION RATE
      </text>
      <text
        x="765"
        y="59"
        fill="rgba(26,26,26,0.52)"
        fontSize="18"
        fontWeight="700"
      >
        CPI • 2016-2026
      </text>
      {[2, 4, 6, 8].map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick} opacity={gridOpacity}>
            <line
              x1={chart.left}
              x2={chart.width - chart.right}
              y1={y}
              y2={y}
              stroke={INK}
              strokeWidth="2"
            />
            <text
              x={42}
              y={y + 7}
              fill="rgba(26,26,26,0.54)"
              fontSize="22"
              fontWeight="700"
            >
              +{tick}
            </text>
          </g>
        );
      })}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={yFor(0)}
        y2={yFor(0)}
        stroke="rgba(26,26,26,0.35)"
        strokeWidth="3"
      />
      <line
        x1={chart.left}
        x2={chart.left}
        y1={chart.top}
        y2={yFor(0)}
        stroke="rgba(26,26,26,0.24)"
        strokeWidth="3"
      />
      {years.map((year, index) => (
        <text
          key={year}
          x={xFor(index)}
          y={chart.height - 36}
          textAnchor="middle"
          fill="rgba(26,26,26,0.56)"
          fontSize="18"
          fontWeight="700"
        >
          {year}
        </text>
      ))}
      <g clipPath="url(#inflation-chart-draw-clip)">
        <path
          d={linePath(comparison)}
          fill="none"
          stroke={greyLineColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.76"
        />
        <path
          d={linePath(mainCpi)}
          fill="none"
          stroke={blueLineColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {mainCpi.map((value, index) => (
          <circle
            key={years[index]}
            cx={xFor(index)}
            cy={yFor(value)}
            r="7"
            fill="#F8F1E2"
            stroke={blueLineColor}
            strokeWidth="4"
          />
        ))}
      </g>
      <g opacity={highCalloutOpacity}>
        <circle
          cx={highX}
          cy={highY}
          r={28 * pulse}
          fill={orangeAccentColor}
          opacity={0.18 * blink}
        />
        <circle
          cx={highX}
          cy={highY}
          r={14 * pulse}
          fill={orangeAccentColor}
          opacity={0.88 * blink}
        />
        <circle
          cx={highX}
          cy={highY}
          r="7"
          fill="#fff7e8"
          stroke={darkTextColor}
          strokeWidth="3"
        />
        <path
          d="M 855 175 H 987 Q 1006 175 1006 194 V 242 Q 1006 261 987 261 H 855 Q 836 261 836 242 V 194 Q 836 175 855 175 Z"
          fill="rgba(255,247,230,0.95)"
          stroke={orangeAccentColor}
          strokeWidth="4"
        />
        <text
          x="921"
          y="208"
          textAnchor="middle"
          fill={darkTextColor}
          fontSize="22"
          fontWeight="900"
          letterSpacing="1.2"
        >
          2026 HIGH
        </text>
        <text
          x="921"
          y="239"
          textAnchor="middle"
          fill={orangeAccentColor}
          fontSize="28"
          fontWeight="950"
        >
          +4.2%
        </text>
      </g>
      <g opacity="0.72">
        <line
          x1="656"
          x2="704"
          y1="52"
          y2="52"
          stroke={blueLineColor}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <text
          x="716"
          y="59"
          fill={darkTextColor}
          fontSize="16"
          fontWeight="800"
        >
          CPI
        </text>
        <line
          x1="656"
          x2="704"
          y1="78"
          y2="78"
          stroke={greyLineColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text
          x="716"
          y="85"
          fill={darkTextColor}
          fontSize="16"
          fontWeight="800"
        >
          PREVIOUS TREND
        </text>
      </g>
    </svg>
  );
};

const DebtText: React.FC<{
  text: string;
  x: number;
  y: number;
  scale: number;
  closerX: number;
  closerY: number;
  closerScale: number;
  startFrame: number;
  endFrame: number;
  darkTextColor: string;
}> = ({
  text,
  closerX,
  closerY,
  closerScale,
  startFrame,
  endFrame,
  darkTextColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 13, mass: 0.72, stiffness: 125 },
    durationInFrames: Math.max(1, endFrame - startFrame),
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(pop, [0, 1], [88, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 960 + closerX,
        top: 540 + closerY,
        transform: `translate(-50%, ${rise}px) scale(${closerScale * pop})`,
        transformOrigin: "center bottom",
        opacity,
        zIndex: 28,
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
        {text}
      </div>
    </div>
  );
};

export const BrollInflationDebtScene: React.FC<
  BrollInflationDebtSceneProps
> = ({
  backgroundAsset = "broll-ocean-tanker/mo-photoshop-background.png",
  mapAsset = "broll-inflation-debt/us-map.png",
  graphX = 0,
  graphY = -14,
  graphScale = 1,
  graphFinalX = -438,
  graphFinalY = -12,
  graphFinalScale = 0.74,
  mapX = 478,
  mapY = 132,
  mapScale = 0.82,
  debtAmountText = "$39 TRILLION",
  debtTextX = 503,
  debtTextY = -106,
  debtTextScale = 1,
  closerStartFrame = 270,
  closerEndFrame = 300,
  chartExitX = -1550,
  chartExitY = -12,
  chartExitScale = 0.74,
  mapCloserX = 0,
  mapCloserY = -25,
  mapCloserScale = 1.04,
  debtTextCloserX = 25,
  debtTextCloserY = -258,
  debtTextCloserScale = 1.08,
  blueLineColor = "#1676C2",
  greyLineColor = "#888C91",
  darkTextColor = "#1A1A1A",
  orangeAccentColor = "#E85D24",
  graphStartFrame = 0,
  graphRiseEndFrame = 30,
  graphDrawEndFrame = 150,
  graphMoveStartFrame = 150,
  graphMoveEndFrame = 185,
  mapStartFrame = 165,
  mapEndFrame = 210,
  debtStartFrame = 190,
  debtEndFrame = 240,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const graphRise = spring({
    frame: frame - graphStartFrame,
    fps,
    config: { damping: 17, mass: 0.8, stiffness: 105 },
    durationInFrames: Math.max(1, graphRiseEndFrame - graphStartFrame),
  });
  const graphMove = interpolate(
    frame,
    [graphMoveStartFrame, graphMoveEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const closerProgress = interpolate(
    frame,
    [closerStartFrame, closerEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const graphSettledLeft = interpolate(
    graphMove,
    [0, 1],
    [graphX, graphFinalX],
  );
  const graphSettledTop = interpolate(graphMove, [0, 1], [graphY, graphFinalY]);
  const graphSettledScale = interpolate(
    graphMove,
    [0, 1],
    [graphScale, graphFinalScale],
  );
  const graphLeft = interpolate(
    closerProgress,
    [0, 1],
    [graphSettledLeft, chartExitX],
  );
  const graphTop = interpolate(
    closerProgress,
    [0, 1],
    [graphSettledTop, chartExitY],
  );
  const graphCurrentScale = interpolate(
    closerProgress,
    [0, 1],
    [graphSettledScale, chartExitScale],
  );
  const graphEntranceY = interpolate(graphRise, [0, 1], [78, 0]);
  const graphOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mapPop = spring({
    frame: frame - mapStartFrame,
    fps,
    config: { damping: 12, mass: 0.82, stiffness: 120 },
    durationInFrames: Math.max(1, mapEndFrame - mapStartFrame),
  });
  const mapOpacity = interpolate(
    frame,
    [mapStartFrame, mapStartFrame + 18],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const mapRise = interpolate(mapPop, [0, 1], [260, 0]);
  const mapSquash = interpolate(mapPop, [0, 0.55, 1], [0.68, 1.08, 1]);
  const mapCurrentX = interpolate(closerProgress, [0, 1], [mapX, mapCloserX]);
  const mapCurrentY = interpolate(closerProgress, [0, 1], [mapY, mapCloserY]);
  const mapCurrentScale = interpolate(
    closerProgress,
    [0, 1],
    [mapScale, mapCloserScale],
  );
  const debtTextCurrentX = interpolate(
    closerProgress,
    [0, 1],
    [debtTextX, debtTextCloserX],
  );
  const debtTextCurrentY = interpolate(
    closerProgress,
    [0, 1],
    [debtTextY, debtTextCloserY],
  );
  const debtTextCurrentScale = interpolate(
    closerProgress,
    [0, 1],
    [debtTextScale, debtTextCloserScale],
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
          left: "50%",
          top: "50%",
          width: 1050,
          height: 610,
          opacity: graphOpacity,
          transform: `translate(calc(-50% + ${graphLeft}px), calc(-50% + ${graphTop + graphEntranceY}px)) scale(${graphCurrentScale})`,
          transformOrigin: "center center",
          willChange: "transform, opacity",
          zIndex: 10,
        }}
      >
        <InflationChart
          blueLineColor={blueLineColor}
          greyLineColor={greyLineColor}
          darkTextColor={darkTextColor}
          orangeAccentColor={orangeAccentColor}
          graphDrawEndFrame={graphDrawEndFrame}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 960 + mapCurrentX,
          top: 540 + mapCurrentY,
          width: 780,
          height: 520,
          opacity: mapOpacity,
          transform: `translate(-50%, calc(-50% + ${mapRise}px)) scale(${mapCurrentScale * mapSquash}, ${mapCurrentScale})`,
          transformOrigin: "center bottom",
          zIndex: 22,
          willChange: "transform, opacity",
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
            transform: `scale(${interpolate(mapPop, [0, 1], [0.62, 1])})`,
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
            filter: `drop-shadow(0 34px 28px ${WARM_SHADOW}) saturate(0.86) contrast(1.03)`,
          }}
        />
      </div>

      <DebtText
        text={debtAmountText}
        x={debtTextX}
        y={debtTextY}
        scale={debtTextScale}
        closerX={debtTextCurrentX}
        closerY={debtTextCurrentY}
        closerScale={debtTextCurrentScale}
        startFrame={debtStartFrame}
        endFrame={debtEndFrame}
        darkTextColor={darkTextColor}
      />
    </AbsoluteFill>
  );
};
