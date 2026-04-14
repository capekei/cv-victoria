"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface VideoBackgroundProps {
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}

/**
 * Fullscreen video background with CSS grayscale filter.
 * On mobile (<768px), renders a static image instead of video
 * to save bandwidth and avoid autoplay issues.
 */
export function VideoBackground({ onVideoRef }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      onVideoRef?.(el);
    },
    [onVideoRef],
  );

  return (
    <>
      {/* Video / Image layer */}
      {isMobile ? (
        <Image
          src="/images/contact-bg-still.jpg"
          alt="Victoria Zeder painting in her studio"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            filter: "grayscale(1) brightness(0.85)",
          }}
        />
      ) : (
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
      )}

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
