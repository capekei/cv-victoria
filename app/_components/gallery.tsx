"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { GalleryPiece } from "@/app/artist";
import { SectionLabel } from "./section-label";
import { Lightbox } from "./lightbox";

interface GalleryProps {
  pieces: GalleryPiece[];
}

/* Card width + gap (16px) — one "step" of the scroller. Cards scale
   via clamp(220px, 75vw, 280px), so we read the first card's actual
   rendered width at keypress time rather than hardcoding 296. */
const GAP = 16;

export function Gallery({ pieces }: GalleryProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /* ── Drag to scroll (mouse only) ── */
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

  /* ── Toggle .is-scrolled-end so the right-edge fade mask lifts
       when the last card is fully in view. Keeps the edge affordance
       honest: if there's more to see, it's masked; if not, it isn't. */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const update = () => {
      const atEnd =
        strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
      strip.classList.toggle("is-scrolled-end", atEnd);
    };

    update();
    strip.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(strip);
    return () => {
      strip.removeEventListener("scroll", update);
      ro.disconnect();
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

  /* ── Keyboard navigation on the strip itself (tabIndex=0).
     Left/Right scroll one card; Home/End jump to the extremes. */
  const onStripKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const strip = stripRef.current;
    if (!strip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    const firstCard = strip.querySelector<HTMLButtonElement>(".gallery-card");
    const step = (firstCard?.offsetWidth ?? 280) + GAP;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        strip.scrollBy({ left: step, behavior });
        break;
      case "ArrowLeft":
        e.preventDefault();
        strip.scrollBy({ left: -step, behavior });
        break;
      case "Home":
        e.preventDefault();
        strip.scrollTo({ left: 0, behavior });
        break;
      case "End":
        e.preventDefault();
        strip.scrollTo({ left: strip.scrollWidth, behavior });
        break;
    }
  }, []);

  return (
    <>
      <section style={{ marginBottom: "40px" }}>
        <SectionLabel title="Works" />

        {/* Horizontal scroll strip — focusable, keyboard navigable */}
        <div
          ref={stripRef}
          className="gallery-strip"
          role="region"
          aria-label="Selected works — horizontal gallery. Use left and right arrow keys to browse."
          tabIndex={0}
          onKeyDown={onStripKeyDown}
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
              className="gallery-card"
              style={{
                flex: "0 0 auto",
                /* Clamp so 320px viewports fit a card with right-edge
                   peek indicating scroll; desktop keeps the 280px spec. */
                width: "clamp(220px, 75vw, 280px)",
                border: "none",
                background: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                scrollSnapAlign: "start",
              }}
            >
              {/* Thumbnail — aspect-ratio locked so the masonry can't shift
                  while the browser decodes the image. Width 100% inherits
                  the button's clamp, so the ratio adapts. */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "280 / 360",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: "var(--color-canvas)",
                }}
              >
                <Image
                  src={piece.image}
                  alt={piece.title}
                  fill
                  sizes="(max-width: 360px) 75vw, 280px"
                  style={{
                    objectFit: "cover",
                    transition: "transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                />
              </div>
              {/* Caption */}
              <p
                className="font-serif italic"
                style={{
                  fontSize: "12.5px",
                  color: "var(--color-ink)",
                  marginTop: "10px",
                  opacity: 0.75,
                  transition: "opacity 0.6s ease",
                }}
              >
                {piece.title}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "var(--color-secondary)",
                  marginTop: "2px",
                  opacity: 0.55,
                  transition: "opacity 0.6s ease",
                }}
              >
                {piece.year}
              </p>
            </button>
          ))}
        </div>

        {/* Scroll hint */}
        <p
          style={{
            fontSize: "9px",
            fontWeight: 500,
            color: "var(--color-divider)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: "20px",
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          Drag or use arrow keys · click to enlarge
        </p>
      </section>

      {/* ── Lightbox Overlay ── */}
      {activeIndex !== null && (
        <Lightbox
          item={{
            title: pieces[activeIndex].title,
            caption: `${pieces[activeIndex].medium}, ${pieces[activeIndex].dimensions} · ${pieces[activeIndex].year}`,
            image: pieces[activeIndex].image,
            additionalImages: pieces[activeIndex].additionalImages,
          }}
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
