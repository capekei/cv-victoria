import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* Each circle from icon.svg scaled from 32→180 (×5.625) */
const circles = [
  // Blue organic cluster
  { cx: 14, cy: 14, r: 5.5, fill: "#4A7DB5", opacity: 0.5 },
  { cx: 19, cy: 13, r: 4.8, fill: "#6FA3D6", opacity: 0.5 },
  { cx: 16, cy: 19, r: 4.5, fill: "#3D6FA8", opacity: 0.55 },
  { cx: 11, cy: 18, r: 3.8, fill: "#5B8EC9", opacity: 0.5 },
  { cx: 22, cy: 16, r: 3.5, fill: "#89B4E4", opacity: 0.5 },
  { cx: 18, cy: 10, r: 3, fill: "#7BAAD8", opacity: 0.45 },
  { cx: 9, cy: 14, r: 2.8, fill: "#A8CCF0", opacity: 0.4 },
  { cx: 23, cy: 20, r: 2.8, fill: "#5B8EC9", opacity: 0.45 },
  { cx: 13, cy: 22, r: 2.5, fill: "#4A7DB5", opacity: 0.4 },
  { cx: 24, cy: 11, r: 2, fill: "#B9D4F4", opacity: 0.4 },
  { cx: 8, cy: 10, r: 1.8, fill: "#C4D9F2", opacity: 0.3 },
  { cx: 25, cy: 22, r: 1.5, fill: "#89B4E4", opacity: 0.35 },
  { cx: 10, cy: 22, r: 1.3, fill: "#D0E3F7", opacity: 0.25 },
  { cx: 7, cy: 17, r: 1.2, fill: "#B9D4F4", opacity: 0.2 },
  { cx: 26, cy: 14, r: 1, fill: "#D0E3F7", opacity: 0.25 },
  { cx: 15, cy: 7, r: 1, fill: "#C4D9F2", opacity: 0.2 },
  // 24k gold leaf accents
  { cx: 15.5, cy: 15.5, r: 1.5, fill: "#D4A843", opacity: 0.85 },
  { cx: 12, cy: 15, r: 1, fill: "#F0D68A", opacity: 0.75 },
  { cx: 19, cy: 16, r: 0.8, fill: "#E8C860", opacity: 0.7 },
  { cx: 17, cy: 20, r: 0.6, fill: "#D4A843", opacity: 0.6 },
  { cx: 21, cy: 14, r: 0.5, fill: "#F0D68A", opacity: 0.5 },
  { cx: 10, cy: 16.5, r: 0.4, fill: "#E8C860", opacity: 0.45 },
] as const;

const S = 180 / 32; // scale factor

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#111111",
          borderRadius: "36px",
          overflow: "hidden",
        }}
      >
        {circles.map((c, i) => {
          const d = c.r * 2 * S;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(c.cx - c.r) * S}px`,
                top: `${(c.cy - c.r) * S}px`,
                width: `${d}px`,
                height: `${d}px`,
                borderRadius: "50%",
                backgroundColor: c.fill,
                opacity: c.opacity,
              }}
            />
          );
        })}
      </div>
    ),
    { ...size }
  );
}
