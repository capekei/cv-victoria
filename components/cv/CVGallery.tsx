"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import type { GalleryPiece } from "@/data/victoria-zeder";
import { CVSectionLabel } from "./CVSectionLabel";

gsap.registerPlugin(ScrollTrigger);

interface CVGalleryProps {
  pieces: GalleryPiece[];
}

export function CVGallery({ pieces }: CVGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /* ── Reveal animation ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const scroller = el.closest(".cv-scroll");
    if (!scroller) return;

    gsap.set(el, { opacity: 0, y: 14 });

    ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" });
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  /* ── Drag to scroll the strip ── */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      strip.style.cursor = "grabbing";
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    };
    const onUp = () => {
      isDown = false;
      strip.style.cursor = "grab";
    };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      const walk = (x - startX) * 1.5;
      strip.scrollLeft = scrollLeft - walk;
    };

    strip.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    strip.addEventListener("mousemove", onMove);
    strip.addEventListener("mouseleave", onUp);

    return () => {
      strip.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      strip.removeEventListener("mousemove", onMove);
      strip.removeEventListener("mouseleave", onUp);
    };
  }, []);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const navigateLightbox = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex((prev) => {
        if (prev === null) return null;
        const next = prev + dir;
        if (next < 0 || next >= pieces.length) return prev;
        return next;
      });
    },
    [pieces.length]
  );

  return (
    <>
      <section ref={sectionRef} style={{ marginBottom: "40px" }}>
        <CVSectionLabel title="Works" />

        {/* Horizontal scroll strip */}
        <div
          ref={stripRef}
          className="gallery-strip"
          style={{
            display: "flex",
            gap: "16px",
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: "8px",
            marginLeft: "-56px",
            marginRight: "-56px",
            paddingLeft: "56px",
            paddingRight: "56px",
            cursor: "grab",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {pieces.map((piece, i) => (
            <button
              key={piece.title}
              onClick={() => openLightbox(i)}
              style={{
                flex: "0 0 auto",
                width: "220px",
                border: "none",
                background: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "220px",
                  height: "260px",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "3px",
                  backgroundColor: "var(--color-canvas)",
                }}
              >
                <Image
                  src={piece.image}
                  alt={piece.title}
                  fill
                  sizes="220px"
                  style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "scale(1)";
                  }}
                />
              </div>
              {/* Caption */}
              <p
                className="font-serif italic"
                style={{
                  fontSize: "12.5px",
                  color: "var(--color-ink)",
                  marginTop: "8px",
                }}
              >
                {piece.title}
              </p>
              <p
                style={{
                  fontSize: "10.5px",
                  fontWeight: 400,
                  color: "var(--color-secondary)",
                  marginTop: "2px",
                }}
              >
                {piece.medium}, {piece.dimensions}
              </p>
            </button>
          ))}
        </div>

        {/* Scroll hint */}
        <p
          style={{
            fontSize: "9.5px",
            fontWeight: 500,
            color: "var(--color-divider)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          Drag to browse
        </p>
      </section>

      {/* ── Lightbox Overlay ── */}
      {activeIndex !== null && (
        <CVLightbox
          piece={pieces[activeIndex]}
          index={activeIndex}
          total={pieces.length}
          onClose={closeLightbox}
          onPrev={() => navigateLightbox(-1)}
          onNext={() => navigateLightbox(1)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Lightbox — full-screen overlay
   ═══════════════════════════════════════════════ */

interface CVLightboxProps {
  piece: GalleryPiece;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function CVLightbox({ piece, index, total, onClose, onPrev, onNext }: CVLightboxProps) {
  const ref = useRef<HTMLDivElement>(null);

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
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        cursor: "pointer",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          width: "40px",
          height: "40px",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          background: "none",
          color: "#fff",
          fontSize: "18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 101,
          transition: "border-color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
        }}
      >
        ✕
      </button>

      <div
        className="lb-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "680px",
          width: "100%",
          cursor: "default",
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
            src={piece.image}
            alt={piece.title}
            fill
            sizes="680px"
            style={{ objectFit: "contain" }}
          />
        </div>

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
              style={{ fontSize: "15px", color: "#fff" }}
            >
              {piece.title}
            </p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
              {piece.medium}, {piece.dimensions} — {piece.year}
            </p>
          </div>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
            {index + 1} / {total}
          </p>
        </div>

        {/* Navigation arrows */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onPrev}
            disabled={index === 0}
            style={{
              width: "36px",
              height: "36px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              background: "none",
              color: index === 0 ? "rgba(255,255,255,0.15)" : "#fff",
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
            onClick={onNext}
            disabled={index === total - 1}
            style={{
              width: "36px",
              height: "36px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              background: "none",
              color: index === total - 1 ? "rgba(255,255,255,0.15)" : "#fff",
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
      </div>
    </div>
  );
}
