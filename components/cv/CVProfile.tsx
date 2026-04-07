import { CVSectionLabel } from "./CVSectionLabel";

interface CVProfileProps {
  text: string;
}

export function CVProfile({ text }: CVProfileProps) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <CVSectionLabel title="Profile" />
      <p
        style={{
          fontSize: "11px",
          lineHeight: "1.85",
          color: "var(--color-secondary)",
        }}
      >
        {text}
      </p>
    </section>
  );
}
