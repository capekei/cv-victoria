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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111111",
          borderRadius: "36px",
        }}
      >
        <span
          style={{
            fontSize: "110px",
            fontFamily: "Georgia, serif",
            fontWeight: 900,
            fontStyle: "italic",
            color: "#F7F6F2",
            letterSpacing: "-4px",
          }}
        >
          VZ
        </span>
      </div>
    ),
    { ...size }
  );
}
