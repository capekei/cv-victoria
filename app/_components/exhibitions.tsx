import type { Exhibition } from "@/app/artist";
import { SectionLabel } from "./section-label";

interface ExhibitionsProps {
  exhibitions: Exhibition[];
}

export function Exhibitions({ exhibitions }: ExhibitionsProps) {
  const upcoming = exhibitions.filter((e) => e.type === "upcoming");
  const selected = exhibitions.filter((e) => e.type === "selected");

  /* Continuous stagger index across both groups so the reveal reads as
     one gesture (upcoming → selected), not two separate sequences. */
  let staggerIndex = 0;

  return (
    <section style={{ marginBottom: "40px" }}>
      <SectionLabel title="Exhibitions" />

      {upcoming.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "#7BA7D4",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Upcoming
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {upcoming.map((e) => (
              <ExhibitionRow
                key={`${e.year}-${e.title}`}
                exhibition={e}
                index={staggerIndex++}
              />
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "var(--color-secondary)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Selected
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {selected.map((e) => (
              <ExhibitionRow
                key={`${e.year}-${e.title}`}
                exhibition={e}
                index={staggerIndex++}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ExhibitionRow({
  exhibition,
  index,
}: {
  exhibition: Exhibition;
  index: number;
}) {
  const title = exhibition.url ? (
    <a
      href={exhibition.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover-underline"
      style={{
        fontSize: "13px",
        fontWeight: 500,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {exhibition.title}
    </a>
  ) : (
    <span style={{ fontSize: "13px", fontWeight: 500 }}>
      {exhibition.title}
    </span>
  );

  return (
    <div
      className="cv-stagger-item"
      style={{
        width: "100%",
        cursor: exhibition.url ? "pointer" : "default",
        marginBottom: "2px",
        ["--stagger-i" as string]: index,
      } as React.CSSProperties}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        {title}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 400,
            color: "var(--color-secondary)",
            letterSpacing: "0.02em",
            flexShrink: 0,
            marginLeft: "16px",
          }}
        >
          {exhibition.location}, {exhibition.year}
        </span>
      </div>
      {(exhibition.dates || exhibition.gallery) && (
        <p
          style={{
            fontSize: "10.5px",
            color: "var(--color-secondary)",
            marginTop: "2px",
            opacity: 0.75,
          }}
        >
          {exhibition.dates}{exhibition.dates && exhibition.gallery ? " · " : ""}{exhibition.gallery}
        </p>
      )}
    </div>
  );
}
