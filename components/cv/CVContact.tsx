import type { ContactInfo } from "@/data/victoria-zeder";

interface CVContactProps {
  contact: ContactInfo;
}

export function CVContact({ contact }: CVContactProps) {
  return (
    <footer style={{ paddingTop: "4px" }}>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--color-divider)",
          marginBottom: "16px",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "20px",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--color-secondary)",
          letterSpacing: "0.01em",
        }}
      >
        <span className="hover-underline" style={{ cursor: "pointer" }}>{contact.location}</span>
        <span className="hover-underline" style={{ cursor: "pointer" }}>{contact.email}</span>
        <span className="hover-underline" style={{ cursor: "pointer" }}>{contact.website}</span>
        <span className="hover-underline" style={{ cursor: "pointer" }}>{contact.instagram}</span>
      </div>
    </footer>
  );
}
