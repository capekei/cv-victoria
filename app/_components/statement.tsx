import { SectionLabel } from "./section-label";

interface StatementProps {
  paragraphs: string[];
}

export function Statement({ paragraphs }: StatementProps) {
  return (
    <section className="mb-10">
      <SectionLabel title="Statement" />

      <p className="font-serif italic text-ink text-[17px] leading-[1.65] font-normal mb-3.5">
        {paragraphs[0]}
      </p>
      {paragraphs.slice(1).map((p, i) => (
        <p
          key={i}
          className={`text-[12.5px] leading-[1.85] font-normal text-secondary ${
            i < paragraphs.length - 2 ? "mb-2.5" : ""
          }`}
        >
          {p}
        </p>
      ))}
    </section>
  );
}
