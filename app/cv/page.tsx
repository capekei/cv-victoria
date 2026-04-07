import { victoriaZeder } from "@/data/victoria-zeder";
import { CVShell } from "@/components/cv/CVShell";
import { CVIdentity } from "@/components/cv/CVIdentity";
import { CVScrollPanel } from "@/components/cv/CVScrollPanel";
import { CVStatement } from "@/components/cv/CVStatement";
import { CVFeaturedWork } from "@/components/cv/CVFeaturedWork";
import { CVWorks } from "@/components/cv/CVWorks";
import { CVExhibitions } from "@/components/cv/CVExhibitions";
import { CVEducation } from "@/components/cv/CVEducation";
import { CVProfile } from "@/components/cv/CVProfile";
import { CVContact } from "@/components/cv/CVContact";
import { CVGallery } from "@/components/cv/CVGallery";
import { CVReveal } from "@/components/cv/CVReveal";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Victoria Zeder — Artist CV",
};

export default function CVPage() {
  const cv = victoriaZeder;
  const featured = cv.selectedWorks[0];

  return (
    <CVShell
      identity={
        <CVIdentity
          name={cv.name}
          discipline={cv.discipline}
          contact={cv.contact}
        />
      }
    >
      <CVScrollPanel>
        {/* Artist Statement */}
        <CVReveal>
          <CVStatement paragraphs={cv.statementFull} />
        </CVReveal>

        {/* Featured artwork */}
        <CVFeaturedWork
          title={featured.title}
          year={featured.year}
          medium={featured.medium}
          dimensions={featured.dimensions}
        />

        {/* Gallery — inline paintings strip */}
        <CVGallery pieces={cv.gallery} />

        {/* Remaining selected works */}
        <CVWorks works={cv.selectedWorks.slice(1)} />

        {/* Exhibitions */}
        <CVExhibitions exhibitions={cv.exhibitions} />

        {/* Education */}
        <CVReveal>
          <CVEducation education={cv.education} />
        </CVReveal>

        {/* Professional Profile */}
        <CVReveal>
          <CVProfile text={cv.professionalProfile} />
        </CVReveal>

        {/* Contact footer */}
        <CVReveal>
          <CVContact contact={cv.contact} />
        </CVReveal>
      </CVScrollPanel>
    </CVShell>
  );
}
