"use client";

interface CVShellProps {
  identity: React.ReactNode;
  children: React.ReactNode;
}

export function CVShell({ identity, children }: CVShellProps) {
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
