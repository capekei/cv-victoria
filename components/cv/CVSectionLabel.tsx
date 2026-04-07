interface CVSectionLabelProps {
  title: string;
}

export function CVSectionLabel({ title }: CVSectionLabelProps) {
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
