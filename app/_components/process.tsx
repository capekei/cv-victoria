"use client";

import { useState, useCallback } from "react";
import type { ProcessStep } from "@/app/_lib/artist";
import { SectionLabel } from "./section-label";
import { Lightbox } from "./lightbox";
import { ProcessMedia } from "./process-media";

interface ProcessProps {
  steps: ProcessStep[];
}

export function Process({ steps }: ProcessProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
      <section className="mb-10">
        <SectionLabel title="Process" />

        <p className="font-serif italic text-[13px] leading-[1.65] text-ink mb-7 max-w-[540px]">
          How the work is made. Every mark, every layer, every surface is the
          result of a decision, a tool, and a flow state.
        </p>

        <div className="flex flex-col gap-7">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="cv-process-item cv-stagger-item grid items-start gap-[18px] grid-cols-[140px_1fr]"
              style={{ ["--stagger-i" as string]: i } as React.CSSProperties}
            >
              <button
                onClick={() => setActiveIndex(i)}
                aria-label={`Enlarge ${step.title}`}
                className="w-[140px] h-[140px] relative rounded-[3px] overflow-hidden bg-canvas p-0 border-0 cursor-pointer"
              >
                <ProcessMedia image={step.image} video={step.video} alt={step.title} />
              </button>
              <div>
                <h3 className="font-serif italic text-ink text-[15px] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-[11.5px] leading-[1.65] text-secondary">
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
