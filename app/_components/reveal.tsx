"use client";

import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  /* IntersectionObserver threshold margin — "0px 0px -7% 0px" matches
     the old GSAP "top 93%" trigger so the visual cadence stays identical. */
  rootMargin?: string;
  /* Add the stagger container class so direct children animate in sequence. */
  stagger?: boolean;
  /* Tailwind class passthrough for layout (section marginBottom etc.). */
  as?: "div" | "section";
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  rootMargin = "0px 0px -7% 0px",
  stagger = false,
  as = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      el.classList.add("is-visible");
      return;
    }

    /* One-shot: we reveal once, then detach. */
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.disconnect();
            break;
          }
        }
      },
      {
        /* Lenis scrolls the ancestor; IntersectionObserver supports
           a `root` option but our wrapper overflows via `.cv-scroll`.
           Pass the closest scroller so visibility calculates correctly. */
        root: el.closest(".cv-scroll") as Element | null,
        rootMargin,
        threshold: 0,
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  const classes = [
    stagger ? "cv-stagger" : "cv-reveal",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = delay
    ? ({ ["--reveal-delay" as string]: `${delay}ms` } as React.CSSProperties)
    : undefined;

  if (as === "section") {
    return (
      <section ref={ref as React.RefObject<HTMLElement>} className={classes} style={style}>
        {children}
      </section>
    );
  }
  return (
    <div ref={ref} className={classes} style={style}>
      {children}
    </div>
  );
}
