"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface CVFeaturedWorkProps {
  title: string;
  year: number;
  medium: string;
  dimensions: string;
}

export function CVFeaturedWork({ title, year, medium, dimensions }: CVFeaturedWorkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img) return;

    const scroller = el.closest(".cv-scroll");
    if (!scroller) return;

    /* ── Fade in on first view ── */
    gsap.set(el, { opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, duration: 0.8, ease: "power2.out" });
      },
    });

    /* ── Subtle parallax: image moves at ~0.6x scroll speed ── */
    gsap.set(img, { y: -30 });
    ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.5,
      onUpdate: (self) => {
        /* Image shifts from -30px to +30px as section crosses viewport */
        const yOffset = -30 + self.progress * 60;
        gsap.set(img, { y: yOffset });
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  // Lightbox animation
  useEffect(() => {
    if (isExpanded && lightboxRef.current && lightboxImgRef.current) {
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        lightboxImgRef.current,
        { scale: 0.9, y: 20 },
        { scale: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [isExpanded]);

  const closeLightbox = () => {
    if (lightboxRef.current && lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, { scale: 0.95, y: -10, opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(lightboxRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => setIsExpanded(false)
      });
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <div ref={ref} style={{ marginBottom: "40px" }}>
        {/* Full-bleed artwork with parallax — extra height for shift room */}
      <div
        className="img-zoom-container"
        onClick={() => setIsExpanded(true)}
        style={{
          height: "380px",
          position: "relative",
          overflow: "hidden",
          borderRadius: "3px",
          marginLeft: "-44px",
          marginRight: "-44px",
          cursor: "pointer"
        }}
      >
          <div
            ref={imgRef}
            style={{
              position: "absolute",
              inset: "-50px 0",
              willChange: "transform",
            }}
          >
            <Image
              src="/artwork-expansion.jpg"
              alt={title}
              fill
              sizes="740px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Caption */}
        <div
          style={{
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "12px",
            fontSize: "11.5px",
            fontWeight: 400,
            color: "var(--color-secondary)",
          }}
        >
          <span>
            <span
              className="font-serif italic"
              style={{ color: "var(--color-ink)", fontSize: "13px" }}
            >
              {title}
            </span>
            <span style={{ marginLeft: "8px" }}>
              {medium}, {dimensions}
            </span>
          </span>
          <span style={{ flexShrink: 0 }}>{year}</span>
        </div>
      </div>

      {/* Full Screen Lightbox */}
      {isExpanded && (
        <div
          ref={lightboxRef}
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(247, 246, 242, 0.98)", // matches cream with slight transparency
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: "40px"
          }}
        >
          <div 
            ref={lightboxImgRef}
            style={{ 
              position: "relative", 
              width: "100%", 
              height: "100%", 
              maxWidth: "1200px", 
              maxHeight: "85vh",
              cursor: "pointer"
            }}
          >
            <Image
              src="/artwork-expansion.jpg"
              alt={title}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div style={{ 
            marginTop: "24px", 
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--color-secondary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}>
            Click anywhere to close
          </div>
        </div>
      )}
    </>
  );
}
