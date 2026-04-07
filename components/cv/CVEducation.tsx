import type { EducationEntry } from "@/data/victoria-zeder";
import { CVSectionLabel } from "./CVSectionLabel";

interface CVEducationProps {
  education: EducationEntry[];
}

export function CVEducation({ education }: CVEducationProps) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <CVSectionLabel title="Education" />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {education.map((entry) => (
          <div key={entry.institution}>
            <p
              className="font-medium text-ink"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {entry.degree}
            </p>
            <p
              style={{
                fontSize: "11.5px",
                fontWeight: 400,
                color: "var(--color-secondary)",
                marginTop: "2px",
              }}
            >
              {entry.institution}, {entry.location}
            </p>
            {entry.details && (
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {entry.details.map((detail) => (
                  <p
                    key={detail}
                    style={{
                      fontSize: "11px",
                      fontWeight: 400,
                      color: "var(--color-secondary)",
                      paddingLeft: "12px",
                      position: "relative",
                      opacity: 0.75,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "var(--color-divider)",
                      }}
                    >
                      &ndash;
                    </span>
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
