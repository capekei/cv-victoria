/**
 * Minimal scroll indicator — "Scroll" text + gradient accent line.
 * Pure CSS animation, no JS needed.
 */
export function ScrollIndicator() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        animation: "contact-pulse 2s ease-in-out infinite",
      }}
    >
      <span
        className="font-sans"
        style={{
          fontSize: "8px",
          fontWeight: 500,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        Scroll
      </span>
      <div
        style={{
          width: "1px",
          height: "24px",
          background:
            "linear-gradient(to bottom, var(--color-accent), transparent)",
        }}
      />
    </div>
  );
}
