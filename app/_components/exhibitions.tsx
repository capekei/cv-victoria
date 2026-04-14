"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Exhibition } from "@/app/artist";
import { resolveScroller } from "@/app/_lib/scroll";
import { SectionLabel } from "./section-label";

gsap.registerPlugin(ScrollTrigger);

interface ExhibitionsProps {
  exhibitions: Exhibition[];
}

export function Exhibitions({ exhibitions }: ExhibitionsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scroller = resolveScroller(el);
    if (!scroller) return;

    const rows = el.querySelectorAll(".cv-exh-row");
    gsap.set(rows, { opacity: 0, x: -6 });

    ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(rows, {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
        });
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  const upcoming = exhibitions.filter((e) => e.type === "upcoming");
  const selected = exhibitions.filter((e) => e.type === "selected");

  return (
    <section ref={ref} style={{ marginBottom: "40px" }}>
      <SectionLabel title="Exhibitions" />

      {upcoming.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "#7BA7D4",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Upcoming
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {upcoming.map((e) => (
              <ExhibitionRow key={`${e.year}-${e.title}`} exhibition={e} />
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "var(--color-secondary)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Selected
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {selected.map((e) => (
              <ExhibitionRow key={`${e.year}-${e.title}`} exhibition={e} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ExhibitionRow({ exhibition }: { exhibition: Exhibition }) {
  return (
    <div
      className="cv-exh-row"
      style={{
        width: "100%",
        cursor: "pointer",
        marginBottom: "2px",
      }}
    >
      <div
        className="hover-underline"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="text-ink" style={{ fontSize: "13px", fontWeight: 500 }}>
          {exhibition.title}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 400,
            color: "var(--color-secondary)",
            letterSpacing: "0.02em",
            flexShrink: 0,
            marginLeft: "16px",
          }}
        >
          {exhibition.location}, {exhibition.year}
        </span>
      </div>
      {(exhibition.dates || exhibition.gallery) && (
        <p
          style={{
            fontSize: "10.5px",
            color: "var(--color-secondary)",
            marginTop: "2px",
            opacity: 0.75,
          }}
        >
          {exhibition.dates}{exhibition.dates && exhibition.gallery ? " · " : ""}{exhibition.gallery}
        </p>
      )}
    </div>
  );
}
