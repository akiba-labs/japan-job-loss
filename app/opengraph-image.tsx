import { ImageResponse } from "next/og";

export const alt = "Japan Job Loss Check: ISA notice, Hello Work and insurance deadlines after quitting a job in Japan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "64px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.28em", textTransform: "uppercase", color: "#f0b429" }}>Free · Japan · 退職 · ハローワーク · 所属機関届出</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1050 }}>Quit or lost your job in Japan?</div>
          <div style={{ display: "flex", fontSize: 30, color: "#9b9588", maxWidth: 1050, lineHeight: 1.35 }}>ISA notice in 14 days · ~3-month inactivity risk · Hello Work / 雇用保険 · 任意継続 vs 国保 · National Pension switch</div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 22, color: "#9b9588" }}>
          <span style={{ color: "#99f6e4" }}>Dated checklist</span>
          <span>Visa · benefits · insurance</span>
          <span>Free JSON API · no login</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
