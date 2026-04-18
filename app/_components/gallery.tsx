"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { GalleryPiece } from "@/app/_lib/artist";
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
      <section className="mb-10">
        <SectionLabel title="Works" />

        {/* Horizontal scroll strip — focusable, keyboard navigable */}
        <div
          ref={stripRef}
          className="gallery-strip flex gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-14 px-14 cursor-grab [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
          role="region"
          aria-label="Selected works — horizontal gallery. Use left and right arrow keys to browse."
          tabIndex={0}
          onKeyDown={onStripKeyDown}
        >
          {pieces.map((piece, i) => (
            <button
              key={piece.title}
              onClick={() => openLightbox(i)}
              className="gallery-card flex-none border-0 bg-transparent p-0 cursor-pointer text-left [scroll-snap-align:start] w-[clamp(220px,75vw,280px)]"
            >
              {/* Thumbnail — aspect-ratio locked so the masonry can't shift
                  while the browser decodes the image. */}
              <div className="w-full relative overflow-hidden bg-canvas aspect-[280/360]">
                <Image
                  src={piece.image}
                  alt={piece.title}
                  fill
                  sizes="(max-width: 360px) 75vw, 280px"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                />
              </div>
              {/* Caption */}
              <p className="font-serif italic text-[12.5px] text-ink mt-2.5 opacity-75 transition-opacity duration-[600ms] ease">
                {piece.title}
              </p>
              <p className="text-[10px] font-normal text-secondary mt-0.5 opacity-55 transition-opacity duration-[600ms] ease">
                {piece.year}
              </p>
            </button>
          ))}
        </div>

        {/* Scroll hint */}
        <p className="text-[9px] font-medium text-divider tracking-[0.2em] uppercase mt-5 text-center opacity-70">
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
