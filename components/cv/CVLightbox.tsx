"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

export interface LightboxItem {
  title: string;
  caption?: string;
  image: string;
  additionalImages?: string[];
}

interface CVLightboxProps {
  item: LightboxItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CVLightbox({ item, index, total, onClose, onPrev, onNext }: CVLightboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const allImages = [item.image, ...(item.additionalImages ?? [])];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /* Reset active image when item changes */
  useEffect(() => {
    setActiveImageIndex(0);
  }, [item]);

  /* Animate in */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      el.querySelector(".lb-content"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" }
    );
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

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
        padding: "48px",
        cursor: "pointer",
      }}
    >
      <div
        className="lb-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "min(1200px, 92vw)",
          width: "100%",
          cursor: "pointer",
        }}
      >
        {/* Image */}
        <div
          style={{
            width: "100%",
            height: "min(78vh, 820px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={allImages[activeImageIndex]}
            alt={item.title}
            fill
            sizes="92vw"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Thumbnail strip (only if multiple images) */}
        {allImages.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "22px",
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
            marginTop: "24px",
            gap: "16px",
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
              marginTop: "22px",
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
            marginTop: "22px",
          }}
        >
          Tap anywhere to close
        </p>
      </div>
    </div>
  );
}
