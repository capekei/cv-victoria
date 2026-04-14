import Link from "next/link";
import type { ContactInfo } from "@/app/artist";
import { SectionLabel } from "./section-label";

interface ContactProps {
  contact: ContactInfo;
}

export function Contact({ contact }: ContactProps) {
  const linkStyle = {
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
  } as const;

  return (
    <section style={{ paddingTop: "4px" }}>
      <SectionLabel title="Contact" />

      {/* Italic invitation — mirrors the opening quote on /contact so
          the home page's call-to-action already speaks in her voice. */}
      <p
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(18px, 2vw, 22px)",
          lineHeight: 1.5,
          color: "var(--color-ink)",
          maxWidth: "420px",
          marginBottom: "22px",
        }}
      >
        Every painting begins with a conversation.
      </p>

      {/* Primary CTA — prominent italic serif link to /contact */}
      <Link
        href="/contact"
        prefetch
        aria-label="Begin a conversation — open the contact page"
        className="home-contact-cta font-serif hover-underline"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(16px, 1.7vw, 18px)",
          color: "var(--color-ink)",
          textDecoration: "none",
          marginBottom: "32px",
          padding: "4px 2px",
        }}
      >
        Begin a conversation
        {/* Hand-drawn arrow — nudges right on hover (invitation outward).
            Mirror of the "Return to the work" arrow on the thank-you page. */}
        <svg
          viewBox="0 0 28 10"
          width="28"
          height="10"
          fill="none"
          aria-hidden="true"
          className="home-contact-cta-arrow"
          style={{
            flexShrink: 0,
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <path
            d="M1 5 L26 5 M21 1 L26 5 L21 9"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--color-divider)",
          marginBottom: "16px",
        }}
      />

      {/* Quick-reference footer row — existing metadata links */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--color-secondary)",
          letterSpacing: "0.01em",
        }}
      >
        <span className="hover-underline">{contact.location}</span>
        <a
          href={`mailto:${contact.email}`}
          className="hover-underline"
          style={linkStyle}
        >
          {contact.email}
        </a>
        <a
          href={`https://${contact.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-underline"
          style={linkStyle}
        >
          {contact.website}
        </a>
        <a
          href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-underline"
          style={linkStyle}
        >
          {contact.instagram}
        </a>
      </div>
    </section>
  );
}
