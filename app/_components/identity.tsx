"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import type { ContactInfo } from "@/app/_lib/artist";

interface IdentityProps {
  name: string;
  discipline: string;
  contact: ContactInfo;
}

/* 16px stripped JPEG of the portrait — 383 bytes on the wire, decoded
   instantly by the browser. Covers the decode gap so the frame never
   flashes canvas-grey before the real image arrives. */
const PORTRAIT_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAVABADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABQACBP/EACIQAAIBBAEEAwAAAAAAAAAAAAECAwAEERIhBRNBURQx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQARIf/aAAwDAQACEQMRAD8ALs8fMjR0V0QMF9Dn7rd3aiKdpMqm66lE5ya5diAqoAW41Ye6We3knjjkJUSxnYAcCo1w5CRzraTRt2g+fBOMH3SVx1jsx4EG2R5f8qqpgMNS/9k=";

export function Identity({ name, discipline }: IdentityProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const bar = el.querySelector(".cv-accent-bar");
    const portrait = el.querySelector(".cv-portrait");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      /* Snap to final state — visitor still sees the full layout
         without any motion. */
      if (bar) gsap.set(bar, { scaleX: 1 });
      if (portrait) gsap.set(portrait, { clipPath: "inset(0 0 0% 0)" });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      bar,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.5, delay: 0.2 }
    );

    tl.fromTo(
      portrait,
      { clipPath: "inset(0 0 100% 0)" },
      { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power2.inOut" },
      "-=0.2"
    );
  }, []);

  // Lightbox animation
  useEffect(() => {
    if (!isExpanded || !lightboxRef.current || !lightboxImgRef.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      gsap.set(lightboxRef.current, { opacity: 1 });
      gsap.set(lightboxImgRef.current, { scale: 1, y: 0 });
      return;
    }

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
  }, [isExpanded]);

  const closeLightbox = () => {
    if (!lightboxRef.current || !lightboxImgRef.current) {
      setIsExpanded(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      setIsExpanded(false);
      return;
    }
    gsap.to(lightboxImgRef.current, { scale: 0.95, y: -10, opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(lightboxRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => setIsExpanded(false)
    });
  };

  return (
    <>
      <div
      ref={ref}
      className="cv-identity"
      style={{
        width: "380px",
        minWidth: "380px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 56px 56px",
        borderRight: "1px solid var(--color-divider)",
        height: "100%",
      }}
    >
      {/* Top: portrait + name */}
      <div className="cv-identity-top">
        <div
          className="cv-accent-bar"
          style={{
            width: "32px",
            height: "2px",
            backgroundColor: "var(--color-accent)",
            marginBottom: "24px",
          }}
        />

        <div
          className="cv-portrait portrait-zoom-container"
          onClick={() => setIsExpanded(true)}
          style={{
            width: "100%",
            height: "200px",
            marginBottom: "28px",
            position: "relative",
            overflow: "hidden",
            borderRadius: "3px",
            clipPath: "inset(0 0 100% 0)",
            cursor: "pointer",
          }}
        >
          <Image
            src="/victoria-portrait.jpg"
            alt={name}
            fill
            priority
            sizes="320px"
            placeholder="blur"
            blurDataURL={PORTRAIT_BLUR}
            style={{ objectFit: "cover", objectPosition: "center 15%" }}
          />
        </div>

        <div className="cv-name-discipline">
          <h1
            className="cv-name font-serif font-black text-ink"
            style={{
              fontSize: "38px",
              lineHeight: "1.05",
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </h1>

          <p
            className="cv-discipline"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-secondary)",
              marginTop: "12px",
              lineHeight: "1.5",
            }}
          >
            {discipline}
          </p>
        </div>
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
              maxWidth: "800px", 
              maxHeight: "85vh",
              cursor: "pointer"
            }}
          >
            <Image
              src="/victoria-portrait.jpg"
              alt={name}
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
