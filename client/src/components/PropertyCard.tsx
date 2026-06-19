import { Bath, BedDouble, MapPin, Ruler, Tag } from "lucide-react";
import { Link } from "wouter";
import {
  DemoProperty,
  getPropertyCoverImage,
  getOperationLabel,
  getStatusLabel,
  isPropertyRequestable,
} from "@/lib/realEstateDemo";

type PropertyCardProps = {
  property: DemoProperty;
  slug: string;
};

export function PropertyCard({ property, slug }: PropertyCardProps) {
  const requestable = isPropertyRequestable(property);
  const coverImage = getPropertyCoverImage(property);

  const area = property.areaM2 ?? property.coveredAreaM2 ?? null;
  const bed = property.bedrooms || property.rooms || null;
  const bedLabel =
    property.bedrooms
      ? property.bedrooms === 1
        ? "dormitorio"
        : "dormitorios"
      : property.rooms === 1
        ? "ambiente"
        : "ambientes";
  const bath = property.bathrooms || null;

  const attrCount = [area, bed, bath].filter(Boolean).length;
  const attrGridCols =
    attrCount >= 3 ? "grid-cols-3" : attrCount === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(23,23,23,0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_34px_rgba(23,23,23,0.08)]">
      <Link href={`/${slug}/propiedades/${property.id}`}>
        <div className="relative h-[210px] overflow-hidden bg-zinc-100">
          <img
            src={coverImage}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-[5px] bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-950 shadow-sm">
              {getOperationLabel(property.operation)}
            </span>
            {property.status !== "available" ? (
              <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-sm">
                {getStatusLabel(property.status)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.location}
        </p>

        <Link href={`/${slug}/propiedades/${property.id}`}>
          <h3 className="font-bold text-[1.15rem] leading-tight tracking-tight text-zinc-950 transition group-hover:text-zinc-700">
            {property.title}
          </h3>
        </Link>

        <p className="mt-1 text-xs font-medium text-zinc-400">{property.propertyType}</p>
        <p className="mt-3 text-xl font-black text-zinc-950">{property.price}</p>

        {attrCount > 0 ? (
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <div className={`grid ${attrGridCols} divide-x divide-zinc-200 text-center`}>
              {area ? (
                <div className="flex flex-col items-center gap-1 px-2 first:pl-0 last:pr-0">
                  <Ruler className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-bold leading-none text-zinc-950">{area} m²</span>
                  <span className="text-[11px] leading-none text-zinc-500">superficie</span>
                </div>
              ) : null}
              {bed ? (
                <div className="flex flex-col items-center gap-1 px-2 first:pl-0 last:pr-0">
                  <BedDouble className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-bold leading-none text-zinc-950">{bed}</span>
                  <span className="text-[11px] leading-none text-zinc-500">{bedLabel}</span>
                </div>
              ) : null}
              {bath ? (
                <div className="flex flex-col items-center gap-1 px-2 first:pl-0 last:pr-0">
                  <Bath className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-bold leading-none text-zinc-950">{bath}</span>
                  <span className="text-[11px] leading-none text-zinc-500">
                    {bath === 1 ? "baño" : "baños"}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
          <Link href={`/${slug}/propiedades/${property.id}`} className="sm:flex-1">
            <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] bg-zinc-950 px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-zinc-800">
              Ver ficha
              <Tag className="h-3.5 w-3.5" />
            </span>
          </Link>
          {requestable ? (
            <Link href={`/${slug}/solicitar-visita/${property.id}`} className="sm:flex-1">
              <span className="inline-flex h-10 w-full items-center justify-center rounded-[5px] border border-zinc-300 bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:border-zinc-400">
                Solicitar visita
              </span>
            </Link>
          ) : (
            <span className="inline-flex h-10 flex-1 items-center justify-center rounded-[5px] border border-zinc-200 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
              No disponible
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
