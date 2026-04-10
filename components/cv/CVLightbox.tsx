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
        backgroundColor: "rgba(247, 246, 242, 0.98)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        cursor: "pointer",
      }}
    >
      <div
        className="lb-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "680px",
          width: "100%",
          cursor: "pointer",
        }}
      >
        {/* Image */}
        <div
          style={{
            width: "100%",
            height: "480px",
            position: "relative",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <Image
            src={allImages[activeImageIndex]}
            alt={item.title}
            fill
            sizes="680px"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Thumbnail strip (only if multiple images) */}
        {allImages.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "14px",
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
                  width: "54px",
                  height: "54px",
                  position: "relative",
                  border:
                    i === activeImageIndex
                      ? "1.5px solid var(--color-ink)"
                      : "1px solid var(--color-divider)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  padding: 0,
                  cursor: "pointer",
                  background: "none",
                  opacity: i === activeImageIndex ? 1 : 0.65,
                  transition: "opacity 0.2s ease",
                }}
              >
                <Image src={src} alt="" fill sizes="54px" style={{ objectFit: "cover" }} />
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
          }}
        >
          <div>
            <p
              className="font-serif italic"
              style={{ fontSize: "15px", color: "var(--color-ink)" }}
            >
              {item.title}
            </p>
            {item.caption && (
              <p style={{ fontSize: "10px", color: "var(--color-secondary)", marginTop: "4px" }}>
                {item.caption}
              </p>
            )}
          </div>
          {total > 1 && (
            <p style={{ fontSize: "10px", color: "var(--color-secondary)", flexShrink: 0 }}>
              {index + 1} / {total}
            </p>
          )}
        </div>

        {/* Navigation arrows */}
        {total > 1 && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              disabled={index === 0}
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid var(--color-divider)",
                borderRadius: "50%",
                background: "none",
                color: index === 0 ? "var(--color-divider)" : "var(--color-ink)",
                cursor: index === 0 ? "default" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              disabled={index === total - 1}
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid var(--color-divider)",
                borderRadius: "50%",
                background: "none",
                color: index === total - 1 ? "var(--color-divider)" : "var(--color-ink)",
                cursor: index === total - 1 ? "default" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              →
            </button>
          </div>
        )}

        {/* Close hint */}
        <p
          style={{
            fontSize: "10px",
            fontWeight: 500,
            color: "var(--color-secondary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "20px",
          }}
        >
          Tap anywhere to close
        </p>
      </div>
    </div>
  );
}
