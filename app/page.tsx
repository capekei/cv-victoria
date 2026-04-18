import type { Metadata } from "next";
import { victoriaZeder } from "@/app/_lib/artist";
import { Shell } from "./_components/shell";
import { Identity } from "./_components/identity";
import { ScrollPanel } from "./_components/scroll-panel";
import { Reveal } from "./_components/reveal";
import { Statement } from "./_components/statement";
import { Gallery } from "./_components/gallery";
import { Process } from "./_components/process";
import { Exhibitions } from "./_components/exhibitions";
import { Education } from "./_components/education";
import { Contact } from "./_components/contact-cta";
import { buildPersonGraph, safeJsonLd } from "./_lib/jsonld";

export const metadata: Metadata = {
  title: "Victoria Zeder — Visual Artist, Miami",
  description:
    "Formally trained visual artist based in Miami, working with 24k gold leaf, acrylic ink, thread, and encaustic. Current series: Living Systems (2026). Born in the Dominican Republic, 1991.",
  alternates: { canonical: "/" },
};

export default function Page() {
  const cv = victoriaZeder;
  const jsonLd = safeJsonLd(buildPersonGraph());

  return (
    <>
      {/* GEO: rich JSON-LD @graph — all data hardcoded from app/artist.ts,
          passed through safeJsonLd() which escapes < and script terminators. */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Shell
        identity={<Identity name={cv.name} discipline={cv.discipline} contact={cv.contact} />}
      >
        <ScrollPanel>
          {/* 1. Voice */}
          <Reveal>
            <Statement paragraphs={cv.statementFull} />
          </Reveal>

          {/* 2. The work */}
          <Reveal>
            <Gallery pieces={cv.gallery} />
          </Reveal>

          {/* 3. How it's made — staggered vertical cascade of process steps */}
          <Reveal stagger className="cv-stagger-y">
            <Process steps={cv.process} />
          </Reveal>

          {/* 4. Where it's shown — horizontal stagger across upcoming + selected */}
          <Reveal stagger>
            <Exhibitions exhibitions={cv.exhibitions} />
          </Reveal>

          {/* 5. Credentials */}
          <Reveal>
            <Education education={cv.education} />
          </Reveal>

          {/* 6. How to reach her */}
          <Reveal>
            <Contact contact={cv.contact} />
          </Reveal>
        </ScrollPanel>
      </Shell>
    </>
  );
}
