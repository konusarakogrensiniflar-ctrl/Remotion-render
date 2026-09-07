import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { INK, RED, PAPER, HEADLINE, SERIF, hash } from "./palette";

/**
 * documents.tsx — Delil & Arşiv Katmanı (Evidence & Archival Documents)
 *
 * Vox ve Johnny Harris'in "araştırmacı masası" hissini veren; kodla çizilen
 * tarihi gazete kupürleri, gizli evraklar, fosforlu kalem vurguları,
 * sansür bantları ve fiziksel kırtasiye detayları.
 *
 * GPU-suz render için %100 CPU-dostu HTML/CSS ve SVG.
 */

// ── 1. KIRTASİYE DETAYLARI (STATIONERY) ───────────────────────────────────

/** Şeffaf selefon / koli bandı parçası */
export const Tape: React.FC<{
  width?: number;
  height?: number;
  rotate?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ width = 120, height = 34, rotate = -3, opacity = 0.62, style }) => (
  <div
    aria-hidden
    style={{
      width,
      height,
      transform: `rotate(${rotate}deg)`,
      background: "rgba(245, 235, 205, 0.72)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.14), inset 0 1px 2px rgba(255,255,255,0.45)",
      borderLeft: "1px dashed rgba(180, 160, 130, 0.4)",
      borderRight: "1px dashed rgba(180, 160, 130, 0.4)",
      backdropFilter: "blur(1px)",
      opacity,
      pointerEvents: "none",
      ...style,
    }}
  />
);

/** Metalik ataş (Paperclip) */
export const Paperclip: React.FC<{ size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  size = 54,
  rotate = 12,
  style,
}) => (
  <svg
    width={size * 0.45}
    height={size}
    viewBox="0 0 24 54"
    fill="none"
    style={{
      transform: `rotate(${rotate}deg)`,
      filter: "drop-shadow(2px 3px 3px rgba(0,0,0,0.35))",
      pointerEvents: "none",
      ...style,
    }}
    aria-hidden
  >
    <path
      d="M12 4 C6 4, 3 9, 3 16 L3 42 C3 48, 7 51, 12 51 C17 51, 21 48, 21 42 L21 14 C21 9, 18 7, 14 7 C10 7, 7 9, 7 14 L7 38 C7 41, 9 43, 12 43 C15 43, 17 41, 17 38 L17 17"
      stroke="#5A5852"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4 C6 4, 3 9, 3 16 L3 42 C3 48, 7 51, 12 51 C17 51, 21 48, 21 42 L21 14 C21 9, 18 7, 14 7 C10 7, 7 9, 7 14 L7 38 C7 41, 9 43, 12 43 C15 43, 17 41, 17 38 L17 17"
      stroke="#C8C6BE"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Harita iğnesi / raptiye (Pushpin) */
export const Pushpin: React.FC<{ color?: string; size?: number; style?: React.CSSProperties }> = ({
  color = RED,
  size = 40,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    style={{
      filter: "drop-shadow(3px 5px 6px rgba(0,0,0,0.42))",
      pointerEvents: "none",
      ...style,
    }}
    aria-hidden
  >
    <circle cx="20" cy="18" r="13" fill={color} />
    <circle cx="16" cy="14" r="4.5" fill="rgba(255,255,255,0.4)" />
    <circle cx="20" cy="18" r="14" stroke={INK} strokeWidth="2.5" />
    <path d="M20 31 L20 39" stroke="#333" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ── 2. FOSFORLU KALEM VURGUSU (HIGHLIGHTER STROKE) ─────────────────────────

/**
 * HighlighterStroke — Gerçekçi fosforlu kalem darbesi.
 * Metnin arkasından veya üstünden `mix-blend-mode: multiply` ile akar.
 */
export const HighlighterStroke: React.FC<{
  startFrame: number;
  durationFrames?: number;
  color?: string;
  width?: string | number;
  height?: number;
  rotate?: number;
  seed?: number;
}> = ({
  startFrame,
  durationFrames = 16,
  color = "rgba(254, 240, 68, 0.82)", // Neon sarı
  width = "100%",
  height = 36,
  rotate = -0.8,
  seed = 0.5,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  if (p <= 0) return null;

  const skew = ((hash(String(seed)) - 0.5) * 3).toFixed(1);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "-4px",
        bottom: "4px",
        width,
        height,
        transformOrigin: "left center",
        transform: `scaleX(${p}) rotate(${rotate}deg) skewX(${skew}deg)`,
        backgroundColor: color,
        mixBlendMode: "multiply",
        borderRadius: "3px 8px 5px 3px",
        pointerEvents: "none",
        zIndex: 5,
        boxShadow: `0 0 2px ${color}`,
      }}
    />
  );
};

// ── 3. SANSÜR BANDI (REDACTED BAR) ────────────────────────────────────────

/** RedactedBar — Daktilo sansür bandı, gizlenen metni örter veya açar */
export const RedactedBar: React.FC<{
  startFrame: number;
  width?: number | string;
  height?: number;
  mode?: "censor" | "reveal";
  rotate?: number;
}> = ({ startFrame, width = 160, height = 24, mode = "censor", rotate = 0.4 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const scale = mode === "censor" ? p : 1 - p;
  if (scale <= 0) return null;

  return (
    <div
      aria-hidden
      style={{
        display: "inline-block",
        position: "relative",
        width,
        height,
        backgroundColor: INK,
        transformOrigin: "left center",
        transform: `scaleX(${scale}) rotate(${rotate}deg)`,
        borderRadius: 2,
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
    />
  );
};

// ── 4. TARİHİ GAZETE KUPÜRÜ (NEWSPAPER HEADLINE) ───────────────────────────

export const NewspaperHeadline: React.FC<{
  name?: string;
  date?: string;
  edition?: string;
  headline: string;
  subhead?: string;
  snippet?: string;
  startFrame: number;
  width?: number;
}> = ({
  name = "THE DAILY CHRONICLE",
  date = "SPECIAL REPORT",
  edition = "FINAL EDITION",
  headline,
  subhead,
  snippet,
  startFrame,
  width = 960,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
    durationInFrames: 24,
  });

  const op = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tilt = interpolate(drop, [0, 1], [-4, -1.2]);
  const y = interpolate(drop, [0, 1], [100, 0]);

  // Gazete dolgu metinleri
  const filler = snippet ||
    "Investigation yields substantial evidentiary findings across primary records. Multiple independent witnesses confirmed the timeline, leaving pivotal questions open for public inquiry. Historical data points indicate an accelerating trajectory with far-reaching systemic consequences.";

  return (
    <div
      style={{
        position: "relative",
        width,
        background: "#F4F1EA",
        color: INK,
        padding: "36px 44px 40px 44px",
        boxShadow: "0 24px 50px rgba(30, 24, 16, 0.35), 0 4px 12px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.14)",
        transform: `translateY(${y}px) rotate(${tilt}deg)`,
        opacity: op,
        zIndex: 12,
      }}
    >
      {/* Üst bant ve ataş */}
      <Tape width={140} height={32} rotate={-2} style={{ position: "absolute", top: -14, left: "20%" }} />
      <Paperclip size={48} rotate={-8} style={{ position: "absolute", top: -18, right: 36 }} />

      {/* Gazete Üst Başlık Şeridi */}
      <div style={{ borderBottom: `3px double ${INK}`, paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: SERIF, letterSpacing: 2, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", marginBottom: 6 }}>
          <span>{date}</span>
          <span>★ ★ ★</span>
          <span>{edition}</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 900, textAlign: "center", letterSpacing: 3, textTransform: "uppercase" }}>
          {name}
        </div>
        <div style={{ borderTop: `1px solid ${INK}`, marginTop: 6 }} />
      </div>

      {/* Ana Manşet */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <div
          style={{
            fontFamily: HEADLINE,
            fontWeight: 900,
            fontSize: headline.length > 30 ? 58 : 72,
            lineHeight: 1.02,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: -0.5,
          }}
        >
          {headline}
        </div>
        {/* Fosforlu kalem manşetin üzerinden geçer */}
        <HighlighterStroke startFrame={startFrame + 18} durationFrames={20} />
      </div>

      {subhead ? (
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 26,
            textAlign: "center",
            color: RED,
            fontWeight: 700,
            marginBottom: 20,
            borderBottom: "1px solid rgba(0,0,0,0.15)",
            paddingBottom: 14,
          }}
        >
          {subhead}
        </div>
      ) : null}

      {/* İki Sütunlu Gazete Metni */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, fontSize: 16, fontFamily: SERIF, lineHeight: 1.45, textAlign: "justify", opacity: 0.86 }}>
        <div>
          <span style={{ float: "left", fontSize: 44, lineHeight: 0.8, fontFamily: HEADLINE, fontWeight: 900, marginRight: 8, marginTop: 4 }}>
            {filler[0]}
          </span>
          {filler.slice(1, Math.floor(filler.length / 2))}
        </div>
        <div>
          {filler.slice(Math.floor(filler.length / 2))}
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>CASE REF:</span>
            <RedactedBar startFrame={startFrame + 24} width={120} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 5. GİZLİ DEVLET/ŞİRKET EVRAKI (DECLASSIFIED FILE) ──────────────────────

export const DeclassifiedFile: React.FC<{
  classification?: string;
  caseNumber?: string;
  title: string;
  keyFinding: string;
  date?: string;
  startFrame: number;
  width?: number;
}> = ({
  classification = "TOP SECRET",
  caseNumber = "DOSSIER-NO. 849-B",
  title,
  keyFinding,
  date = "DECLASSIFIED BY ORDER",
  startFrame,
  width = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 13, mass: 0.85, stiffness: 130 },
    durationInFrames: 26,
  });

  const op = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stampPop = spring({
    frame: frame - (startFrame + 14),
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 180 },
    durationInFrames: 18,
  });

  const y = interpolate(drop, [0, 1], [90, 0]);
  const rot = interpolate(drop, [0, 1], [3, 0.8]);

  return (
    <div
      style={{
        position: "relative",
        width,
        background: "#EDE9DF",
        color: INK,
        padding: "44px 50px 48px 50px",
        boxShadow: "0 22px 48px rgba(35, 26, 15, 0.32), 0 3px 10px rgba(0,0,0,0.18)",
        border: "1px solid rgba(0,0,0,0.18)",
        transform: `translateY(${y}px) rotate(${rot}deg)`,
        opacity: op,
        fontFamily: "'Courier New', Courier, monospace",
        zIndex: 12,
      }}
    >
      <Pushpin color={RED} size={36} style={{ position: "absolute", top: -14, left: "48%" }} />

      {/* Kırmızı Kaşe Damgası (Rubber Stamp) */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 48,
          transform: `rotate(-14deg) scale(${stampPop})`,
          border: `5px solid ${RED}`,
          padding: "6px 18px",
          color: RED,
          fontFamily: HEADLINE,
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: 4,
          opacity: interpolate(stampPop, [0, 1], [0, 0.88]),
          boxShadow: "inset 0 0 4px rgba(224, 67, 41, 0.3)",
          textTransform: "uppercase",
        }}
      >
        {classification}
      </div>

      {/* Evrak Başlığı */}
      <div style={{ fontSize: 14, letterSpacing: 3, fontWeight: 700, opacity: 0.65, marginBottom: 8 }}>
        {caseNumber} · {date}
      </div>
      <div style={{ height: 2, background: INK, opacity: 0.3, marginBottom: 24 }} />

      <div style={{ fontSize: 34, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20, maxWidth: 620 }}>
        {title}
      </div>

      {/* Vurgulu Bulgular & Sansür Bantları */}
      <div style={{ position: "relative", background: "rgba(0,0,0,0.04)", padding: "20px 24px", borderLeft: `6px solid ${INK}`, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2, color: RED, marginBottom: 6 }}>
          KEY FINDING / RECORD:
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.35, position: "relative", display: "inline-block" }}>
          {keyFinding}
          <HighlighterStroke startFrame={startFrame + 18} height={28} />
        </div>
      </div>

      {/* Sansürlü Paragraf */}
      <div style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.85 }}>
        <span>SUBJECT VERIFIED BY ARCHIVAL INTELLIGENCE. WITNESS IDENTITY: </span>
        <RedactedBar startFrame={startFrame + 10} width={130} height={18} />
        <span> CONFIRMED AT LOCATION: </span>
        <RedactedBar startFrame={startFrame + 16} width={170} height={18} />
        <span>. FURTHER ACTION PENDING CLEARANCE.</span>
      </div>
    </div>
  );
};

// ── 6. YIRTIK KAĞIT KENARI (TORN PAPER EDGE) ──────────────────────────────

/**
 * TornEdge — Gerçekçi yırtılmış kağıt kenarı (lifli / pürüzlü doku).
 * Belge veya gazete kupürlerinin alt/üst kenarlarına pürüzlü gerçekçilik katar.
 */
export const TornEdge: React.FC<{
  width?: number | string;
  height?: number;
  position?: "top" | "bottom";
  color?: string;
  style?: React.CSSProperties;
}> = ({ width = "100%", height = 12, position = "bottom", color = "#EDE9DF", style }) => {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [position]: -height + 1,
        width,
        height,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: "100%",
          transform: position === "top" ? "scaleY(-1)" : "none",
        }}
      >
        <path
          d="M 0,0 L 0,6 Q 30,18 60,8 T 120,12 T 180,6 T 240,16 T 300,7 T 360,14 T 420,5 T 480,15 T 540,8 T 600,16 T 660,7 T 720,14 T 780,6 T 840,15 T 900,8 T 960,14 T 1020,6 T 1080,15 T 1140,8 T 1200,12 L 1200,0 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

// ── 7. POLAROID / KANIT FOTOĞRAFI (POLAROID PHOTO CARD) ───────────────────

/**
 * PolaroidCard — Johnny Harris / Vox tarzı masaya fırlatılan Polaroid kanıt fotoğrafı.
 * - Karanlıktan renge doğru banyo olma (film development) efekti.
 * - Alt beyaz kenarlıkta daktilo / el yazısı açıklama ve tarih.
 * - Üstte şeffaf bant parçası.
 */
export const PolaroidCard: React.FC<{
  asset?: string;
  label?: string;
  sublabel?: string;
  startFrame: number;
  width?: number;
  rotate?: number;
  tint?: string;
}> = ({
  asset,
  label,
  sublabel = "ARCHIVAL EVIDENCE",
  startFrame,
  width = 380,
  rotate = -3.5,
  tint = RED,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
    durationInFrames: 24,
  });

  const op = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Polaroid banyo olma efekti (karanlık/sepia'dan yavaş yavaş net renge açılma)
  const develop = interpolate(frame, [startFrame + 4, startFrame + 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const photoBrightness = interpolate(develop, [0, 1], [0.35, 1]);
  const photoContrast = interpolate(develop, [0, 1], [0.7, 1.12]);
  const photoSepia = interpolate(develop, [0, 1], [0.8, 0.15]);

  const y = interpolate(drop, [0, 1], [80, 0]);
  const rot = interpolate(drop, [0, 1], [rotate * 1.8, rotate]);

  const photoHeight = Math.round(width * 0.96);

  return (
    <div
      style={{
        position: "relative",
        width,
        background: "#F7F6F1",
        padding: "16px 16px 26px 16px",
        boxShadow: "0 20px 42px rgba(26, 20, 14, 0.38), 0 3px 10px rgba(0,0,0,0.18)",
        border: "1px solid rgba(0,0,0,0.12)",
        transform: `translateY(${y}px) rotate(${rot}deg)`,
        opacity: op,
        zIndex: 12,
      }}
    >
      {/* Üst Koli Bandı */}
      <Tape width={100} height={28} rotate={1.5} style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%) rotate(1.5deg)" }} />

      {/* Fotoğraf Alanı */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: photoHeight,
          background: "#1E1A16",
          overflow: "hidden",
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.6)",
        }}
      >
        {asset ? (
          <Img
            src={staticFile(asset)}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: `brightness(${photoBrightness}) contrast(${photoContrast}) sepia(${photoSepia})`,
              transform: `scale(${1.02 + develop * 0.03})`,
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            <span style={{ fontFamily: HEADLINE, fontSize: 24, fontWeight: 900 }}>EVIDENCE STILL</span>
          </div>
        )}

        {/* Polaroid film parlama tabakası */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Alt Beyaz Çene / El Yazısı Etiket */}
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 3, paddingInline: 4 }}>
        {label ? (
          <div
            style={{
              fontFamily: HEADLINE,
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: 1,
              color: INK,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 13,
            color: tint,
            letterSpacing: 0.5,
          }}
        >
          {sublabel}
        </div>
      </div>
    </div>
  );
};

// ── 8. KÜTÜPHANE KAYNAK FİŞİ / DİPNOT (SOURCE FOOTNOTE / CITATION BADGE) ───

/**
 * SourceFootnote — İddiaları akademik veya resmi bir kaynağa dayandıran
 * kütüphane fişi / dipnot rozeti. Ekranın köşesine yerleşir ve güvenilirlik katar.
 */
export const SourceFootnote: React.FC<{
  sourceText: string;
  subText?: string;
  startFrame?: number;
  position?: "bottom-left" | "bottom-right";
}> = ({
  sourceText,
  subText = "PRIMARY SOURCE VERIFICATION",
  startFrame = 12,
  position = "bottom-left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slide = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 140 },
    durationInFrames: 20,
  });

  const op = interpolate(frame, [startFrame, startFrame + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const xOffset = position === "bottom-left"
    ? interpolate(slide, [0, 1], [-80, 0])
    : interpolate(slide, [0, 1], [80, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 34,
        [position === "bottom-left" ? "left" : "right"]: 36,
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        background: PAPER,
        border: `2px solid ${INK}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        transform: `translateX(${xOffset}px)`,
        opacity: op,
        zIndex: 50,
        maxWidth: 520,
        pointerEvents: "none",
      }}
    >
      {/* Sol Kırmızı Şerit */}
      <div
        style={{
          width: 8,
          background: RED,
        }}
      />
      <div style={{ padding: "8px 16px 8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontFamily: HEADLINE,
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: 2,
            color: RED,
            textTransform: "uppercase",
          }}
        >
          {subText}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 15,
            color: INK,
            letterSpacing: 0.3,
            lineHeight: 1.2,
          }}
        >
          {sourceText}
        </div>
      </div>
    </div>
  );
};
