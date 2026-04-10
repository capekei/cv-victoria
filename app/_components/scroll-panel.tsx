"use client";

import { useRef, useEffect, useState, createContext, useContext } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Context so child components can access the scroller element */
const ScrollContext = createContext<HTMLDivElement | null>(null);
export const useScrollContainer = () => useContext(ScrollContext);

interface ScrollPanelProps {
  children: React.ReactNode;
}

export function ScrollPanel({ children }: ScrollPanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    setScrollEl(wrapper);

    /* ── Reset scroll position on mount ── */
    if (typeof history !== "undefined") {
      history.scrollRestoration = "manual";
    }
    wrapper.scrollTop = 0;

    /* ── Lenis: smooth momentum scroll on the internal container ── */
    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      lerp: 0.08,
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    /* ── Bridge Lenis → GSAP ScrollTrigger ── */
    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      ScrollTrigger.update();
      setProgress(e.limit > 0 ? e.scroll / e.limit : 0);
    });

    /* Tell ScrollTrigger to use the wrapper as default scroller */
    ScrollTrigger.defaults({ scroller: wrapper });

    /* RAF loop to drive Lenis */
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <ScrollContext.Provider value={scrollEl}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          minWidth: 0,
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, var(--color-accent), #8BB8E8)",
              borderRadius: "0 1px 1px 0",
              transition: "width 0.06s linear",
            }}
          />
        </div>

        {/* Scroll wrapper — Lenis attaches here */}
        <div
          ref={wrapperRef}
          className="cv-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "64px 56px 56px",
            minWidth: 0,
            overscrollBehavior: "contain",
          }}
        >
          <div ref={contentRef} style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            {children}
          </div>
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
