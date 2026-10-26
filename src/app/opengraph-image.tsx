import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "SLIIQQUE Studio: premium creative studio powered by AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/sliiqque-logo.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#030303", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={88} height={88} alt="" />
          <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#ff4718" }}>Lagos, Nigeria</div>
        </div>
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
