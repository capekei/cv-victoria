"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import type { ContactInfo } from "@/data/victoria-zeder";

interface CVIdentityProps {
  name: string;
  discipline: string;
  contact: ContactInfo;
}

export function CVIdentity({ name, discipline, contact }: CVIdentityProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      el.querySelector(".cv-accent-bar"),
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.5, delay: 0.2 }
    );

    tl.fromTo(
      el.querySelector(".cv-portrait"),
      { clipPath: "inset(0 0 100% 0)" },
      { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power2.inOut" },
      "-=0.2"
    );
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
            src="/victoria-portrait.png"
            alt={name}
            fill
            priority
            sizes="320px"
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
              src="/victoria-portrait.png"
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
