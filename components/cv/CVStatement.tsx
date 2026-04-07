interface CVStatementProps {
  paragraphs: string[];
}

export function CVStatement({ paragraphs }: CVStatementProps) {
  return (
    <section style={{ marginBottom: "40px" }}>
      {/* Section label */}
      <SectionHead title="Statement" />

      <p
        className="font-serif italic text-ink"
        style={{
          fontSize: "16px",
          lineHeight: "1.65",
          marginBottom: "14px",
        }}
      >
        {paragraphs[0]}
      </p>
      {paragraphs.slice(1).map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: "11.5px",
            lineHeight: "1.85",
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

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9px",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
          color: "var(--color-accent)",
          marginBottom: "10px",
        }}
      >
        {title}
      </h2>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--color-divider)",
        }}
      />
    </div>
  );
}
