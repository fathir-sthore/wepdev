import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#090A0F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#00F0FF",
            fontFamily: "monospace",
          }}
        >
          {">_"}
        </div>
      </div>
    ),
    { ...size }
  );
}
