"use client";

import { useRef, useSyncExternalStore, useCallback } from "react";
import Image from "next/image";

interface VideoBackgroundProps {
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}

/* React 19: useSyncExternalStore is the canonical way to subscribe to
   a matchMedia query — no useEffect, no setState-in-effect, and SSR-safe
   because getServerSnapshot returns a fixed value. */
const MQ = "(max-width: 767px)";
const subscribeMq = (onChange: () => void) => {
  const mql = window.matchMedia(MQ);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const getMqSnapshot = () => window.matchMedia(MQ).matches;
/* SSR never sees a viewport — default to desktop so the video element
   renders on initial paint. Hydration corrects if the client is mobile. */
const getMqServerSnapshot = () => false;

/**
 * Fullscreen video background with CSS grayscale filter.
 * On mobile (<768px), renders a static image instead of video
 * to save bandwidth and avoid autoplay issues.
 */
export function VideoBackground({ onVideoRef }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMobile = useSyncExternalStore(
    subscribeMq,
    getMqSnapshot,
    getMqServerSnapshot,
  );

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
