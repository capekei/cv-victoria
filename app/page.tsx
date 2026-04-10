import { victoriaZeder } from "@/data/victoria-zeder";
import { CVShell } from "@/components/cv/CVShell";
import { CVIdentity } from "@/components/cv/CVIdentity";
import { CVScrollPanel } from "@/components/cv/CVScrollPanel";
import { CVStatement } from "@/components/cv/CVStatement";
import { CVExhibitions } from "@/components/cv/CVExhibitions";
import { CVEducation } from "@/components/cv/CVEducation";
import { CVContact } from "@/components/cv/CVContact";
import { CVGallery } from "@/components/cv/CVGallery";
import { CVProcess } from "@/components/cv/CVProcess";
import { CVReveal } from "@/components/cv/CVReveal";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Victoria Zeder · Artist CV",
};

export default function CVPage() {
  const cv = victoriaZeder;

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
        {/* 1. Voice — who she is and what the work is about */}
        <CVReveal>
          <CVStatement paragraphs={cv.statementFull} />
        </CVReveal>

        {/* 2. The work itself */}
        <CVGallery pieces={cv.gallery} />

        {/* 3. How it's made */}
        <CVProcess steps={cv.process} />

        {/* 4. Where it's shown */}
        <CVExhibitions exhibitions={cv.exhibitions} />

        {/* 5. Credentials */}
        <CVReveal>
          <CVEducation education={cv.education} />
        </CVReveal>

        {/* 6. How to reach her */}
        <CVReveal>
          <CVContact contact={cv.contact} />
        </CVReveal>
      </CVScrollPanel>
    </CVShell>
  );
}
