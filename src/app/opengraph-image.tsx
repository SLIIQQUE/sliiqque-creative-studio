import { ImageResponse } from "next/og";

export const alt = "SLIIQQUE Studio: premium creative studio powered by AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#030303", color: "#fff", padding: 72 }}>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#ff4718" }}>Lagos, Nigeria</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>SLIIQQUE</div>
          <div style={{ fontSize: 44, marginTop: 24, color: "#f5f5f5" }}>Premium creative studio powered by AI</div>
        </div>
        <div style={{ fontSize: 30, color: "#bdbdbd" }}>AI commercials · AI UGC · AI photography · Brand launches</div>
      </div>
    ),
    size,
  );
}
