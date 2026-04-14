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

    /* ── Reset scroll position on mount ── */
    if (typeof history !== "undefined") {
      history.scrollRestoration = "manual";
    }

    /* ── Mobile: let the browser drive scroll natively. Lenis on touch
          devices feels off (momentum, rubberbanding, pinch-zoom) and our
          inner-container layout makes it worse. On mobile the whole
          document scrolls; we just track window.scrollY for the progress
          bar and let ScrollTrigger use its window default. ── */
    const mobileQuery = window.matchMedia("(max-width: 768px)");

    if (mobileQuery.matches) {
      setScrollEl(null);
      window.scrollTo(0, 0);

      const onScroll = () => {
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(limit > 0 ? window.scrollY / limit : 0);
        ScrollTrigger.update();
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      return () => {
        window.removeEventListener("scroll", onScroll);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    /* ── Desktop: Lenis smooth scroll on the internal container ── */
    setScrollEl(wrapper);
    wrapper.scrollTop = 0;

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
      <div className="cv-scroll-panel">
        {/* Progress bar */}
        <div className="cv-progress">
          <div
            className="cv-progress-bar"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Scroll wrapper — Lenis attaches here on desktop */}
        <div ref={wrapperRef} className="cv-scroll">
          <div ref={contentRef} className="cv-scroll-content">
            {children}
          </div>
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
