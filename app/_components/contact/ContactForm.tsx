"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { contactSchema, type ContactData } from "@/app/api/contact/schema";

interface ContactFormProps {
  onSuccess: () => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
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

  const onSubmit = async (data: ContactData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          /* Server checks this field; if filled, request is silently
             dropped (treated as success on the client). */
          website: honeypotRef.current?.value ?? "",
        }),
      });
      if (res.ok) {
        /* Flash an inline "Sent" confirmation before the Phase 4 overlay
           covers the form. Screen readers announce it via aria-live, and
           sighted users get immediate feedback even if the clip-path
           transition is delayed by a slow CPU. */
        setSent(true);
        setSubmitting(false);
        /* Small beat so the confirmation is perceivable, then hand off. */
        window.setTimeout(onSuccess, 350);
      } else {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setServerError(
          payload?.error ?? "Something went wrong. Please try again.",
        );
        setSubmitting(false);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const labelStyle = {
    fontFamily: "var(--font-montserrat)",
    fontSize: "9.5px",
    fontWeight: 500,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--color-secondary)",
    display: "block",
    marginBottom: "8px",
  } as const;

  const inputStyle = {
    fontFamily: "var(--font-montserrat)",
    fontSize: "15px",
    fontWeight: 400,
    color: "var(--color-ink)",
    width: "100%",
    border: "none",
    borderBottom: "1px solid var(--color-divider)",
    background: "transparent",
    paddingBottom: "10px",
    outline: "none",
    transition: "border-color 0.3s ease",
    opacity: submitting ? 0.6 : 1,
  } as const;

  const errorStyle = {
    fontFamily: "var(--font-montserrat)",
    fontSize: "12px",
    fontWeight: 400,
    color: "#E24B4A",
    marginTop: "6px",
  } as const;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = "var(--color-ink)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = "var(--color-divider)";
  };

  return (
    <div
      style={{
        width: "min(420px, calc(100vw - 48px))",
        padding: "36px 28px",
        background: "rgba(247, 246, 242, 0.88)",
        /* --glass-blur is driven by ContactExperience during Phase 3b
           entry, ramping from 0px → 20px as the form rises. Falls back
           to 20px so stacked mobile / reduced-motion still gets frost. */
        backdropFilter: "blur(var(--glass-blur, 20px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 20px))",
        borderRadius: "5px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
    >
      {/* react-hook-form's handleSubmit returns a ref-safe submit handler;
          the ref inside onSubmit is read only when the form is submitted,
          never during render. The lint rule's heuristic can't see past the
          wrapper function, so suppress it for this specific call site. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Honeypot — hidden from humans, irresistible to bots.
            Positioned off-screen rather than display:none because
            some bots ignore display:none. tabIndex=-1 + aria-hidden
            keep it out of keyboard + screen-reader flows. */}
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
        <div style={{ marginBottom: "24px" }}>
          <label htmlFor="contact-name" style={labelStyle}>
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            readOnly={submitting}
            {...register("name")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
          {errors.name && (
            <p role="alert" aria-live="polite" style={errorStyle}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: "24px" }}>
          <label htmlFor="contact-email" style={labelStyle}>
            Your email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            maxLength={100}
            readOnly={submitting}
            {...register("email")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
          {errors.email && (
            <p role="alert" aria-live="polite" style={errorStyle}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div style={{ marginBottom: "28px" }}>
          <label htmlFor="contact-message" style={labelStyle}>
            What brings you here?
          </label>
          <textarea
            id="contact-message"
            maxLength={2000}
            readOnly={submitting}
            {...register("message")}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              ...inputStyle,
              minHeight: "80px",
              resize: "vertical",
              lineHeight: "1.5",
            }}
          />
          {errors.message && (
            <p role="alert" aria-live="polite" style={errorStyle}>
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            disabled={submitting || sent}
            aria-label="Submit contact form"
            className="contact-submit-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 48px",
              background: "var(--color-ink)",
              border: "none",
              borderRadius: 0,
              cursor: submitting ? "wait" : sent ? "default" : "pointer",
              minWidth: "140px",
              minHeight: "44px",
              transition:
                "letter-spacing 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {submitting ? (
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: "12px",
                  height: "12px",
                  border: "2px solid transparent",
                  borderTopColor: "var(--color-cream)",
                  borderRadius: "50%",
                  animation: "contact-spin 0.6s linear infinite",
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-montserrat)",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-cream)",
                }}
              >
                {sent ? "Sent" : "Begin"}
              </span>
            )}
          </button>
          {/* Inline success flash — visible for ~350ms before Phase 4 takes
              over. aria-live="polite" announces it to screen readers. */}
          <p
            role="status"
            aria-live="polite"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-secondary)",
              marginTop: "14px",
              minHeight: "1em",
              opacity: sent ? 1 : 0,
              transition: "opacity 0.25s ease-out",
            }}
          >
            {sent ? "Message sent" : ""}
          </p>
          {serverError && (
            <p role="alert" aria-live="assertive" style={{ ...errorStyle, marginTop: "12px" }}>
              {serverError}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
