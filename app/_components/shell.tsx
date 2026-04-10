"use client";

interface ShellProps {
  identity: React.ReactNode;
  children: React.ReactNode;
}

export function Shell({ identity, children }: ShellProps) {
  return (
    <div
      className="cv-shell-container"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        backgroundColor: "var(--color-cream)",
        overflow: "hidden",
        overscrollBehavior: "none",
      }}
    >
      <div className="noise-overlay" />
      {identity}
      {children}
    </div>
  );
}
