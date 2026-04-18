import type { Metadata } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://victoriazeder.com"),
  title: {
    default: "Victoria Zeder — Visual Artist, Miami",
    template: "%s · Victoria Zeder",
  },
  description:
    "Victoria Zeder is a Miami-based visual artist working with 24k gold leaf, acrylic ink, thread, and encaustic. Formally trained painter exploring biomorphic biomimicry and Jungian expression. Born in the Dominican Republic, 1991.",
  applicationName: "Victoria Zeder",
  authors: [{ name: "Victoria Zeder", url: "https://victoriazeder.com" }],
  creator: "Victoria Zeder",
  publisher: "Victoria Zeder",
  category: "art",
  keywords: [
    "Victoria Zeder",
    "Miami visual artist",
    "Dominican artist",
    "contemporary painter",
    "gold leaf painting",
    "biomorphic art",
    "Jungian expression",
    "mixed media artist",
    "encaustic",
    "Living Systems",
    "fine art Miami",
    "pareidolia painting",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    firstName: "Victoria",
    lastName: "Zeder",
    gender: "female",
    title: "Victoria Zeder — Visual Artist",
    description:
      "Miami-based visual artist. 24k gold leaf, acrylic ink, thread, encaustic. Living Systems (2026).",
    url: "https://victoriazeder.com",
    siteName: "Victoria Zeder",
    locale: "en_US",
    /* Dedicated 1200×630 JPG (~200KB) for social-scrape previews.
       Full-resolution PNG remains in /public for use in /contact + gallery. */
    images: [
      {
        url: "/victoria-portrait-og.jpg",
        width: 1200,
        height: 630,
        alt: "Victoria Zeder, visual artist based in Miami",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Victoria Zeder — Visual Artist",
    description:
      "Miami-based visual artist. 24k gold leaf, acrylic ink, thread, encaustic.",
    images: ["/victoria-portrait-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${montserrat.variable}`}>
      {/* suppressHydrationWarning: scoped to <body> only — neutralizes attributes
          injected by browser extensions (ColorZilla's cz-shortcut-listen,
          Grammarly's data-gr-*, Dark Reader, etc.) before React hydrates. */}
      <body
        className="font-sans text-ink antialiased bg-canvas"
        suppressHydrationWarning
      >
        {/* Skip-to-content — first focusable element; jumps past the identity
            panel straight into the scroll panel where the CV content lives. */}
        <a href="#cv-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
