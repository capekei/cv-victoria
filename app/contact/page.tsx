import type { Metadata } from "next";
import { ContactExperience } from "@/app/_components/contact/ContactExperience";
import { buildContactPageGraph, safeJsonLd } from "@/app/_lib/jsonld";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commission a painting, discuss an exhibition, or explore a collaboration with Victoria Zeder. Miami-based visual artist working with 24k gold leaf, acrylic ink, thread, and encaustic.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Victoria Zeder",
    description: "Every painting begins with a conversation.",
    url: "https://victoriazeder.com/contact",
    type: "website",
    images: [
      {
        url: "/victoria-portrait-og.jpg",
        width: 1200,
        height: 630,
        alt: "Victoria Zeder, visual artist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Victoria Zeder",
    description: "Every painting begins with a conversation.",
    images: ["/victoria-portrait-og.jpg"],
  },
};

const jsonLd = safeJsonLd(buildContactPageGraph());

export default function ContactPage() {
  return (
    <>
      {/* Visually hidden heading for screen readers */}
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        Contact Victoria Zeder
      </h1>

      {/* JSON-LD structured data — hardcoded, safe from XSS */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <ContactExperience />
    </>
  );
}
