"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { contactSchema, type ContactData } from "@/app/_lib/contact-schema";
import { submitContact } from "@/app/_actions/contact";

interface ContactFormProps {
  onSuccess: () => void;
}

const LABEL_CLASS =
  "block font-sans text-[9.5px] font-medium uppercase tracking-[0.2em] text-secondary mb-2";
const INPUT_CLASS =
  "w-full font-sans text-[15px] font-normal text-ink bg-transparent border-0 border-b border-divider pb-2.5 outline-none transition-[border-color] duration-300 ease focus:border-b-ink read-only:opacity-60";
const ERROR_CLASS = "font-sans text-[12px] font-normal text-[#E24B4A] mt-1.5";

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const submitting = isPending;
  /* Honeypot input — bots fill hidden fields, humans never touch them.
     Kept outside react-hook-form so it doesn't pollute the typed data. */
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactData) => {
    setServerError(null);
    const payload = {
      ...data,
      /* Server checks this field; if filled, the submission is silently
         dropped (treated as success on the client). */
      website: honeypotRef.current?.value ?? "",
    };
    startTransition(async () => {
      const result = await submitContact(payload);
      if (result.ok) {
        setSent(true);
        window.setTimeout(onSuccess, 350);
      } else {
        setServerError(result.error);
      }
    });
  };

  return (
    <div
      /* --glass-blur is driven by ContactExperience during Phase 3b
         entry, ramping from 0px → 20px as the form rises. Falls back
         to 20px so stacked mobile / reduced-motion still gets frost. */
      className="w-[min(420px,calc(100vw-48px))] py-9 px-7 bg-[rgba(247,246,242,0.88)] rounded-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-[var(--glass-blur,20px)] [-webkit-backdrop-filter:blur(var(--glass-blur,20px))]"
    >
      {/* react-hook-form's handleSubmit returns a ref-safe submit handler;
          the ref inside onSubmit is read only when the form is submitted,
          never during render. The lint rule's heuristic can't see past the
          wrapper function, so suppress it for this specific call site. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate data-state={submitting ? "submitting" : sent ? "sent" : "idle"}>
        {/* Honeypot — hidden from humans, irresistible to bots.
            Positioned off-screen rather than display:none because
            some bots ignore display:none. tabIndex=-1 + aria-hidden
            keep it out of keyboard + screen-reader flows. Inline styles
            here are intentional: exact box metrics matter for bot evasion
            and to keep Playwright's toBeHidden() heuristic happy. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label htmlFor="contact-website">Website</label>
          <input
            ref={honeypotRef}
            id="contact-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name */}
        <div className="mb-6">
          <label htmlFor="contact-name" className={LABEL_CLASS}>
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            readOnly={submitting}
            {...register("name")}
            className={INPUT_CLASS}
          />
          {errors.name && (
            <p role="alert" aria-live="polite" className={ERROR_CLASS}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label htmlFor="contact-email" className={LABEL_CLASS}>
            Your email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            maxLength={100}
            readOnly={submitting}
            {...register("email")}
            className={INPUT_CLASS}
          />
          {errors.email && (
            <p role="alert" aria-live="polite" className={ERROR_CLASS}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="mb-7">
          <label htmlFor="contact-message" className={LABEL_CLASS}>
            What brings you here?
          </label>
          <textarea
            id="contact-message"
            maxLength={2000}
            readOnly={submitting}
            {...register("message")}
            className={`${INPUT_CLASS} min-h-20 resize-y leading-[1.5]`}
          />
          {errors.message && (
            <p role="alert" aria-live="polite" className={ERROR_CLASS}>
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={submitting || sent}
            aria-label="Submit contact form"
            className="contact-submit-btn inline-flex items-center justify-center py-3.5 px-12 bg-ink border-0 rounded-none min-w-[140px] min-h-11 transition-[letter-spacing,background,color] duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer disabled:cursor-wait data-[sent=true]:cursor-default"
            data-sent={sent}
          >
            {submitting ? (
              <span
                aria-hidden="true"
                className="block w-3 h-3 border-2 border-transparent border-t-cream rounded-full"
                style={{ animation: "contact-spin 0.6s linear infinite" }}
              />
            ) : (
              <span className="font-sans text-[12px] font-medium uppercase tracking-[0.15em] text-cream">
                {sent ? "Sent" : "Begin"}
              </span>
            )}
          </button>
          {/* Inline success flash — visible for ~350ms before Phase 4 takes
              over. aria-live="polite" announces it to screen readers. */}
          <p
            role="status"
            aria-live="polite"
            className={`font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-secondary mt-3.5 min-h-[1em] transition-opacity duration-[250ms] ease-out ${sent ? "opacity-100" : "opacity-0"}`}
          >
            {sent ? "Message sent" : ""}
          </p>
          {serverError && (
            <p role="alert" aria-live="assertive" className={`${ERROR_CLASS} mt-3`}>
              {serverError}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
