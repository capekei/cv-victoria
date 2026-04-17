"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

export interface LightboxItem {
  title: string;
  caption?: string;
  image: string;
  additionalImages?: string[];
  video?: string;
}

interface LightboxProps {
  item: LightboxItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ item, index, total, onClose, onPrev, onNext }: LightboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const allImages = [item.image, ...(item.additionalImages ?? [])];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* Reset active image + fullscreen when item changes.
     React 19's recommended pattern for derived-from-props state: compare
     during render and call setState — React batches into the same pass,
     avoiding the cascading-render penalty that useEffect would incur. */
  const [lastItem, setLastItem] = useState(item);
  if (lastItem !== item) {
    setLastItem(item);
    setActiveImageIndex(0);
    setIsFullscreen(false);
  }

  /* Animate in */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const content = el.querySelector(".lb-content");
    if (reduced) {
      gsap.set(el, { opacity: 1 });
      if (content) gsap.set(content, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      content,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" }
    );
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext, isFullscreen]);

  return (
    <div
      ref={ref}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(20, 18, 16, 0.96)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        cursor: "pointer",
        overflowY: "auto",
      }}
    >
      <button
        type="button"
        aria-label="Close lightbox"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "40px",
          height: "40px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "999px",
          background: "rgba(10, 9, 8, 0.45)",
          color: "rgba(255, 255, 255, 0.88)",
          fontSize: "16px",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 120,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          transition: "border-color 0.25s ease, color 0.25s ease",
        }}
      >
        ×
      </button>

      <div
        className="lb-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "min(1400px, 96vw)",
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
      >
        {/* Image or Video */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!item.video) setIsFullscreen((v) => !v);
          }}
          style={{
            width: "100%",
            flex: "1 1 auto",
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
            cursor: item.video ? "default" : "zoom-in",
          }}
        >
          {item.video ? (
            <video
              src={item.video}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Image
              src={allImages[activeImageIndex]}
              alt={item.title}
              fill
              sizes="96vw"
              style={{ objectFit: "contain" }}
              priority
            />
          )}
        </div>

        {/* Thumbnail strip (only if multiple images and not a video item) */}
        {!item.video && allImages.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {allImages.map((src, i) => (
              <button
                key={src}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(i);
                }}
                style={{
                  width: "48px",
                  height: "48px",
                  position: "relative",
                  border:
                    i === activeImageIndex
                      ? "1px solid rgba(255, 255, 255, 0.85)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                  overflow: "hidden",
                  padding: 0,
                  cursor: "pointer",
                  background: "none",
                  opacity: i === activeImageIndex ? 1 : 0.45,
                  transition: "opacity 0.3s ease, border-color 0.3s ease",
                }}
              >
                <Image src={src} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}

        {/* Info bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "16px",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              className="font-serif italic"
              style={{ fontSize: "15px", color: "rgba(255, 255, 255, 0.92)" }}
            >
              {item.title}
            </p>
            {item.caption && (
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginTop: "5px",
                  letterSpacing: "0.01em",
                }}
              >
                {item.caption}
              </p>
            )}
          </div>
          {total > 1 && (
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.5)",
                flexShrink: 0,
                letterSpacing: "0.05em",
              }}
            >
              {index + 1} / {total}
            </p>
          )}
        </div>

        {/* Navigation arrows */}
        {total > 1 && (
          <div
            style={{
              display: "flex",
              gap: "14px",
              marginTop: "14px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              disabled={index === 0}
              style={{
                width: "38px",
                height: "38px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                background: "none",
                color: index === 0 ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.85)",
                cursor: index === 0 ? "default" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.3s ease, color 0.3s ease",
              }}
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              disabled={index === total - 1}
              style={{
                width: "38px",
                height: "38px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                background: "none",
                color: index === total - 1 ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.85)",
                cursor: index === total - 1 ? "default" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.3s ease, color 0.3s ease",
              }}
            >
              →
            </button>
          </div>
        )}

        {/* Close hint */}
        <p
          style={{
            fontSize: "9px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.35)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: "14px",
            flexShrink: 0,
          }}
        >
          {item.video ? "Tap outside to close" : "Tap image to enlarge · tap outside to close"}
        </p>
      </div>

      {/* Fullscreen image overlay */}
      {isFullscreen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            backgroundColor: "rgba(10, 9, 8, 0.98)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            <Image
              src={allImages[activeImageIndex]}
              alt={item.title}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
