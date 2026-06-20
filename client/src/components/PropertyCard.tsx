import type { ReactNode } from "react";
import { Bath, BedDouble, Car, MapPin, Ruler, Tag } from "lucide-react";
import { Link } from "wouter";
import {
  type DemoProperty,
  getOperationLabel,
  getPropertyCoverImage,
  getStatusLabel,
  isPropertyRequestable,
} from "@/lib/realEstateDemo";

type PropertyCardProps = {
  property: DemoProperty;
  slug: string;
};

type Attr = { key: string; icon: ReactNode; primary: string; secondary: string };

function buildAttrs(property: DemoProperty): Attr[] {
  const attrs: Attr[] = [];

  // Slot 1: Superficie — areaM2 con fallback a coveredAreaM2
  const area = property.areaM2 ?? property.coveredAreaM2 ?? null;
  if (area) {
    attrs.push({
      key: "area",
      icon: <Ruler className="h-5 w-5" />,
      primary: `${area} m²`,
      secondary: property.areaM2 ? "Superficie" : "Sup. cubierta",
    });
  }

  // Slot 2: Dormitorios con fallback a ambientes
  if (property.bedrooms) {
    attrs.push({
      key: "beds",
      icon: <BedDouble className="h-5 w-5" />,
      primary: String(property.bedrooms),
      secondary: property.bedrooms === 1 ? "Dormitorio" : "Dormitorios",
    });
  } else if (property.rooms) {
    attrs.push({
      key: "rooms",
      icon: <BedDouble className="h-5 w-5" />,
      primary: String(property.rooms),
      secondary: property.rooms === 1 ? "Ambiente" : "Ambientes",
    });
  }

  // Slot 3: Baños con fallback a cocheras
  if (property.bathrooms) {
    attrs.push({
      key: "baths",
      icon: <Bath className="h-5 w-5" />,
      primary: String(property.bathrooms),
      secondary: property.bathrooms === 1 ? "Baño" : "Baños",
    });
  } else if (property.garages) {
    attrs.push({
      key: "garages",
      icon: <Car className="h-5 w-5" />,
      primary: String(property.garages),
      secondary: property.garages === 1 ? "Cochera" : "Cocheras",
    });
  }

  return attrs;
}

function TechnicalAttrRow({ attrs }: { attrs: Attr[] }) {
  if (!attrs.length) return null;

  const colsClass =
    attrs.length >= 3 ? "grid-cols-3" : attrs.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="mt-5 border-t border-zinc-200 pt-4">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`mx-auto grid ${colsClass} items-stretch text-zinc-700`}>
          {attrs.map((attr, index) => (
            <div
              key={attr.key}
              className="grid grid-cols-[auto_1fr] items-center gap-2.5 px-3 first:pl-0 last:pr-0"
            >
              {index > 0 ? (
                <span className="-ml-2 mr-1 h-9 w-px shrink-0 bg-zinc-200" aria-hidden="true" />
              ) : (
                <span className="hidden" aria-hidden="true" />
              )}
              <div className="flex min-w-0 items-center justify-center gap-2.5">
                <span className="shrink-0 text-zinc-500">{attr.icon}</span>
                <span className="min-w-0 leading-tight">
                  <span className="block whitespace-normal text-[0.86rem] font-semibold text-zinc-800">
                    {attr.primary}
                  </span>
                  <span className="block whitespace-normal break-words text-[0.72rem] font-medium text-zinc-500">
                    {attr.secondary}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PropertyCard({ property, slug }: PropertyCardProps) {
  const requestable = isPropertyRequestable(property);
  const coverImage = getPropertyCoverImage(property);
  const attrs = buildAttrs(property);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(23,23,23,0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_34px_rgba(23,23,23,0.08)]">
      {/* Imagen con badges de operación y estado */}
      <Link href={`/${slug}/propiedades/${property.id}`}>
        <div className="relative h-[210px] overflow-hidden bg-zinc-100">
          <img
            src={coverImage}
            alt={property.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* Título */}
        <Link href={`/${slug}/propiedades/${property.id}`}>
          <h3 className="font-bold text-[1.35rem] leading-tight text-zinc-950 transition group-hover:text-zinc-700">
            {property.title}
          </h3>
        </Link>

        {/* Tipo · Ubicación en una sola línea secundaria */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-medium text-zinc-500">
          <span>{property.propertyType}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {property.location}
          </span>
        </div>

        {/* Precio */}
        <p className="mt-2 text-lg font-black text-zinc-950">{property.price}</p>

        {/* Chips de características — máximo 3, después del precio */}
        {property.features.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-[4px] border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        {/* Descripción — flex-1 mantiene alineación entre cards de distinta altura */}
        <p
          className="mt-4 min-h-[72px] flex-1 overflow-hidden text-[0.96rem] leading-6 text-zinc-700"
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
        >
          {property.description}
        </p>

        {/* Sección inferior: atributos + botones empujados al final */}
        <div className="mt-auto">
          <TechnicalAttrRow attrs={attrs} />

          {/* Botones — apilados en mobile, lado a lado en sm+ */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades/${property.id}`} className="sm:flex-1">
              <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-zinc-950 px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-zinc-800">
                Ver ficha
                <Tag className="h-3.5 w-3.5 shrink-0" />
              </span>
            </Link>
            {requestable ? (
              <Link href={`/${slug}/solicitar-visita/${property.id}`} className="sm:flex-1">
                <span className="inline-flex h-11 w-full items-center justify-center rounded-[5px] border border-zinc-300 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:border-zinc-400">
                  Solicitar visita
                </span>
              </Link>
            ) : (
              <span className="inline-flex h-11 w-full items-center justify-center rounded-[5px] border border-zinc-200 px-3 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 sm:flex-1">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
