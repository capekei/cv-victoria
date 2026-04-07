"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CVRevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function CVReveal({ children, delay = 0 }: CVRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Find the Lenis scroll wrapper */
    const scroller = el.closest(".cv-scroll");
    if (!scroller) return;

    gsap.set(el, { opacity: 0, y: 14 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top 93%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay,
          ease: "power2.out",
        });
      },
    });

    return () => trigger.kill();
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}
