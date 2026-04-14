"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

interface SignatureRevealProps {
  play: boolean;
}

/**
 * Phase 4 — Thank-you overlay.
 *
 * Victoria's actual handwritten signature (PNG, background removed)
 * sweeps in left-to-right, her name fades in, then a thin hairline
 * draws itself and reveals an italic "Return to the work" link back
 * to /. The whole sequence feels like a single gesture.
 */
export function SignatureReveal({ play }: SignatureRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!play || hasPlayed.current) return;
    hasPlayed.current = true;

    const container = containerRef.current;
    const sig = signatureRef.current;
    const name = nameRef.current;
    const divider = dividerRef.current;
    const ret = returnRef.current;
    if (!container || !sig || !name || !divider || !ret) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* Initial states — everything hidden / clipped */
    gsap.set(sig, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(name, { opacity: 0 });
    gsap.set(divider, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(ret, { opacity: 0, y: 8 });

    if (prefersReduced) {
      gsap.set(sig, { clipPath: "inset(0 0% 0 0)" });
      gsap.set(name, { opacity: 1 });
      gsap.set(divider, { scaleX: 1 });
      gsap.set(ret, { opacity: 1, y: 0 });
      return;
    }

    /* Choreographed sequence: signature sweep → name → hairline → link */
    const tl = gsap.timeline();
    tl.to(sig, {
      clipPath: "inset(0 0% 0 0)",
      duration: 2,
      ease: "power2.inOut",
    })
      .to(
        name,
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        "+=0.3",
      )
      .to(
        divider,
        { scaleX: 1, duration: 1.1, ease: "power2.inOut" },
        "+=0.5",
      )
      .to(
        ret,
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=0.4",
      );
  }, [play]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "40px 24px",
        opacity: play ? 1 : 0,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Thank you text */}
      <p
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(20px, 3vw, 24px)",
          color: "var(--color-ink)",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: "40px",
        }}
      >
        Thank you.
        <br />
        I&rsquo;ll write back soon.
      </p>

      {/* Signature — Victoria's real handwriting (background removed) */}
      <div
        ref={signatureRef}
        style={{
          width: "clamp(160px, 30vw, 220px)",
          marginBottom: "24px",
          clipPath: "inset(0 100% 0 0)",
          willChange: "clip-path",
        }}
      >
        <Image
          src="/signature-vz.png"
          alt="Victoria Zeder signature"
          width={263}
          height={244}
          priority
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>

      {/* Artist name */}
      <p
        ref={nameRef}
        className="font-sans"
        style={{
          fontSize: "9.5px",
          fontWeight: 500,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-secondary)",
          opacity: 0,
          marginBottom: "48px",
        }}
      >
        Victoria Zeder
      </p>

      {/* Hairline divider — draws itself left-to-right */}
      <div
        ref={dividerRef}
        aria-hidden="true"
        style={{
          width: "120px",
          height: "1px",
          background: "var(--color-divider)",
          marginBottom: "24px",
          transform: "scaleX(0)",
          willChange: "transform",
        }}
      />

      {/* Return to the work — italic serif link with nudging arrow */}
      <div
        ref={returnRef}
        style={{
          opacity: 0,
          willChange: "opacity, transform",
        }}
      >
        <Link
          href="/"
          aria-label="Return to Victoria Zeder's portfolio"
          className="signature-return font-serif hover-underline"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(15px, 1.6vw, 17px)",
            color: "var(--color-ink)",
            textDecoration: "none",
            padding: "4px 2px",
          }}
        >
          {/* Hand-drawn arrow — nudges left on hover via sibling CSS */}
          <svg
            viewBox="0 0 28 10"
            width="28"
            height="10"
            fill="none"
            aria-hidden="true"
            className="signature-return-arrow"
            style={{
              flexShrink: 0,
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <path
              d="M27 5 L2 5 M7 1 L2 5 L7 9"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Return to the work
        </Link>
      </div>
    </div>
  );
}
