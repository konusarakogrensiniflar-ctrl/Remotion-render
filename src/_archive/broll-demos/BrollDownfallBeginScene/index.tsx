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
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/PTSerif";

export const BROLL_DOWNFALL_BEGIN_SCENE_DURATION = 120;

const displayFont = loadDisplay();
const bodyFont = loadBody();

export const brollDownfallBeginSceneSchema = z.object({
  backgroundAsset: z
    .string()
    .default("broll-ocean-tanker/mo-photoshop-background.png"),
  mastheadText: z.string().default("The Nation"),
  estText: z.string().default("EST. 1865"),
  sectionText: z.string().default("POLITICS"),
  siteText: z.string().default("THENATION.COM"),
  dateText: z.string().default("APRIL 8, 2026"),
  headlineBefore: z
    .string()
    .default("The United States Is Self-Destructing Amid "),
  highlightPhrase: z.string().default("Empire Collapse"),
  headlineAfter: z.string().default(""),
  deckText: z
    .string()
    .default("Dangerously wrong priorities will accelerate America's decline."),
  bylineText: z.string().default("By Julia Gledhill"),
  ledeText: z
    .string()
    .default(
      "The Trump administration's fiscal year 2027 budget request is a bat signal to Congress. The American empire is flailing, and the White House is working to ensure that the country declines with it. If there was ever a time for lawmakers to discipline the Pentagon, it is now.",
    ),
  highlightColor: z.string().default("#F5C518"),
});

export type BrollDownfallBeginSceneProps = z.infer<
  typeof brollDownfallBeginSceneSchema
>;

const PAPER = "#FBFAF4";
const INK = "#15130F";
const RULE = "rgba(21,19,15,0.82)";
const FAINT = "rgba(21,19,15,0.16)";
const WARM_SHADOW = "rgba(54, 41, 24, 0.34)";

// Fixed (deterministic) line widths so faux body copy renders identically every frame.
const colWidths = [
  [100, 96, 99, 92, 97],
  [98, 100, 90, 96, 99, 86, 100, 78],
  [100, 94, 98, 91, 100, 84, 96, 72],
];

const TextLines: React.FC<{ widths: number[] }> = ({ widths }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
    {widths.map((w, i) => (
      <div
        key={i}
        style={{ height: 7, width: `${w}%`, background: FAINT, borderRadius: 2 }}
      />
    ))}
  </div>
);

export const BrollDownfallBeginScene: React.FC<
  BrollDownfallBeginSceneProps
> = ({
  backgroundAsset = "broll-ocean-tanker/mo-photoshop-background.png",
  mastheadText = "The Nation",
  estText = "EST. 1865",
  sectionText = "POLITICS",
  siteText = "THENATION.COM",
  dateText = "APRIL 8, 2026",
  headlineBefore = "The United States Is Self-Destructing Amid ",
  highlightPhrase = "Empire Collapse",
  headlineAfter = "",
  deckText = "Dangerously wrong priorities will accelerate America's decline.",
  bylineText = "By Julia Gledhill",
  ledeText = "The Trump administration's fiscal year 2027 budget request is a bat signal to Congress. The American empire is flailing, and the White House is working to ensure that the country declines with it. If there was ever a time for lawmakers to discipline the Pentagon, it is now.",
  highlightColor = "#F5C518",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const place = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 95 },
    durationInFrames: 34,
  });
  const rise = interpolate(place, [0, 1], [120, 0]);
  const settleScale = interpolate(place, [0, 1], [0.9, 1]);
  const tilt = interpolate(place, [0, 1], [-4.5, -1.6]);
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow continuous push-in for life.
  const pushIn = interpolate(frame, [0, 120], [1, 1.04], {
    extrapolateRight: "clamp",
  });

  // Amber highlighter sweep across the headline phrase.
  const highlight = interpolate(frame, [42, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

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
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(63,54,42,0.12)), radial-gradient(circle at 50% 60%, rgba(255,255,255,0.16), transparent 42%)",
          mixBlendMode: "soft-light",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: 1200,
            opacity,
            transform: `translateY(${rise}px) scale(${settleScale * pushIn}) rotate(${tilt}deg)`,
            transformOrigin: "center center",
            background: PAPER,
            border: "1px solid rgba(21,19,15,0.16)",
            boxShadow: `0 46px 64px ${WARM_SHADOW}, 0 8px 18px rgba(54,41,24,0.18)`,
            padding: "44px 56px 52px",
            willChange: "transform, opacity",
          }}
        >
          {/* Masthead */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              borderBottom: `3px double ${RULE}`,
              paddingBottom: 12,
            }}
          >
            <div
              style={{
                fontFamily: bodyFont.fontFamily,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: "rgba(21,19,15,0.6)",
                lineHeight: 1.3,
                width: 170,
              }}
            >
              {estText}
              <br />
              SINCE 1865
            </div>
            <div
              style={{
                fontFamily: displayFont.fontFamily,
                fontWeight: 900,
                fontSize: 70,
                color: INK,
                lineHeight: 1,
                letterSpacing: 0.5,
              }}
            >
              {mastheadText}
            </div>
            <div
              style={{
                fontFamily: bodyFont.fontFamily,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: "rgba(21,19,15,0.6)",
                textAlign: "right",
                lineHeight: 1.3,
                width: 170,
              }}
            >
              {dateText}
              <br />
              {siteText}
            </div>
          </div>

          {/* Section bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${RULE}`,
              padding: "8px 0",
              marginBottom: 22,
              fontFamily: bodyFont.fontFamily,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              color: "rgba(21,19,15,0.78)",
            }}
          >
            <span>{sectionText}</span>
            <span style={{ fontWeight: 400, letterSpacing: 1 }}>
              ANALYSIS &amp; OPINION
            </span>
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>
              Comment
            </span>
          </div>

          {/* Headline with highlighter sweep */}
          <h1
            style={{
              fontFamily: displayFont.fontFamily,
              fontWeight: 900,
              fontSize: 66,
              lineHeight: 1.07,
              letterSpacing: -0.5,
              color: INK,
              margin: "0 auto 18px",
              maxWidth: 1020,
              textAlign: "center",
            }}
          >
            {headlineBefore}
            <span style={{ position: "relative", whiteSpace: "nowrap" }}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-2%",
                  right: "-2%",
                  top: "12%",
                  bottom: "8%",
                  background: highlightColor,
                  transform: `scaleX(${highlight})`,
                  transformOrigin: "left center",
                  mixBlendMode: "multiply",
                  borderRadius: 4,
                  zIndex: 0,
                }}
              />
              <span style={{ position: "relative", zIndex: 1 }}>
                {highlightPhrase}
              </span>
            </span>
            {headlineAfter}
          </h1>

          {/* Deck */}
          <p
            style={{
              fontFamily: bodyFont.fontFamily,
              fontStyle: "italic",
              fontSize: 24,
              lineHeight: 1.35,
              color: "rgba(21,19,15,0.74)",
              textAlign: "center",
              margin: "0 auto 14px",
              maxWidth: 880,
            }}
          >
            {deckText}
          </p>

          {/* Byline */}
          <div
            style={{
              fontFamily: bodyFont.fontFamily,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(21,19,15,0.62)",
              textAlign: "center",
              borderBottom: `1px solid ${RULE}`,
              paddingBottom: 18,
              marginBottom: 20,
            }}
          >
            {bylineText}
          </div>

          {/* Three-column body */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              columnGap: 30,
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "33.33%",
                top: 4,
                bottom: 4,
                width: 1,
                background: FAINT,
                marginLeft: -15,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "66.66%",
                top: 4,
                bottom: 4,
                width: 1,
                background: FAINT,
                marginLeft: -15,
              }}
            />

            {/* Column 1: readable lede with drop cap */}
            <div>
              <p
                style={{
                  fontFamily: bodyFont.fontFamily,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: "rgba(21,19,15,0.82)",
                  margin: 0,
                  textAlign: "justify",
                }}
              >
                <span
                  style={{
                    float: "left",
                    fontFamily: displayFont.fontFamily,
                    fontWeight: 900,
                    fontSize: 64,
                    lineHeight: 0.8,
                    paddingRight: 8,
                    paddingTop: 4,
                    color: INK,
                  }}
                >
                  {ledeText.charAt(0)}
                </span>
                {ledeText.slice(1)}
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <TextLines widths={colWidths[1]} />
            </div>

            {/* Column 3 with photo */}
            <div>
              <div
                style={{
                  width: "100%",
                  height: 96,
                  marginBottom: 10,
                  background:
                    "linear-gradient(135deg, #6f6a61, #3c3934), radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1.6px)",
                  backgroundSize: "cover, 6px 6px",
                  filter: "grayscale(1) contrast(1.05)",
                  border: "1px solid rgba(21,19,15,0.2)",
                }}
              />
              <div
                style={{
                  fontFamily: bodyFont.fontFamily,
                  fontStyle: "italic",
                  fontSize: 11,
                  color: "rgba(21,19,15,0.55)",
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}
              >
                The 2027 budget pours money into the Pentagon as the deficit widens.
              </div>
              <TextLines widths={colWidths[2]} />
            </div>
          </div>

          {/* Bottom fade so faux copy dissolves cleanly */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 120,
              background: `linear-gradient(180deg, rgba(251,250,244,0), ${PAPER})`,
              pointerEvents: "none",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const defaultBrollDownfallBeginSceneProps: BrollDownfallBeginSceneProps =
  {
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
