import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0B0D12",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", fontSize: 48, color: "#33E0C2", fontFamily: "monospace" }}>
          $ fathir sthore --init
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 700,
            color: "#E7E9EE",
            fontFamily: "monospace",
          }}
        >
          Fathir Sthore
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#F2B33D", fontFamily: "monospace" }}>
          Script Download Center
        </div>
      </div>
    ),
    { ...size }
  );
}
