"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { VideoBackground } from "./VideoBackground";
import { GrainOverlay } from "./GrainOverlay";
import { PauseButton } from "./PauseButton";
import { ScrollIndicator } from "./ScrollIndicator";
import { ContactForm } from "./ContactForm";
import { SignatureReveal } from "./SignatureReveal";

/* Phase 2 words with cascading opacity */
const WORDS = [
  { text: "Commissions", opacity: 0.92 },
  { text: "Exhibitions", opacity: 0.72 },
  { text: "Collaborations", opacity: 0.52 },
] as const;

export function ContactExperience() {
  /* Refs — phase sections */
  const videoSectionRef = useRef<HTMLElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const underlineRefs = useRef<(SVGLineElement | null)[]>([]);
  const phase3Ref = useRef<HTMLDivElement>(null);

  /* Phase 4 overlay */
  const phase4Ref = useRef<HTMLDivElement>(null);

  /* Video element */
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  /* Form state */
  const [submitted, setSubmitted] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const handleSuccess = useCallback(() => {
    setSubmitted(true);
  }, []);

  /* ── Phase 4 transition (triggered by form submit, not scroll) ── */
  useEffect(() => {
    if (!submitted) return;
    const overlay = phase4Ref.current;
    if (!overlay) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      overlay.style.visibility = "visible";
      overlay.style.clipPath = "circle(150% at 50% 50%)";
      setShowSignature(true);
      return;
    }

    gsap.set(overlay, {
      visibility: "visible",
      clipPath: "circle(0% at 50% 50%)",
    });

    gsap.to(overlay, {
      clipPath: "circle(150% at 50% 50%)",
      duration: 1.4,
      ease: "power2.inOut",
      onComplete: () => setShowSignature(true),
    });
  }, [submitted]);

  /* ── Main scroll setup — pin manually, animate via native scroll ── */
  useEffect(() => {
    const videoSection = videoSectionRef.current;
    if (!videoSection) return;

    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* If user prefers reduced motion, skip all animations — content stacks naturally */
    if (prefersReduced) {
      [phase1Ref, phase2Ref, phase3Ref].forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.position = "relative";
          ref.current.style.inset = "auto";
          ref.current.style.pointerEvents = "auto";
        }
      });
      return;
    }

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    if (isDesktop) {
      /* ========== DESKTOP: manual pin + raw scroll listener ========== */
      const vh = window.innerHeight;
      /* Extended pin distance: 5vh total. Gives breathing room between
         Phase 2 fade-out, the video color transition (pure dead zone),
         and the form rise. Target timeline:
           0   → 1vh    Phase 1 (quote)
           1vh → 2.5vh  Phase 2 (three words stagger + fade)
           2.5vh→ 3.5vh Video B&W → color (ONLY — no form yet)
           3.5vh→ 3.75vh Dead-zone gap (video settled, form still hidden)
           3.75vh→ 4.75vh Form rises (opacity + translateY + blur)
           4.75vh→ 5vh  Form at rest */
      const pinDistance = 5 * vh; // total scroll distance while pinned

      /* Spacer must be pinDistance + vh so the last phase fully reveals.
         The section is position:fixed during pin (0 height in flow), so
         reachable scroll = spacerHeight - vh. We need that to equal pinDistance. */
      const spacer = document.createElement("div");
      spacer.style.height = `${pinDistance + vh}px`;
      spacer.style.position = "relative";
      spacer.setAttribute("data-pin-spacer", "true");
      videoSection.parentNode?.insertBefore(spacer, videoSection.nextSibling);

      /* Record the section's top offset for pin calculations */
      const sectionTop = videoSection.getBoundingClientRect().top + window.scrollY;

      /* Prepare SVG underline lengths */
      const lineLengths: number[] = [];
      underlineRefs.current.forEach((line, i) => {
        if (line) {
          const len = line.getTotalLength();
          lineLengths[i] = len;
          line.style.strokeDasharray = String(len);
          line.style.strokeDashoffset = String(len);
        }
      });

      /* Set initial states — form starts further down (60px, not 40px)
         and blurred on its entry so the glass panel builds up the frost
         as it rises. `--glass-blur` inherits to ContactForm's wrapper. */
      if (phase3Ref.current) {
        phase3Ref.current.style.opacity = "0";
        phase3Ref.current.style.transform = "translateY(60px)";
        phase3Ref.current.style.pointerEvents = "none";
        phase3Ref.current.style.setProperty("--glass-blur", "0px");
      }
      wordRefs.current.forEach((w) => {
        if (w) {
          w.style.opacity = "0";
          w.style.transform = "translateY(40px)";
        }
      });

      /* Helper: clamp a value between 0 and 1 */
      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
      /* power2.out easing (matches GSAP's ease: "power2.out") */
      const easeOut2 = (t: number) => 1 - (1 - t) * (1 - t);

      /* ── Scroll smoothing (emulates GSAP scrub: 1.5) ──
         Raw scroll drives the pin instantly (no jitter), while a
         lerped value drives the phase animations so they feel floaty.
         Lerp factor 0.1 per frame ≈ ~150ms half-life. */
      let targetScroll = 0;
      let smoothScroll = 0;
      let rafId = 0;

      /* Phase-animation driver — reads smoothScroll, not raw scroll */
      const renderPhases = (scroll: number) => {
        /* ── Phase 1: fade out over 0→vh (unchanged) ── */
        const p1 = clamp01(scroll / vh);
        if (scrollIndicatorRef.current) {
          scrollIndicatorRef.current.style.opacity = String(1 - clamp01(p1 / 0.6));
        }
        if (phase1Ref.current) {
          phase1Ref.current.style.opacity = String(1 - clamp01((p1 - 0.2) / 0.8));
        }

        /* ── Phase 2: words stagger in from vh→2.5vh, fade out at end (unchanged) ── */
        const p2Raw = (scroll - vh) / (1.5 * vh);
        WORDS.forEach((word, i) => {
          const wordEl = wordRefs.current[i];
          const lineEl = underlineRefs.current[i];
          const wordStart = i * 0.3;
          const wordProgress = clamp01((p2Raw - wordStart) / 0.25);
          const fadeOut = clamp01((p2Raw - 0.9) / 0.1);

          if (wordEl) {
            const show = wordProgress * word.opacity;
            wordEl.style.opacity = String(fadeOut > 0 ? show * (1 - fadeOut) : show);
            wordEl.style.transform = `translateY(${40 * (1 - wordProgress)}px)`;
          }
          if (lineEl && lineLengths[i]) {
            lineEl.style.strokeDashoffset = String(
              lineLengths[i] * (1 - clamp01((p2Raw - wordStart - 0.05) / 0.25)),
            );
          }
        });

        /* ── Phase 3a: video B&W → color ONLY, from 2.5vh → 3.5vh ── */
        const pVideo = clamp01((scroll - 2.5 * vh) / vh);
        const videoTarget = videoSection.querySelector("video");
        if (videoTarget) {
          const gs = 1 - pVideo;
          const br = 0.85 + 0.15 * pVideo;
          videoTarget.style.filter = `grayscale(${gs}) brightness(${br})`;
        }

        /* ── Phase 3b: form rises from 3.75vh → 4.75vh ──
           Deliberate 0.25vh dead-zone between end of video transition
           and start of form entry — visitor sees ONLY the color video. */
        const pForm = clamp01((scroll - 3.75 * vh) / vh);
        const eased = easeOut2(pForm);
        if (phase3Ref.current) {
          phase3Ref.current.style.opacity = String(eased);
          phase3Ref.current.style.transform = `translateY(${60 * (1 - eased)}px)`;
          phase3Ref.current.style.setProperty(
            "--glass-blur",
            `${20 * eased}px`,
          );
          phase3Ref.current.style.pointerEvents = eased > 0.5 ? "auto" : "none";
        }
      };

      /* RAF loop — lerp smoothScroll toward targetScroll */
      const tick = () => {
        const delta = targetScroll - smoothScroll;
        /* Snap to target if essentially there (prevents sub-pixel thrash) */
        if (Math.abs(delta) < 0.1) {
          smoothScroll = targetScroll;
        } else {
          smoothScroll += delta * 0.1;
        }
        renderPhases(smoothScroll);
        if (smoothScroll !== targetScroll) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = 0;
        }
      };

      /* The scroll handler — pin is instant, phases are deferred to RAF */
      const onScroll = () => {
        const scrollY = window.scrollY;
        const relScroll = scrollY - sectionTop;

        /* ── Pin logic (uses RAW scroll — must be instant) ── */
        if (relScroll >= 0 && relScroll <= pinDistance) {
          videoSection.style.position = "fixed";
          videoSection.style.top = "0";
          videoSection.style.left = "0";
          videoSection.style.width = "100%";
          videoSection.style.zIndex = "10";
        } else if (relScroll > pinDistance) {
          videoSection.style.position = "absolute";
          videoSection.style.top = `${sectionTop + pinDistance}px`;
          videoSection.style.left = "0";
          videoSection.style.width = "100%";
          videoSection.style.zIndex = "10";
        } else {
          videoSection.style.position = "relative";
          videoSection.style.top = "auto";
          videoSection.style.left = "auto";
          videoSection.style.width = "100%";
          videoSection.style.zIndex = "";
        }

        /* Update target scroll for phase animations (clamped 0→pinDistance) */
        targetScroll = Math.max(0, Math.min(pinDistance, relScroll));
        if (!rafId) {
          rafId = requestAnimationFrame(tick);
        }
      };

      /* Attach listener and run once immediately */
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      /* First render should paint the initial state without lerp delay */
      smoothScroll = targetScroll;
      renderPhases(smoothScroll);

      return () => {
        window.removeEventListener("scroll", onScroll);
        if (rafId) cancelAnimationFrame(rafId);
        spacer.remove();
        videoSection.style.position = "";
        videoSection.style.top = "";
        videoSection.style.left = "";
        videoSection.style.width = "";
        videoSection.style.zIndex = "";
      };
    }

    /* ========== MOBILE: no pinning, overlays become stacked ========== */
    [phase1Ref, phase2Ref, phase3Ref].forEach((ref) => {
      if (ref.current) {
        ref.current.style.position = "relative";
        ref.current.style.opacity = "1";
        ref.current.style.inset = "auto";
        ref.current.style.minHeight = "100vh";
        ref.current.style.display = "flex";
        ref.current.style.pointerEvents = "auto";
      }
    });

    videoSection.style.height = "auto";
    videoSection.style.minHeight = "300vh";
    videoSection.style.display = "flex";
    videoSection.style.flexDirection = "column";

    /* Stagger word reveals via IntersectionObserver (no GSAP dependency) */
    const observers: IntersectionObserver[] = [];
    wordRefs.current.forEach((w, i) => {
      if (!w) return;
      w.style.opacity = "0";
      w.style.transform = "translateY(20px)";
      w.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            w.style.opacity = String(WORDS[i].opacity);
            w.style.transform = "translateY(0)";
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(w);
      observers.push(obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ═══════ PINNED VIDEO SECTION (Phases 1-3) ═══════ */}
      <section
        ref={videoSectionRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Video / Image background */}
        <VideoBackground onVideoRef={setVideoEl} />
        <GrainOverlay blendMode="overlay" />
        <PauseButton videoEl={videoEl} />

        {/* ── Phase 1: The Opening ── */}
        <div
          ref={phase1Ref}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            className="font-serif"
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(22px, 3vw, 28px)",
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 1px 30px rgba(0,0,0,0.3)",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: "520px",
              padding: "0 24px",
            }}
          >
            Every painting begins{" "}
            <span className="contact-quote-break" />
            with a conversation.
          </p>

          <div ref={scrollIndicatorRef}>
            <ScrollIndicator />
          </div>
        </div>

        {/* ── Phase 2: The Words ── */}
        <div
          ref={phase2Ref}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(32px, 5vw, 48px)",
            pointerEvents: "none",
          }}
        >
          {WORDS.map((word, i) => (
            <div
              key={word.text}
              ref={(el) => { wordRefs.current[i] = el; }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: 0,
              }}
            >
              <span
                className="font-serif"
                style={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "clamp(28px, 5vw, 48px)",
                  letterSpacing: "0.03em",
                  color: `rgba(255,255,255,${word.opacity})`,
                  textShadow: "0 1px 30px rgba(0,0,0,0.3)",
                }}
              >
                {word.text}
              </span>
              <svg
                viewBox="0 0 300 4"
                width="100%"
                height="4"
                preserveAspectRatio="none"
                style={{ marginTop: "8px" }}
                aria-hidden="true"
              >
                <line
                  ref={(el) => { underlineRefs.current[i] = el; }}
                  x1="0"
                  y1="2"
                  x2="300"
                  y2="2"
                  stroke={`rgba(255,255,255,${word.opacity})`}
                  strokeWidth="2"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* ── Phase 3: The Form ── */}
        <div
          ref={phase3Ref}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <ContactForm onSuccess={handleSuccess} />
        </div>
      </section>

      {/* ═══════ PHASE 4: Thank You Overlay ═══════ */}
      <div
        ref={phase4Ref}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          backgroundColor: "var(--color-cream)",
          visibility: "hidden",
          clipPath: "circle(0% at 50% 50%)",
        }}
      >
        <GrainOverlay blendMode="multiply" />
        <SignatureReveal play={showSignature} />
      </div>
    </>
  );
}
