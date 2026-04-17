"use client";

import { useRef, useCallback } from "react";

interface VideoBackgroundProps {
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}

/**
 * Fullscreen video background with CSS grayscale filter.
 *
 * Plays on every viewport — including mobile. iOS Safari autoplays
 * `muted` + `playsInline` videos, and both are set. The `poster`
 * attribute covers the tiny gap between first paint and the first
 * video frame, so there's no static-image fallback branch needed.
 */
export function VideoBackground({ onVideoRef }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      onVideoRef?.(el);
    },
    [onVideoRef],
  );

  return (
    <>
      <video
        ref={setRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/contact-bg-poster.jpg"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "grayscale(1) brightness(0.85)",
          transition:
            "filter 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <source src="/videos/contact-bg.webm" type="video/webm" />
        <source src="/videos/contact-bg.mp4" type="video/mp4" />
      </video>

      {/* Darkening overlay for text legibility */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </>
  );
}
