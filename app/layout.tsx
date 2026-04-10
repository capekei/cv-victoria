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
  title: "Victoria Zeder · Artist CV",
  description: "Victoria Zeder is a Miami-based visual artist working with gold leaf and line.",
  metadataBase: new URL("https://victoriazeder.com"),
  openGraph: {
    title: "Victoria Zeder · Artist CV",
    description: "Miami-based visual artist working with gold leaf and line.",
    url: "https://victoriazeder.com",
    siteName: "Victoria Zeder",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${montserrat.variable}`}
      style={{ margin: 0, padding: 0, height: "100%", overflow: "hidden", overscrollBehavior: "none" }}
    >
      <body
        className="font-sans text-ink antialiased bg-canvas"
        style={{ margin: 0, padding: 0, height: "100%", overflow: "hidden", overscrollBehavior: "none" }}
      >
        {children}
      </body>
    </html>
  );
}
