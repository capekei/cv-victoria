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
          backgroundColor: "#2c2c2c",
          borderRadius: "22px",
        }}
      >
        <span
          style={{
            fontSize: "90px",
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            color: "#f7f6f2",
            letterSpacing: "-2px",
          }}
        >
          VZ
        </span>
      </div>
    ),
    { ...size }
  );
}
