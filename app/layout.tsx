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
  title: "Victoria Zeder — Artist CV",
  description: "Artist CV — Victoria Zeder, Miami-based visual artist working with gold leaf and line.",
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
