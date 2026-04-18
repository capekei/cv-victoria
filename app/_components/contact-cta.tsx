import Link from "next/link";
import type { ContactInfo } from "@/app/_lib/artist";
import { SectionLabel } from "./section-label";

interface ContactProps {
  contact: ContactInfo;
}

export function Contact({ contact }: ContactProps) {
  return (
    <section className="pt-1">
      <SectionLabel title="Contact" />

      {/* Italic invitation — mirrors the opening quote on /contact. */}
      <p className="font-serif italic font-normal text-ink leading-[1.5] mb-[22px] max-w-[420px] text-[clamp(18px,2vw,22px)]">
        Every painting begins with a conversation.
      </p>

      {/* Primary CTA — prominent italic serif link to /contact */}
      <Link
        href="/contact"
        prefetch
        aria-label="Begin a conversation — open the contact page"
        className="home-contact-cta font-serif hover-underline inline-flex items-center gap-3 italic font-normal text-ink no-underline mb-8 py-1 px-0.5 text-[clamp(16px,1.7vw,18px)]"
      >
        Begin a conversation
        {/* Hand-drawn arrow — nudges right on hover (invitation outward). */}
        <svg
          viewBox="0 0 28 10"
          width="28"
          height="10"
          fill="none"
          aria-hidden="true"
          className="home-contact-cta-arrow shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
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

      <hr className="border-0 border-t border-divider mb-4" />

      {/* Quick-reference footer row */}
      <div className="flex flex-wrap gap-5 text-[11px] font-medium text-secondary tracking-[0.01em]">
        <span className="hover-underline">{contact.location}</span>
        <a
          href={`mailto:${contact.email}`}
          className="hover-underline text-inherit no-underline cursor-pointer"
        >
          {contact.email}
        </a>
        <a
          href={`https://${contact.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-underline text-inherit no-underline cursor-pointer"
        >
          {contact.website}
        </a>
        <a
          href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-underline text-inherit no-underline cursor-pointer"
        >
          {contact.instagram}
        </a>
      </div>
    </section>
  );
}
