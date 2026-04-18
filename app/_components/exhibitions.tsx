import type { Exhibition } from "@/app/_lib/artist";
import { SectionLabel } from "./section-label";

interface ExhibitionsProps {
  exhibitions: Exhibition[];
}

export function Exhibitions({ exhibitions }: ExhibitionsProps) {
  const upcoming = exhibitions.filter((e) => e.type === "upcoming");
  const selected = exhibitions.filter((e) => e.type === "selected");

  /* Continuous stagger index across both groups so the reveal reads as
     one gesture (upcoming → selected), not two separate sequences. */
  let staggerIndex = 0;

  return (
    <section className="mb-10">
      <SectionLabel title="Exhibitions" />

      {upcoming.length > 0 && (
        <div className="mb-4">
          <span className="block text-[9.5px] font-semibold uppercase tracking-[0.15em] text-[#7BA7D4] mb-2">
            Upcoming
          </span>
          <div className="flex flex-col gap-[5px]">
            {upcoming.map((e) => (
              <ExhibitionRow
                key={`${e.year}-${e.title}`}
                exhibition={e}
                index={staggerIndex++}
              />
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <span className="block text-[9.5px] font-semibold uppercase tracking-[0.15em] text-secondary mb-2">
            Selected
          </span>
          <div className="flex flex-col gap-[5px]">
            {selected.map((e) => (
              <ExhibitionRow
                key={`${e.year}-${e.title}`}
                exhibition={e}
                index={staggerIndex++}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ExhibitionRow({
  exhibition,
  index,
}: {
  exhibition: Exhibition;
  index: number;
}) {
  const title = exhibition.url ? (
    <a
      href={exhibition.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover-underline text-[13px] font-medium text-inherit no-underline"
    >
      {exhibition.title}
    </a>
  ) : (
    <span className="text-[13px] font-medium">{exhibition.title}</span>
  );

  return (
    <div
      className={`cv-stagger-item w-full mb-0.5 ${exhibition.url ? "cursor-pointer" : "cursor-default"}`}
      style={{ ["--stagger-i" as string]: index } as React.CSSProperties}
    >
      <div className="flex justify-between items-baseline">
        {title}
        <span className="text-[11px] font-normal text-secondary tracking-[0.02em] shrink-0 ml-4">
          {exhibition.location}, {exhibition.year}
        </span>
      </div>
      {(exhibition.dates || exhibition.gallery) && (
        <p className="text-[10.5px] text-secondary mt-0.5 opacity-75">
          {exhibition.dates}
          {exhibition.dates && exhibition.gallery ? " · " : ""}
          {exhibition.gallery}
        </p>
      )}
    </div>
  );
}
