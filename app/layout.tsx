import type { Metadata } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
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
    images: [
      {
        url: "/victoria-portrait.png",
        width: 1728,
        height: 2304,
        alt: "Victoria Zeder, visual artist based in Miami",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Victoria Zeder — Visual Artist",
    description:
      "Miami-based visual artist. 24k gold leaf, acrylic ink, thread, encaustic.",
    images: ["/victoria-portrait.png"],
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
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${montserrat.variable}`}>
      <body className="font-sans text-ink antialiased bg-canvas">
        {children}
      </body>
    </html>
  );
}
