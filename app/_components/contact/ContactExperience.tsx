"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { VideoBackground } from "./VideoBackground";
import { GrainOverlay } from "./GrainOverlay";
import { PauseButton } from "./PauseButton";
import { ScrollIndicator } from "./ScrollIndicator";
import { ContactForm } from "./ContactForm";
import { SignatureReveal } from "./SignatureReveal";
import { Postscript } from "./Postscript";

/* Phase 2 words with cascading opacity */
/* Three equal invitations — a trinity, not a ranked list.
   Stagger timing and SVG underline still carry rhythm; brightness is uniform. */
const WORDS = [
  { text: "Commissions", opacity: 0.92 },
  { text: "Exhibitions", opacity: 0.92 },
  { text: "Collaborations", opacity: 0.92 },
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
  /* Keep-scrolling hint — a single hairline + italic "más." that draws
     itself a few seconds after the form has settled. Lives as a child
     of phase3Ref so it inherits the form's fade-in / fade-out as the
     visitor scrolls between Phase 3 and Phase 4. */
  const hintRef = useRef<HTMLDivElement>(null);
  const hintTriggered = useRef(false);
  /* Phase 4 — postscript card sits in the same on-screen position as
     the contact form, swapping in as the visitor keeps scrolling. */
  const phase4PostscriptRef = useRef<HTMLDivElement>(null);

  /* Phase 5 — thank-you overlay (after submission) */
  const phase4Ref = useRef<HTMLDivElement>(null);

  /* Video element */
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  /* Form state */
  const [submitted, setSubmitted] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  /* Drives the Postscript card's internal autoplay + entrance GSAP.
     Flips true once scroll has revealed the card past the halfway
     point so we don't start playback for someone who's only glimpsed it. */
  const [postscriptActive, setPostscriptActive] = useState(false);

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
      [phase1Ref, phase2Ref, phase3Ref, phase4PostscriptRef].forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.position = "relative";
          ref.current.style.inset = "auto";
          ref.current.style.pointerEvents = "auto";
        }
      });
      /* Reduced-motion visitors see both cards in document flow —
         postscript shows beneath the form, playback drivers unchanged. */
      setPostscriptActive(true);
      return;
    }

    /* ========== Pinned scroll experience — runs on every device.
       The same choreography plays out regardless of viewport: the section
       pins via position:fixed, a spacer provides the scroll room, and a
       RAF-smoothed scroll position drives the phase animations. On mobile
       the background media is a Next.js <Image> fallback; we target
       "video, img" so the B&W → color filter animates identically on
       both touch and pointer devices. ========== */
    /* vh floor at 560 so very short landscape phones don't rush the
       1.6vh form-entrance + 1.5vh postscript-swap animations into
       sub-100px of scroll, which makes them feel jumpy. Math is still
       vh-relative; only the minimum changes. */
    const vh = Math.max(window.innerHeight, 560);
    /* Deliberately slow timeline — each phase stretched enough to feel
       noticeably slower on trackpads, mouse wheels, and touch flicks.
       Target timeline:
         0     → 2.2vh   Phase 1 (quote)
         2.2   → 5.6vh   Phase 2 (three words stagger + fade)
         5.6   → 7.8vh   Media B&W → color
         7.8   → 8.2vh   Dead zone
         8.2   → 9.8vh   Form rises
         9.8   → 10.8vh  Form at rest
         10.8  → 12.4vh  Form fades out / postscript card swaps in
         12.4  → 13.5vh  Postscript at rest */
    const pinDistance = 13.5 * vh; // total scroll distance while pinned

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
    /* Postscript card starts hidden beneath the form's rest position;
       it rises into view in Phase 4 as the form fades out. */
    if (phase4PostscriptRef.current) {
      phase4PostscriptRef.current.style.opacity = "0";
      phase4PostscriptRef.current.style.transform = "translateY(60px)";
      phase4PostscriptRef.current.style.pointerEvents = "none";
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
    /* power2.inOut easing for softer fade transitions */
    const easeInOut2 = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    /* ── Scroll smoothing (emulates GSAP scrub: 1.5) ──
       Raw scroll drives the pin instantly (no jitter), while a
       lerped value drives the phase animations so they feel floaty.
       Lerp factor 0.1 per frame ≈ ~150ms half-life. */
    let targetScroll = 0;
    let smoothScroll = 0;
    let rafId = 0;

    /* Phase-animation driver — reads smoothScroll, not raw scroll */
    const renderPhases = (scroll: number) => {
      /* ── Phase 1: fade out over 0→2.2vh ── */
      const p1 = clamp01(scroll / (2.2 * vh));
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.opacity = String(1 - clamp01(p1 / 0.6));
      }
      if (phase1Ref.current) {
        phase1Ref.current.style.opacity = String(1 - clamp01((p1 - 0.2) / 0.8));
      }

      /* ── Phase 2: words stagger in from 2.2vh→5.6vh, fade out at end ── */
      const p2Raw = (scroll - 2.2 * vh) / (3.4 * vh);
      WORDS.forEach((word, i) => {
        const wordEl = wordRefs.current[i];
        const lineEl = underlineRefs.current[i];
        /* Per-word timing so the last word doesn't feel rushed. */
        const isLastWord = i === WORDS.length - 1;
        const wordStart = isLastWord ? 0.52 : i * 0.3;
        const revealDuration = isLastWord ? 0.28 : 0.25;
        const wordProgress = clamp01((p2Raw - wordStart) / revealDuration);
        const fadeOutStart = isLastWord ? 0.97 : 0.88;
        const fadeOutDuration = isLastWord ? 0.16 : 0.12;
        const rawFadeOut = clamp01((p2Raw - fadeOutStart) / fadeOutDuration);
        const fadeOut = isLastWord ? easeInOut2(rawFadeOut) : rawFadeOut;

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

      /* ── Phase 3a: background media B&W → color, from 5.6vh → 7.8vh.
         Desktop targets <video>; mobile targets the Next.js <img>
         fallback. CSS filter animates identically on both. */
      const pVideo = clamp01((scroll - 5.6 * vh) / (2.2 * vh));
      const mediaTarget = videoSection.querySelector(
        "video, img",
      ) as HTMLVideoElement | HTMLImageElement | null;
      if (mediaTarget) {
        const gs = 1 - pVideo;
        const br = 0.85 + 0.15 * pVideo;
        mediaTarget.style.filter = `grayscale(${gs}) brightness(${br})`;
      }

      /* ── Phase 3b: form rises from 8.2vh → 9.8vh ──
         Deliberate 0.4vh dead-zone between end of video transition
         and start of form entry — visitor sees ONLY the color video. */
      const pForm = clamp01((scroll - 8.2 * vh) / (1.6 * vh));
      const easedForm = easeOut2(pForm);

      /* ── Phase 4a: form fades out from 10.8vh → 12.4vh ──
         Starts after a 1vh rest window (9.8 → 10.8) so the visitor
         sees the form composed and legible before it begins its exit. */
      const pFormExit = clamp01((scroll - 10.8 * vh) / (1.6 * vh));
      const easedExit = easeInOut2(pFormExit);

      if (phase3Ref.current) {
        /* Compose Phase 3b entrance and Phase 4a exit. The entrance
           brings the form up and solidifies the glass; the exit fades
           it out and drifts it upward. Only one is "active" at a time
           because their scroll ranges don't overlap. */
        const formOpacity = easedForm * (1 - easedExit);
        const formY = 60 * (1 - easedForm) - 40 * easedExit;
        phase3Ref.current.style.opacity = String(formOpacity);
        phase3Ref.current.style.transform = `translateY(${formY}px)`;
        phase3Ref.current.style.setProperty(
          "--glass-blur",
          `${20 * easedForm * (1 - easedExit)}px`,
        );
        /* Interactive only when the form is actually the active card */
        phase3Ref.current.style.pointerEvents =
          formOpacity > 0.5 && easedExit < 0.3 ? "auto" : "none";
      }

      /* ── Keep-scrolling hint ──
         Fires once, ~1s after the form first reaches rest. A hairline
         draws down below the card, followed by a quiet italic "sigue."
         The whole thing inherits the form's opacity so it vanishes
         cleanly when Phase 4 takes over. */
      if (pForm >= 0.98 && !hintTriggered.current && hintRef.current) {
        hintTriggered.current = true;
        const hint = hintRef.current;
        const line = hint.querySelector<HTMLDivElement>(".cv-hint-line");
        const word = hint.querySelector<HTMLSpanElement>(".cv-hint-word");

        const tl = gsap.timeline({ delay: 1.0 });
        if (line) {
          gsap.set(line, { scaleY: 0, transformOrigin: "top center" });
          tl.to(line, {
            scaleY: 1,
            duration: 0.9,
            ease: "power2.inOut",
          });
        }
        if (word) {
          gsap.set(word, { opacity: 0, y: 6 });
          tl.to(
            word,
            {
              opacity: 0.95,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
            },
            "-=0.3",
          );
        }
        /* Gentle breath: the word drifts down 3px and back up on a
           2.6s sine loop. Slower than a pulse, more like a held gaze
           that softens and refocuses. */
        if (word) {
          tl.to(word, {
            y: 3,
            opacity: 0.7,
            duration: 1.3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      }

      /* ── Phase 4b: postscript card rises from 11.1vh → 12.6vh ──
         Starts 0.3vh after the form begins fading so the two pass
         each other rather than collide. */
      const pPost = clamp01((scroll - 11.1 * vh) / (1.5 * vh));
      const easedPost = easeOut2(pPost);
      if (phase4PostscriptRef.current) {
        phase4PostscriptRef.current.style.opacity = String(easedPost);
        phase4PostscriptRef.current.style.transform = `translateY(${
          60 * (1 - easedPost)
        }px)`;
        phase4PostscriptRef.current.style.pointerEvents =
          easedPost > 0.5 ? "auto" : "none";
      }
      /* Autoplay the daughter video + run the in-card GSAP once the
         postscript is genuinely on screen. React bails out on === value
         so this is safe to call every frame. */
      setPostscriptActive(easedPost > 0.6);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ═══════ PINNED VIDEO SECTION (Phases 1-3) ═══════ */}
      <section
        ref={videoSectionRef}
        data-contact-section
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
        {/* Return link — italic serif over the video, no container.
            Mirror of Phase 4's "Return to the work" so the visitor reads
            a single continuous gesture across entry and exit. Hand-drawn
            arrow nudges left on hover via .contact-return-arrow. */}
        <Link
          href="/"
          aria-label="Return to Victoria Zeder's portfolio"
          className="contact-return font-serif"
          style={{
            position: "absolute",
            top: "max(28px, env(safe-area-inset-top))",
            left: "max(28px, env(safe-area-inset-left))",
            zIndex: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(14px, 1.4vw, 16px)",
            color: "rgba(255,255,255,0.88)",
            textDecoration: "none",
            textShadow: "0 1px 30px rgba(0,0,0,0.5)",
            padding: "4px 2px",
          }}
        >
          <svg
            viewBox="0 0 28 10"
            width="26"
            height="10"
            fill="none"
            aria-hidden="true"
            className="contact-return-arrow"
            style={{
              flexShrink: 0,
              transition:
                "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
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

        {/* ── Phase 1: The Opening ── */}
        <div
          ref={phase1Ref}
          data-contact-phase
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

          {/* Authorial mark — Victoria signs her opening thought. Same
              signature that draws itself full-scale in Phase 4, rendered
              small and white-inked here (brightness(0) invert(1) turns the
              black PNG strokes white) so it reads as attribution, not
              decoration. Lives inside phase1Ref so it fades with the quote. */}
          <div
            aria-hidden="true"
            style={{
              marginTop: "clamp(24px, 3vw, 32px)",
              width: "clamp(72px, 10vw, 100px)",
              opacity: 0.6,
              filter: "brightness(0) invert(1)",
            }}
          >
            <Image
              src="/signature-vz.png"
              alt=""
              width={263}
              height={244}
              priority={false}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          <div ref={scrollIndicatorRef}>
            <ScrollIndicator />
          </div>
        </div>

        {/* ── Phase 2: The Words ── */}
        <div
          ref={phase2Ref}
          data-contact-phase
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
          data-contact-phase
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <ContactForm onSuccess={handleSuccess} />

          {/* ── Keep-scrolling hint ──
               Sits directly below the form as a flex sibling, so it
               anchors to the card's edge on every viewport. A drawing
               hairline + italic serif "more." with a glow that lifts it
               off the painting's chaos. Fires ~1s after form at rest.
               CSS class `cv-contact-hint` toggles display:none on
               viewports shorter than 560px (landscape phones) so the
               hint never competes with the form for scarce vertical
               space. */}
          <div
            ref={hintRef}
            className="cv-contact-hint"
            aria-hidden="true"
            style={{
              marginTop: "clamp(16px, 2.5vh, 28px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              pointerEvents: "none",
            }}
          >
            <div
              className="cv-hint-line"
              style={{
                width: "2px",
                height: "36px",
                borderRadius: "1px",
                background: "rgba(255, 255, 255, 0.92)",
                /* Subtle halo so the line reads against any color of
                   painting underneath — dark glow pushes the white
                   forward without adding visible chrome. */
                boxShadow:
                  "0 0 0 1px rgba(0, 0, 0, 0.10), 0 0 14px rgba(0, 0, 0, 0.45)",
                willChange: "transform",
              }}
            />
            <span
              className="cv-hint-word font-serif"
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "15px",
                letterSpacing: "0.01em",
                color: "rgba(255, 255, 255, 0.98)",
                /* Stacked shadows — a tight dark drop for contrast and a
                   wider softer halo so the word floats legibly over any
                   region of the painting. */
                textShadow:
                  "0 1px 2px rgba(0, 0, 0, 0.55), 0 2px 22px rgba(0, 0, 0, 0.55)",
                opacity: 0,
                willChange: "opacity, transform",
              }}
            >
              more.
            </span>
          </div>
        </div>

        {/* ── Phase 4: The Postscript ──
             Twin position to the form. The painting backdrop stays still
             while the cards swap: form drifts up and fades, postscript
             rises from below and takes the same on-screen spot. One
             continuous scroll, no section break. */}
        <div
          ref={phase4PostscriptRef}
          data-contact-phase
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <Postscript active={postscriptActive} />
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
