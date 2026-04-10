"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

interface ProcessMediaProps {
  image: string;
  video?: string;
  alt: string;
}

/**
 * Thumbnail that shows a still image by default and plays a silent,
 * looping video on hover (if one is provided). Image fades out as the
 * video fades in, so the transition stays quiet and cinematic.
 */
export function ProcessMedia({ image, video, alt }: ProcessMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleEnter = useCallback(() => {
    setHovering(true);
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {
      /* Autoplay may be blocked until the user interacts; safe to ignore. */
    });
  }, []);

  const handleLeave = useCallback(() => {
    setHovering(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
  }, []);

  return (
    <div
      onMouseEnter={video ? handleEnter : undefined}
      onMouseLeave={video ? handleLeave : undefined}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes="140px"
        style={{
          objectFit: "cover",
          transition: "opacity 0.5s ease, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          opacity: video && hovering && videoReady ? 0 : 1,
          transform: hovering ? "scale(1.05)" : "scale(1)",
        }}
      />
      {video && (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: hovering && videoReady ? 1 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
