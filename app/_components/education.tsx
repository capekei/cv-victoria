import type { EducationEntry } from "@/app/_lib/artist";
import { SectionLabel } from "./section-label";

interface EducationProps {
  education: EducationEntry[];
}

export function Education({ education }: EducationProps) {
  return (
    <section className="mb-10">
      <SectionLabel title="Education" />
      <div className="flex flex-col gap-4">
        {education.map((entry) => (
          <div key={entry.institution}>
            <p className="font-medium text-ink text-[13px]">{entry.degree}</p>
            <p className="text-[11.5px] font-normal text-secondary mt-0.5">
              {entry.institution}, {entry.location}
            </p>
            {entry.details && (
              <div className="mt-1.5 flex flex-col gap-0.5">
                {entry.details.map((detail) => (
                  <p
                    key={detail}
                    className="text-[11px] font-normal text-secondary pl-3 relative opacity-75"
                  >
                    <span className="absolute left-0 text-divider">&ndash;</span>
                    {detail}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
