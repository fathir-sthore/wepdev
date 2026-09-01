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
          background: "#EEF1F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            padding: "64px 96px",
            borderRadius: 32,
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 24px 70px rgba(23,26,35,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: "#171A23",
              fontFamily: "sans-serif",
            }}
          >
            Fathir Code
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#3552D8", fontFamily: "sans-serif" }}>
            Platform Script & Source Code untuk Developer
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
