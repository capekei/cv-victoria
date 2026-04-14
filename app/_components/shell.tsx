"use client";

interface ShellProps {
  identity: React.ReactNode;
  children: React.ReactNode;
}

export function Shell({ identity, children }: ShellProps) {
  return (
    <div className="cv-shell-container">
      <div className="noise-overlay" />
      {identity}
      {children}
    </div>
  );
}
