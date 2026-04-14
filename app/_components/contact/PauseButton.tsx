"use client";

import { useState, useCallback } from "react";

interface PauseButtonProps {
  videoEl: HTMLVideoElement | null;
}

/**
 * Minimal pause/play toggle for the background video.
 * Bottom-right corner, barely visible until hovered.
 */
export function PauseButton({ videoEl }: PauseButtonProps) {
  const [paused, setPaused] = useState(false);

  const toggle = useCallback(() => {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      setPaused(false);
    } else {
      videoEl.pause();
      setPaused(true);
    }
  }, [videoEl]);

  if (!videoEl) return null;

  return (
    <button
      onClick={toggle}
      aria-label={paused ? "Play background video" : "Pause background video"}
      className="font-sans"
      style={{
        position: "absolute",
        bottom: "32px",
        right: "32px",
        zIndex: 20,
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "9px",
        fontWeight: 500,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.6)",
        transition: "color 0.3s ease",
        padding: "12px",
        minWidth: "44px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
    >
      {paused ? "Play" : "Pause"}
    </button>
  );
}
