import type { ContactInfo } from "@/app/artist";

interface ContactProps {
  contact: ContactInfo;
}

export function Contact({ contact }: ContactProps) {
  const linkStyle = {
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
  } as const;

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
        <span className="hover-underline">{contact.location}</span>
        <a href={`mailto:${contact.email}`} className="hover-underline" style={linkStyle}>{contact.email}</a>
        <a href={`https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="hover-underline" style={linkStyle}>{contact.website}</a>
        <a href={`https://instagram.com/${contact.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover-underline" style={linkStyle}>{contact.instagram}</a>
      </div>
    </footer>
  );
}
