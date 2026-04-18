interface SectionLabelProps {
  title: string;
}

export function SectionLabel({ title }: SectionLabelProps) {
  return (
    <div className="mb-5">
      <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-accent mb-2.5">
        {title}
      </h2>
      <hr className="border-0 border-t border-divider" />
    </div>
  );
}
