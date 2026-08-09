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
          background: "#090A0F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", fontSize: 48, color: "#7000FF", fontFamily: "monospace" }}>
          $ fathir sthore --init
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 700,
            color: "#F0F4FF",
            fontFamily: "monospace",
          }}
        >
          Fathir Sthore
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#00F0FF", fontFamily: "monospace" }}>
          Script Download Center
        </div>
      </div>
    ),
    { ...size }
  );
}
