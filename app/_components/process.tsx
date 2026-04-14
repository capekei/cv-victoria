"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProcessStep } from "@/app/artist";
import { resolveScroller } from "@/app/_lib/scroll";
import { SectionLabel } from "./section-label";
import { Lightbox } from "./lightbox";
import { ProcessMedia } from "./process-media";

gsap.registerPlugin(ScrollTrigger);

interface ProcessProps {
  steps: ProcessStep[];
}

export function Process({ steps }: ProcessProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scroller = resolveScroller(el);
    if (!scroller) return;

    const items = el.querySelectorAll(".cv-process-item");
    gsap.set(items, { opacity: 0, y: 14 });

    ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        });
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const navigateLightbox = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex((prev) => {
        if (prev === null) return null;
        const next = prev + dir;
        if (next < 0 || next >= steps.length) return prev;
        return next;
      });
    },
    [steps.length]
  );

  return (
    <>
      <section ref={ref} style={{ marginBottom: "40px" }}>
        <SectionLabel title="Process" />

        <p
          className="font-serif italic"
          style={{
            fontSize: "13px",
            lineHeight: 1.65,
            color: "var(--color-ink)",
            marginBottom: "28px",
            maxWidth: "540px",
          }}
        >
          How the work is made. Every mark, every layer, every surface is the
          result of a decision, a tool, and a flow state.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="cv-process-item"
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: "18px",
                alignItems: "start",
              }}
            >
              <button
                onClick={() => setActiveIndex(i)}
                style={{
                  width: "140px",
                  height: "140px",
                  position: "relative",
                  borderRadius: "3px",
                  overflow: "hidden",
                  backgroundColor: "var(--color-canvas)",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ProcessMedia image={step.image} video={step.video} alt={step.title} />
              </button>
              <div>
                <h3
                  className="font-serif italic text-ink"
                  style={{
                    fontSize: "15px",
                    marginBottom: "6px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "11.5px",
                    lineHeight: 1.65,
                    color: "var(--color-secondary)",
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeIndex !== null && (
        <Lightbox
          item={{
            title: steps[activeIndex].title,
            caption: steps[activeIndex].description,
            image: steps[activeIndex].image,
            video: steps[activeIndex].video,
          }}
          index={activeIndex}
          total={steps.length}
          onClose={closeLightbox}
          onPrev={() => navigateLightbox(-1)}
          onNext={() => navigateLightbox(1)}
        />
      )}
    </>
  );
}
