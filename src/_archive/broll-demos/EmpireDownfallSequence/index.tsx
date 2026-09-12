import { Audio, interpolate, Series, staticFile } from "remotion";
import { z } from "zod";
import { BrollPeaceDealScene } from "../BrollPeaceDealScene";
import { BrollDownfallBeginScene } from "../BrollDownfallBeginScene";
import { BrollOceanTankerScene } from "../BrollOceanTankerScene";
import { BrollInflationDebtScene } from "../BrollInflationDebtScene";
import { BrollDebtTransitionNextScene } from "../BrollDebtTransitionNextScene";
import { BrollDollarDeclineScene } from "../BrollDollarDeclineScene";
import { BrollEmpireBillScene } from "../BrollEmpireBillScene";

// Durations are timed to the voiceover (public/audio/vo.mp3, 47.3s @30fps).
// Beat 7 (DebtVsEconomy) removed; 5-6 flows into 8.
const D = {
  peace: 100, // 0.00 - 3.35  "...peace deal"
  downfall: 114, // 3.35 - 7.15  "downfall...begun"
  ocean: 364, // 7.15 - 19.30 "Hormuz" + "$116 a barrel"
  inflation: 357, // 19.30 - 31.20 "inflation" / "$39T" / "bigger than economy"
  debt: 123, // 31.20 - 35.30 "interest > military"
  dollar: 148, // 35.30 - 40.25 "leaving the dollar"
  bill: 213, // 40.25 - 47.31 "Empires don't end... can no longer pay"
};

export const EMPIRE_DOWNFALL_SEQUENCE_DURATION =
  D.peace + D.downfall + D.ocean + D.inflation + D.debt + D.dollar + D.bill;

export const empireDownfallSequenceSchema = z.object({});

// NOTE: position/look props mirror the saved <Composition> defaultProps in
// Root.tsx; the *timing* props (start/end/duration frames) are retimed here to
// match the voiceover and so each scene fits its (often shorter) beat window.
const peaceDealProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  trumpAsset: "broll-peace-deal/trump-halftone.png",
  khameneiAsset: "broll-peace-deal/iran-halftone.png",
  whiteHouseAsset: "broll-peace-deal/white-house-foreground.png",
  whiteHouseX: 0,
  whiteHouseY: -469,
  whiteHouseScale: 2,
  whiteHouseStartFrame: 6,
  whiteHouseEndFrame: 30,
  trumpX: -430,
  trumpY: 30,
  trumpScale: 1,
  trumpStartFrame: 28,
  trumpEndFrame: 54,
  khameneiX: 430,
  khameneiY: 30,
  khameneiScale: 1,
  khameneiStartFrame: 52,
  khameneiEndFrame: 84,
  portraitStrokeColor: "#E04329",
  portraitStrokeOpacity: 0.95,
  trumpStrokeX: -28,
  trumpStrokeY: 10,
  khameneiStrokeX: 28,
  khameneiStrokeY: 10,
};

const downfallProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  mastheadText: "The Nation",
  estText: "EST. 1865",
  sectionText: "POLITICS",
  siteText: "THENATION.COM",
  dateText: "APRIL 8, 2026",
  headlineBefore: "The United States Is Self-Destructing Amid ",
  highlightPhrase: "Empire Collapse",
  headlineAfter: "",
  deckText:
    "Dangerously wrong priorities will accelerate America's decline.",
  bylineText: "By Julia Gledhill",
  ledeText:
    "The Trump administration's fiscal year 2027 budget request is a bat signal to Congress. The American empire is flailing, and the White House is working to ensure that the country declines with it. If there was ever a time for lawmakers to discipline the Pentagon, it is now.",
  highlightColor: "#F5C518",
};

const oceanTankerProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  shipAsset: "broll-ocean-tanker/tanker-ship.png",
  oceanAsset: "broll-ocean-tanker/keyed-ocean.webm",
  shipX: 0,
  shipY: -181,
  shipScale: 1,
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
  // $116 counter lands on "...$116 a barrel" (~13.7s abs = ~6.5s into beat).
  counterStartFrame: 195,
  counterEndValue: 116,
  counterDurationFrames: 55,
  counterX: 1479,
  counterY: 322,
  counterScale: 1,
  showBarrel: true,
  barrelAsset: "broll-ocean-tanker/oil-barrel.png",
  barrelHeight: 140,
  barrelGap: 28,
  barrelOffsetY: 0,
  outroStartFrame: 336,
  outroEndFrame: 364,
  counterRetractX: 2290,
  shipOutroY: 820,
  oceanOutroY: 850,
};

const inflationDebtProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  mapAsset: "broll-inflation-debt/us-map.png",
  graphX: 0,
  graphY: -14,
  graphScale: 1,
  graphFinalX: -438,
  graphFinalY: -12,
  graphFinalScale: 0.74,
  mapX: 478,
  mapY: 63,
  mapScale: 1,
  debtAmountText: "$39 TRILLION",
  debtTextX: 503,
  debtTextY: -170,
  debtTextScale: 1,
  closerStartFrame: 270,
  closerEndFrame: 300,
  chartExitX: -1550,
  chartExitY: -12,
  chartExitScale: 0.74,
  mapCloserX: 0,
  mapCloserY: -151,
  mapCloserScale: 1.04,
  debtTextCloserX: 25,
  debtTextCloserY: -380,
  debtTextCloserScale: 1.08,
  blueLineColor: "#E8741E ",
  greyLineColor: "#888C91",
  darkTextColor: "#1A1A1A",
  orangeAccentColor: "#E85D24",
  graphStartFrame: 0,
  graphRiseEndFrame: 30,
  graphDrawEndFrame: 150,
  graphMoveStartFrame: 150,
  graphMoveEndFrame: 185,
  mapStartFrame: 165,
  mapEndFrame: 210,
  debtStartFrame: 190,
  debtEndFrame: 240,
};

const debtTransitionProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  mapAsset: "broll-inflation-debt/us-map.png",
  debtAmountText: "$39 TRILLION",
  interestLabelText: "Interest: $1 trillion",
  workGearAsset: "broll-debt-transition-next/work-gear.png",
  usWorkerAsset: "broll-debt-transition-next/us-worker.png",
  tankAsset: "broll-debt-transition-next/tank.png",
  usSoldierAsset: "broll-debt-transition-next/us-soldier-2.png",
  mapX: 0,
  mapY: -151,
  mapScale: 1.04,
  mapWidth: 780,
  mapHeight: 520,
  debtTextX: 25,
  debtTextY: -392,
  debtTextScale: 1.08,
  interestLabelX: 25,
  interestLabelY: 54,
  interestLabelScale: 1.4,
  // Compressed staging to fit the ~4.1s "interest > military" beat.
  interestLabelStartFrame: 40,
  interestLabelEndFrame: 58,
  interestLabelFontSize: 38,
  leftGroupX: -455,
  rightGroupX: 455,
  workGearX: -52,
  workGearY: 653,
  workGearScale: 1.3,
  workerX: -75,
  workerY: 344,
  workerScale: 1.3,
  tankX: 42,
  tankY: 694,
  tankScale: 1,
  soldierX: 188,
  soldierY: 445,
  soldierScale: 1.7,
  workGearStartFrame: 12,
  workGearEndFrame: 32,
  workerStartFrame: 22,
  workerEndFrame: 48,
  tankStartFrame: 62,
  tankEndFrame: 86,
  soldierStartFrame: 76,
  soldierEndFrame: 102,
  darkTextColor: "#1A1A1A",
  mapShadowColor: "rgba(71, 50, 28, 0.26)",
  cutoutShadowColor: "rgba(71, 50, 28, 0.3)",
  strokeColor: "#E04329",
  strokeOpacity: 0.86,
  workerStrokeX: -24,
  workerStrokeY: 10,
  soldierStrokeX: 24,
  soldierStrokeY: 10,
};

const dollarProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  peopleAsset: "broll-dollar-yuan/putin-xi.png",
  peopleX: 0,
  peopleY: -60,
  peopleWidth: 1378,
  peopleStartFrame: 16,
  peopleRisePx: 410,
  peopleRiseDurationFrames: 34,
  strokeColor: "#E04329",
  strokeOpacity: 0.95,
  peopleStrokeX: -26,
  peopleStrokeY: 8,
  buildingAsset: "broll-dollar-yuan/china-building.png",
  buildingX: -51,
  buildingWidth: 1871,
  buildingBottom: -212,
  buildingStartFrame: 2,
  buildingRisePx: 360,
  buildingRiseDurationFrames: 28,
  bubbleAccentColor: "#E04329",
  bubbleTextColor: "#1A1A1A",
  bubbleFontSize: 45,
  xiBubbleAsset: "broll-dollar-yuan/bubble-round.png",
  xiTextPrefix: "Let's trade in",
  xiTextAccent: "Yuan ¥",
  xiBubbleX: 617,
  xiBubbleY: 133,
  xiBubbleWidth: 257,
  xiBubbleFlipX: false,
  xiBubbleTilt: -17,
  xiBubbleStartFrame: 56,
  xiTextTopPct: 18,
  xiTextHeightPct: 48,
  xiTextWidthPct: 72,
  putinBubbleAsset: "broll-dollar-yuan/bubble-rect.png",
  putinTextPrefix: "Ok,",
  putinTextAccent: "deal!",
  putinBubbleX: 1440,
  putinBubbleY: 207,
  putinBubbleWidth: 318,
  putinBubbleFlipX: false,
  putinBubbleTilt: -17,
  putinBubbleStartFrame: 88,
  putinTextTopPct: 24,
  putinTextHeightPct: 55,
  putinTextWidthPct: 80,
};

const empireBillProps = {
  backgroundAsset: "broll-ocean-tanker/mo-photoshop-background.png",
  line1: "EMPIRES DON'T END WITH A WAR.",
  line2: "THEY END WITH A BILL THEY CAN NO LONGER PAY.",
  textColor: "#1A1A1A",
  accentColor: "#E04329",
  accentLine2: false,
  fontSize: 60,
  containerWidth: 1619,
  // Two sentences timed to the two halves of the final VO line.
  startFrame: 10,
  perCharFrames: 1.8,
  periodPauseFrames: 26,
  commaPauseFrames: 8,
  gapFrames: 24,
  cursorChar: "▌",
  cursorBlinkFrames: 7,
  vignetteStartFrame: 182,
  vignetteEndFrame: 213,
  vignetteIntensity: 0.34,
  moneyAsset: "broll-empire-bill/burning-bill.webm",
  moneyX: 0,
  moneyY: 415,
  moneyScale: 0.6,
  moneyOpacity: 1,
  moneyStartFrame: 0,
  moneyFadeFrames: 22,
};

// Audio ships as separate stems (VO + music) for external mixing, so the
// composition renders as a clean, silent video. Set BAKE_AUDIO to true to mix
// the VO + music back into the comp render.
const BAKE_AUDIO = false;

export const EmpireDownfallSequence: React.FC = () => {
  return (
    <>
      {BAKE_AUDIO ? (
        <>
          {/* Tense documentary score, ducked under the narration with fades. */}
          <Audio
            src={staticFile("audio/music-tense-docu.mp3")}
            volume={(f) =>
              interpolate(
                f,
                [
                  0,
                  24,
                  EMPIRE_DOWNFALL_SEQUENCE_DURATION - 50,
                  EMPIRE_DOWNFALL_SEQUENCE_DURATION,
                ],
                [0, 0.2, 0.2, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            }
          />
          <Audio src={staticFile("audio/vo.mp3")} />
        </>
      ) : null}
      <Series>
        {/* Beat 1: ...are signing a peace deal. */}
        <Series.Sequence durationInFrames={D.peace}>
          <BrollPeaceDealScene {...peaceDealProps} />
        </Series.Sequence>

        {/* Beat 2: ...the downfall has already begun. */}
        <Series.Sequence durationInFrames={D.downfall}>
          <BrollDownfallBeginScene {...downfallProps} />
        </Series.Sequence>

        {/* Beats 3-4: Strait of Hormuz; oil to $116 a barrel. */}
        <Series.Sequence durationInFrames={D.ocean}>
          <BrollOceanTankerScene {...oceanTankerProps} />
        </Series.Sequence>

        {/* Beats 5-7: inflation 3-yr high; $39T; bigger than the economy. */}
        <Series.Sequence durationInFrames={D.inflation}>
          <BrollInflationDebtScene {...inflationDebtProps} />
        </Series.Sequence>

        {/* Beat 8: interest alone costs more than its military. */}
        <Series.Sequence durationInFrames={D.debt}>
          <BrollDebtTransitionNextScene {...debtTransitionProps} />
        </Series.Sequence>

        {/* Beat 9: the world is quietly leaving the dollar behind. */}
        <Series.Sequence durationInFrames={D.dollar}>
          <BrollDollarDeclineScene {...dollarProps} />
        </Series.Sequence>

        {/* Beat 10: empires end with a bill they can no longer pay. */}
        <Series.Sequence durationInFrames={D.bill}>
          <BrollEmpireBillScene {...empireBillProps} />
        </Series.Sequence>
      </Series>
    </>
  );
};
