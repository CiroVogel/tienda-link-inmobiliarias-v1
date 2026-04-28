import { Bath, BedDouble, Building2, MapPin, Ruler, Tag } from "lucide-react";
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

  return (
    <article className="group overflow-hidden border border-zinc-200 bg-white">
      <Link href={`/${slug}/propiedades/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
            src={coverImage}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-950 shadow-sm">
              {getOperationLabel(property.operation)}
            </span>

            {property.status !== "available" ? (
              <span className="bg-zinc-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
                {getStatusLabel(property.status)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              {property.location}
            </p>
            <Link href={`/${slug}/propiedades/${property.id}`}>
              <h3 className="text-xl font-black leading-tight tracking-tight text-zinc-950 transition group-hover:text-zinc-700">
                {property.title}
              </h3>
            </Link>
          </div>

          <p className="shrink-0 text-right text-lg font-black text-zinc-950">
            {property.price}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-xs text-zinc-500 sm:grid-cols-4">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {property.propertyType}
          </span>
          {property.bedrooms ? (
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} dorm.
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms} bano
            </span>
          ) : null}
          {property.areaM2 ? (
            <span className="flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" />
              {property.areaM2} m²
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
          <Link href={`/${slug}/propiedades/${property.id}`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-950">
              Ver ficha
              <Tag className="h-3.5 w-3.5" />
            </span>
          </Link>

          {requestable ? (
            <Link href={`/${slug}/solicitar-visita/${property.id}`}>
              <span className="bg-zinc-950 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800">
                Solicitar visita
              </span>
            </Link>
          ) : (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              No solicitable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

