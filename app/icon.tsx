import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
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
