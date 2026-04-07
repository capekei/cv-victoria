"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Artwork } from "@/data/victoria-zeder";
import { CVSectionLabel } from "./CVSectionLabel";

gsap.registerPlugin(ScrollTrigger);

interface CVWorksProps {
  works: Artwork[];
}

export function CVWorks({ works }: CVWorksProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scroller = el.closest(".cv-scroll");
    if (!scroller) return;

    const items = el.querySelectorAll(".cv-work-item");
    gsap.set(items, { opacity: 0, y: 10 });

    ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        });
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section ref={ref} style={{ marginBottom: "40px" }}>
      <CVSectionLabel title="Selected Works" />
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {works.map((work) => (
          <div key={work.title} className="cv-work-item hover-underline" style={{ width: "100%", cursor: "pointer" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "16px",
              }}
            >
              <span
                className="font-serif italic text-ink"
                style={{ fontSize: "14px" }}
              >
                {work.title}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--color-secondary)",
                  flexShrink: 0,
                }}
              >
                {work.year}
              </span>
            </div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 400,
                color: "var(--color-secondary)",
                marginTop: "2px",
                letterSpacing: "0.02em",
              }}
            >
              {work.medium}, {work.dimensions}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
