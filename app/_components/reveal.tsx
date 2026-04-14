"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveScroller } from "@/app/_lib/scroll";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function Reveal({ children, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Resolve scroller: .cv-scroll on desktop, window on mobile */
    const scroller = resolveScroller(el);
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
