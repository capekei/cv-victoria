import { SectionLabel } from "./section-label";

interface StatementProps {
  paragraphs: string[];
}

export function Statement({ paragraphs }: StatementProps) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <SectionLabel title="Statement" />

      <p
        className="font-serif italic text-ink"
        style={{
          fontSize: "17px",
          lineHeight: "1.65",
          fontWeight: 400,
          marginBottom: "14px",
        }}
      >
        {paragraphs[0]}
      </p>
      {paragraphs.slice(1).map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: "12.5px",
            lineHeight: "1.85",
            fontWeight: 400,
            color: "var(--color-secondary)",
            marginBottom: i < paragraphs.length - 2 ? "10px" : "0",
          }}
        >
          {p}
        </p>
      ))}
    </section>
  );
}
