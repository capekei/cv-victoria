"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap } from "gsap";

/**
 * Postscript card — the "my best work." moment that takes the same
 * on-screen position the contact form occupies in Phase 3. Not a
 * standalone section; the next card in the pinned choreography. The
 * painting-video backdrop, grain overlay, and pin logic all live in
 * ContactExperience. This component just renders the card and its
 * internal entrance animation.
 *
 * The phrase is deliberately ambiguous: "work" sets up the expectation
 * of a painting, the video of her with her daughter reverses it. The
 * beat between setup and reveal is the whole point.
 */

/* Asset paths keep their Spanish slugs — only the displayed text changes. */
const POSTER = "/videos/mi-mejor-creacion-poster.jpg";
const WEBM = "/videos/mi-mejor-creacion.webm";
const MP4 = "/videos/mi-mejor-creacion.mp4";

const PHRASE_WORDS = ["my", "best", "work."];

const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_MQ);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const getReducedSnapshot = () => window.matchMedia(REDUCED_MQ).matches;
const getReducedServerSnapshot = () => false;

interface PostscriptProps {
  /* Parent tells us when this phase is at-rest (form has faded, we're
     revealed) so we can trigger autoplay + the in-card GSAP entrance.
     We refuse to start until we're actually visible. */
  active: boolean;
}

export function Postscript({ active }: PostscriptProps) {
  const phraseRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasPlayed, setHasPlayed] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [manuallyStarted, setManuallyStarted] = useState(false);
  const [reducedOverride, setReducedOverride] = useState(false);
  const [started, setStarted] = useState(false);

  const reducedSystem = useSyncExternalStore(
    subscribeReduced,
    getReducedSnapshot,
    getReducedServerSnapshot,
  );
  const reduced = reducedSystem && !reducedOverride;

  /* Trigger the in-card entrance once, the first time the parent tells
     us we're active. Re-activations (scrolling back) don't restart it.
     Compare-in-render pattern: React batches the setState into the same
     render pass when `active` flips true, avoiding the cascading-render
     penalty a useEffect would incur. */
  if (active && !started) {
    setStarted(true);
  }

  /* GSAP entrance — phrase words stagger, daughter video opens through
     a horizontal clip-path curtain. Runs once on `started`. */
  useEffect(() => {
    if (!started) return;

    const phrase = phraseRef.current;
    const media = mediaRef.current;
    if (!phrase || !media) return;

    const words = phrase.querySelectorAll<HTMLSpanElement>(".pp-word");

    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0 });
      gsap.set(media, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }

    gsap.set(words, { opacity: 0, y: 12 });
    gsap.set(media, { opacity: 0, clipPath: "inset(0% 50% 0% 50%)" });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(words, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }).to(
      media,
      {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.0,
        ease: "power3.inOut",
      },
      "-=0.2",
    );

    return () => {
      tl.kill();
    };
  }, [started, reduced]);

  /* Video event handlers */
  const handleEnded = () => {
    setHasPlayed(true);
    const v = videoRef.current;
    if (v) v.pause();
  };
  const handleReplay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setHasPlayed(false);
    setManuallyStarted(true);
    v.play().catch(() => {});
  };
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !soundOn;
    v.muted = !next;
    setSoundOn(next);
    if (next && hasPlayed) {
      v.currentTime = Math.max(0, v.duration - 3);
      v.play().catch(() => {});
    }
  };
  const playFromReducedState = () => {
    setReducedOverride(true);
    setManuallyStarted(true);
  };

  const shouldAutoplay = started && !reduced;

  return (
    <div
      style={{
        /* Exact match with the ContactForm card (min 420px, 48px viewport
           gap, 36×28 padding) so the Phase 3 → Phase 4 swap reads as the
           same card changing its contents — not a new, bigger card
           appearing. This is the heart of the continuous-scroll illusion. */
        width: "min(420px, calc(100vw - 48px))",
        padding: "36px 28px",
        background: "rgba(247, 246, 242, 0.88)",
        /* `--glass-blur` is driven by ContactExperience during the scroll
           swap so frost ramps in sync with the form's frost ramping out. */
        backdropFilter: "blur(var(--glass-blur, 20px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 20px))",
        borderRadius: "5px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
    >
      {/* Phrase — scaled to fit the 420px-wide card's content area.
          Matches the "mi mejor creación." beat visually: same font
          weight as the italic invitation on the home page CTA. */}
      <p
        ref={phraseRef}
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(20px, 5.2vw, 26px)",
          lineHeight: 1.4,
          color: "var(--color-ink)",
          textAlign: "center",
          letterSpacing: "-0.005em",
          marginBottom: "clamp(18px, 2.6vh, 28px)",
        }}
      >
        {PHRASE_WORDS.map((word, i) => (
          <span
            key={word}
            className="pp-word"
            style={{
              display: "inline-block",
              marginRight: i < PHRASE_WORDS.length - 1 ? "0.32em" : 0,
              willChange: "opacity, transform",
              /* Pre-state the words in the "before" GSAP position so the
                 in-card timeline's gsap.set() doesn't cause a visible
                 reset-then-reveal flash when `started` flips true mid-swap.
                 GSAP overrides these immediately once useEffect fires. */
              opacity: 0,
              transform: "translateY(12px)",
            }}
          >
            {word}
          </span>
        ))}
      </p>

      {/* Daughter video — native landscape aspect, clean edges, 3px radius */}
      <div
        ref={mediaRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "848 / 480",
          overflow: "hidden",
          borderRadius: "3px",
          background: "var(--color-canvas)",
          willChange: "opacity, clip-path",
          /* Matching pre-state to the words above — horizontal curtain
             closed, invisible — so gsap.set() on started doesn't visibly
             snap the media from its rendered-open state to the closed one
             before animating back open. */
          opacity: 0,
          clipPath: "inset(0% 50% 0% 50%)",
        }}
      >
        <Image
          src={POSTER}
          alt="Victoria with her daughter"
          fill
          /* Card width is min(420, 100vw - 48); content width subtracts
             56px of padding. Below 468px viewport, card hits the gap
             limit, so video width = 100vw - 104. Above, fixed at 364. */
          sizes="(max-width: 468px) calc(100vw - 104px), 364px"
          style={{ objectFit: "cover" }}
          priority={false}
        />

        {started && !reduced && (
          <video
            ref={videoRef}
            poster={POSTER}
            autoPlay={shouldAutoplay && !manuallyStarted}
            muted={!soundOn}
            playsInline
            preload="auto"
            onEnded={handleEnded}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source src={WEBM} type="video/webm" />
            <source src={MP4} type="video/mp4" />
          </video>
        )}

        {reduced && started && (
          <button
            type="button"
            onClick={playFromReducedState}
            aria-label="Play video"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.2)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(247, 246, 242, 0.92)",
                color: "var(--color-ink)",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "4px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              ▶
            </span>
          </button>
        )}
      </div>

      {/* Controls — italic serif, inside the card, below the video */}
      <div
        style={{
          marginTop: "clamp(18px, 2.8vh, 26px)",
          display: "flex",
          gap: "clamp(14px, 2vw, 18px)",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-bodoni)",
          fontStyle: "italic",
          fontSize: "clamp(12px, 1.3vw, 14px)",
          color: "var(--color-ink)",
          opacity: started ? 0.55 : 0,
          transition: "opacity 0.8s ease-out 1.2s",
          minHeight: "1.4em",
        }}
      >
        {!reduced && (
          <button
            type="button"
            onClick={toggleSound}
            className="hover-underline"
            style={{
              background: "transparent",
              border: "none",
              padding: "2px 1px",
              fontFamily: "inherit",
              fontStyle: "inherit",
              fontSize: "inherit",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            {soundOn ? "mute" : "with sound"}
          </button>
        )}
        {hasPlayed && (
          <>
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              ·
            </span>
            <button
              type="button"
              onClick={handleReplay}
              className="hover-underline"
              style={{
                background: "transparent",
                border: "none",
                padding: "2px 1px",
                fontFamily: "inherit",
                fontStyle: "inherit",
                fontSize: "inherit",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
