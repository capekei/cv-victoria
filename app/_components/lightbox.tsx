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
      className="fixed inset-0 z-[100] flex items-center justify-center p-8 cursor-pointer overflow-y-auto bg-[rgba(20,18,16,0.96)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)]"
    >
      <button
        type="button"
        aria-label="Close lightbox"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[120] text-[16px] leading-none border border-white/30 bg-[rgba(10,9,8,0.45)] text-white/[0.88] backdrop-blur-[4px] [-webkit-backdrop-filter:blur(4px)] transition-[border-color,color] duration-[250ms] ease"
      >
        ×
      </button>

      <div className="lb-content flex flex-col items-center w-full h-full cursor-pointer max-w-[min(1400px,96vw)]">
        {/* Image or Video */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!item.video) setIsFullscreen((v) => !v);
          }}
          className={`w-full flex-auto min-h-0 relative overflow-hidden ${item.video ? "cursor-default" : "cursor-zoom-in"}`}
        >
          {item.video ? (
            <video
              src={item.video}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <Image
              src={allImages[activeImageIndex]}
              alt={item.title}
              fill
              sizes="96vw"
              className="object-contain"
              priority
            />
          )}
        </div>

        {/* Thumbnail strip (only if multiple images and not a video item) */}
        {!item.video && allImages.length > 1 && (
          <div className="flex gap-2 mt-4 shrink-0 flex-wrap justify-center">
            {allImages.map((src, i) => (
              <button
                key={src}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(i);
                }}
                data-active={i === activeImageIndex}
                className="w-12 h-12 relative overflow-hidden p-0 cursor-pointer bg-transparent border border-white/15 opacity-45 data-[active=true]:border-white/85 data-[active=true]:opacity-100 transition-[opacity,border-color] duration-300 ease"
              >
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Info bar */}
        <div className="w-full flex justify-between items-baseline mt-4 gap-4 shrink-0">
          <div>
            <p className="font-serif italic text-[15px] text-white/[0.92]">
              {item.title}
            </p>
            {item.caption && (
              <p className="text-[10px] text-white/50 mt-[5px] tracking-[0.01em]">
                {item.caption}
              </p>
            )}
          </div>
          {total > 1 && (
            <p className="text-[10px] text-white/50 shrink-0 tracking-[0.05em]">
              {index + 1} / {total}
            </p>
          )}
        </div>

        {/* Navigation arrows */}
        {total > 1 && (
          <div className="flex gap-[14px] mt-[14px] shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              disabled={index === 0}
              className="w-[38px] h-[38px] rounded-full bg-transparent flex items-center justify-center text-[14px] border border-white/20 text-white/85 cursor-pointer disabled:text-white/20 disabled:cursor-default transition-[border-color,color] duration-300 ease"
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              disabled={index === total - 1}
              className="w-[38px] h-[38px] rounded-full bg-transparent flex items-center justify-center text-[14px] border border-white/20 text-white/85 cursor-pointer disabled:text-white/20 disabled:cursor-default transition-[border-color,color] duration-300 ease"
            >
              →
            </button>
          </div>
        )}

        {/* Close hint */}
        <p className="text-[9px] font-medium text-white/35 tracking-[0.2em] uppercase mt-[14px] shrink-0">
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
          className="fixed inset-0 z-[110] flex items-center justify-center cursor-zoom-out bg-[rgba(10,9,8,0.98)]"
        >
          <div className="relative w-screen h-screen">
            <Image
              src={allImages[activeImageIndex]}
              alt={item.title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
