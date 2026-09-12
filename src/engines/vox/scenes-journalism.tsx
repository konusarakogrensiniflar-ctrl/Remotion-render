import React from "react";
import type { Beat } from "./schema";
import { INK, RED, hash } from "./palette";
import { Scene, beatAnchors, KickerChip } from "./shared";
import { ThematicDocument } from "./documents";
import { DeskPerspective } from "./desk";
import { GeoMap } from "./cartography";
import { ScaleMatrix, ComparativeBarChart, BalanceScale, NetworkGraph, AnnotatedTrendline, InfluenceFlow } from "./infographics";

/**
 * scenes-journalism.tsx — Vox Engine 2.0 Gazetecilik Sahne Arke tipleri
 *
 * document · map · dataviz · network
 *
 * Dünya standartlarındaki görsel araştırmacı/video-makale estetiğini
 * tam otomasyonla Remotion'da render eden sahneler.
 */

// ── 1. DOCUMENT SCENE (Tematik Evrak / Gazete / Parşömen / Telgraf / Lab) ──

export const DocumentScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const at = beatAnchors(beat, 2, 4, 16);
  const headline = beat.props.emphasis.join(" ") || beat.props.keywords.slice(0, 3).join(" ").toUpperCase();
  const subhead = beat.props.kicker || "PRIMARY HISTORICAL RECORD";
  const seed = hash(beat.id);
  const docType = beat.props.docType || (seed > 0.5 ? "declassified" : "newspaper");

  return (
    <Scene beat={beat} accent={false}>
      <DeskPerspective tiltX={10} tiltY={-2} drift={true}>
        <ThematicDocument
          type={docType}
          title={headline}
          body={beat.props.text}
          subhead={subhead}
          startFrame={at[0]}
          width={940}
        />
      </DeskPerspective>
    </Scene>
  );
};

// ── 2. MAP SCENE (Coğrafi Harita ve Rota) ──────────────────────────────────

export const MapScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const at = beatAnchors(beat, 2, 6, 18);
  const placeName = (beat.props.emphasis[0] || beat.props.keywords[0] || "LOCATION").toUpperCase();
  const kicker = beat.props.kicker || "STRATEGIC GEOGRAPHY";

  // Rota veya tekil lokasyon
  const seed = hash(beat.id);
  const isRoute = seed > 0.45;

  const routeConfig = isRoute
    ? {
        from: [240, 140] as [number, number], // Kuzey Amerika civarı
        to: [480, 130] as [number, number],   // Avrupa civarı
        label: placeName,
      }
    : undefined;

  return (
    <Scene beat={beat} accent={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 12 }}>
        <KickerChip text={kicker} startFrame={2} align="center" />
        <DeskPerspective tiltX={14} tiltY={0} drift={true}>
          <GeoMap
            startFrame={at[0]}
            highlightRegion={seed > 0.7 ? "europe" : seed > 0.4 ? "northAmerica" : "world"}
            route={routeConfig}
            targetLabel={placeName}
            width={1060}
            height={580}
          />
        </DeskPerspective>
      </div>
    </Scene>
  );
};

// ── 3. DATAVIZ SCENE (Ölçek Matrisi, Bar Grafik veya Terazi) ───────────────

export const DataVizScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const at = beatAnchors(beat, 2, 4, 14);
  const numMatch = beat.props.text.match(/\d+/);
  const rawNum = numMatch ? parseInt(numMatch[0], 10) : 65;
  const count = Math.min(100, Math.max(5, rawNum > 100 ? rawNum % 100 : rawNum));
  const label = beat.props.emphasis.join(" ") || beat.props.keywords[0]?.toUpperCase() || "RATIO";
  const seed = hash(beat.id);

  // Varyant: Eğer beat içinde "vs" veya 2 karşılaştırma varsa Terazi, yoksa Ölçek Matrisi
  const isCompare = beat.props.compareLabels && beat.props.compareLabels.length >= 2;

  return (
    <Scene beat={beat} accent={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, zIndex: 12 }}>
        <KickerChip text={beat.props.kicker || "DATA INVESTIGATION"} startFrame={2} align="center" />
        <DeskPerspective tiltX={8} tiltY={-1} drift={true}>
          {isCompare ? (
            <BalanceScale
              leftLabel={beat.props.compareLabels![0]}
              rightLabel={beat.props.compareLabels![1]}
              tiltSide={seed > 0.5 ? "left" : "right"}
              startFrame={at[0]}
            />
          ) : seed > 0.55 ? (
            <ComparativeBarChart
              bars={[
                { label: label, value: count, displayValue: `${count}%`, color: RED },
                { label: "STANDARD BENCHMARK", value: 35, displayValue: "35%", color: INK },
              ]}
              startFrame={at[0]}
              width={900}
            />
          ) : (
            <ScaleMatrix
              highlightedCount={count}
              label={label}
              startFrame={at[0]}
              unitLabel="%"
            />
          )}
        </DeskPerspective>
      </div>
    </Scene>
  );
};

// ── 4. NETWORK SCENE (İlişki ve Karakter Ağı / Conspiracy Board) ───────────

export const NetworkScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const at = beatAnchors(beat, 2, 4, 16);
  const words = beat.props.emphasis.length >= 2 ? beat.props.emphasis : beat.props.keywords.slice(0, 3).map((k) => k.toUpperCase());
  const kicker = beat.props.kicker || "THE CONNECTION WEB";

  const nodes = [
    { id: "1", label: words[0] || "KEY ACTOR", sub: "PRIMARY NODE", x: 260, y: 160 },
    { id: "2", label: words[1] || "INSTITUTION", sub: "FINANCIAL BACKER", x: 800, y: 180 },
    { id: "3", label: words[2] || "EVENT / SHIFT", sub: "CATALYST", x: 540, y: 440 },
  ];

  const links = [
    { from: "1", to: "2", label: "LINKED TO" },
    { from: "2", to: "3", label: "INFLUENCED" },
    { from: "1", to: "3", label: "DRIVES" },
  ];

  return (
    <Scene beat={beat} accent={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, zIndex: 12 }}>
        <KickerChip text={kicker} startFrame={2} align="center" />
        <DeskPerspective tiltX={12} tiltY={-2} drift={true}>
          <NetworkGraph nodes={nodes} links={links} startFrame={at[0]} />
        </DeskPerspective>
      </div>
    </Scene>
  );
};

// ── 5. TRENDLINE SCENE (Tarihsel Çizgi Grafiği & Scrubber) ────────────────

export const TrendlineScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const at = beatAnchors(beat, 2, 4, 16);
  const kicker = beat.props.kicker || "HISTORICAL TRAJECTORY";

  // VTT metninden yıl ve noktaları tespit et veya default oluştur
  const years = (beat.props.text.match(/\b(19\d\d|20\d\d)\b/g) || []).slice(0, 4);
  const words = beat.props.emphasis.length ? beat.props.emphasis : beat.props.keywords.slice(0, 4).map((k) => k.toUpperCase());

  const points = beat.props.trendPoints || [
    { label: words[0] || "BASELINE", year: years[0] || "START", value: 24 },
    { label: words[1] || "ACCELERATION", year: years[1] || "SURGE", value: 58 },
    { label: words[2] || "TURNING POINT", year: years[2] || "INFLECTION", value: 42 },
    { label: words[3] || "PEAK / TODAY", year: years[3] || "RECORD", value: 89, isHighlight: true },
  ];

  return (
    <Scene beat={beat} accent={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, zIndex: 12 }}>
        <KickerChip text={kicker} startFrame={2} align="center" />
        <DeskPerspective tiltX={11} tiltY={-1} drift={true}>
          <AnnotatedTrendline points={points} title={words.slice(0, 2).join(" ") || "TIMELINE DATA"} startFrame={at[0]} />
        </DeskPerspective>
      </div>
    </Scene>
  );
};

// ── 6. FLOW SCENE (Sebep - Mekanizma - Sonuç Akışı) ────────────────────────

export const FlowScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const at = beatAnchors(beat, 2, 4, 16);
  const kicker = beat.props.kicker || "SYSTEM MECHANISM";
  const words = beat.props.emphasis.length >= 3 ? beat.props.emphasis : beat.props.keywords.slice(0, 3).map((k) => k.toUpperCase());

  const stages = beat.props.flowNodes
    ? beat.props.flowNodes.map((n) => ({ title: n.label, desc: n.sub }))
    : [
        { title: words[0] || "ROOT CAUSE", tag: "TRIGGER", desc: "Foundational catalyst driving the system" },
        { title: words[1] || "THE MECHANISM", tag: "FRICTION", desc: "Structural pressure multiplying the effect" },
        { title: words[2] || "SYSTEM IMPACT", tag: "OUTCOME", desc: "Unintended consequence across the environment" },
      ];

  return (
    <Scene beat={beat} accent={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, zIndex: 12 }}>
        <KickerChip text={kicker} startFrame={2} align="center" />
        <DeskPerspective tiltX={13} tiltY={-2} drift={true}>
          <InfluenceFlow stages={stages} startFrame={at[0]} />
        </DeskPerspective>
      </div>
    </Scene>
  );
};
