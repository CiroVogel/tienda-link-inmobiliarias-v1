import { Bath, BedDouble, Car, MapPin, Ruler, Tag } from "lucide-react";
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

type Attr = { key: string; icon: React.ReactNode; primary: string; secondary: string };

function buildAttrs(property: DemoProperty): Attr[] {
  const attrs: Attr[] = [];

  // Superficie: priorizar areaM2, fallback coveredAreaM2
  const area = property.areaM2 ?? property.coveredAreaM2 ?? null;
  if (area) {
    attrs.push({
      key: "area",
      icon: <Ruler className="h-4 w-4 text-zinc-400" />,
      primary: `${area} m²`,
      secondary: property.areaM2 ? "superficie" : "sup. cubierta",
    });
  }

  // Dormitorios o ambientes (solo residencial/mixto)
  if (property.bedrooms) {
    attrs.push({
      key: "beds",
      icon: <BedDouble className="h-4 w-4 text-zinc-400" />,
      primary: String(property.bedrooms),
      secondary: property.bedrooms === 1 ? "dormitorio" : "dormitorios",
    });
  } else if (property.rooms) {
    attrs.push({
      key: "rooms",
      icon: <BedDouble className="h-4 w-4 text-zinc-400" />,
      primary: String(property.rooms),
      secondary: property.rooms === 1 ? "ambiente" : "ambientes",
    });
  }

  // Baños
  if (property.bathrooms) {
    attrs.push({
      key: "baths",
      icon: <Bath className="h-4 w-4 text-zinc-400" />,
      primary: String(property.bathrooms),
      secondary: property.bathrooms === 1 ? "baño" : "baños",
    });
  }

  // Cochera — rellena slot si hay espacio (lotes, dúplex, casas)
  if (attrs.length < 3 && property.garages) {
    attrs.push({
      key: "garages",
      icon: <Car className="h-4 w-4 text-zinc-400" />,
      primary: String(property.garages),
      secondary: property.garages === 1 ? "cochera" : "cocheras",
    });
  }

  return attrs.slice(0, 3);
}

export function PropertyCard({ property, slug }: PropertyCardProps) {
  const requestable = isPropertyRequestable(property);
  const coverImage = getPropertyCoverImage(property);
  const attrs = buildAttrs(property);
  const attrGridCols =
    attrs.length >= 3 ? "grid-cols-3" : attrs.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(23,23,23,0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_34px_rgba(23,23,23,0.08)]">
      {/* Imagen con badges */}
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

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* Ubicación */}
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.location}
        </p>

        {/* Título */}
        <Link href={`/${slug}/propiedades/${property.id}`}>
          <h3 className="font-bold text-[1.15rem] leading-tight tracking-tight text-zinc-950 transition group-hover:text-zinc-700">
            {property.title}
          </h3>
        </Link>

        {/* Tipo + precio en fila */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="text-xs font-medium text-zinc-400">{property.propertyType}</p>
          <p className="shrink-0 text-lg font-black text-zinc-950">{property.price}</p>
        </div>

        {/* Descripción — flex-1 para igualar altura entre cards */}
        {property.description ? (
          <p
            className="mt-3 min-h-[48px] flex-1 overflow-hidden text-[0.875rem] leading-[1.65] text-zinc-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {property.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Chips de características — máximo 3 */}
        {property.features.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-[4px] border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-600"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        {/* Sección inferior: atributos + botones */}
        <div className="mt-auto">
          {attrs.length > 0 ? (
            <div className="mt-4 border-t border-zinc-100 pt-3">
              <div className={`grid ${attrGridCols} divide-x divide-zinc-200 text-center`}>
                {attrs.map((attr) => (
                  <div key={attr.key} className="flex flex-col items-center gap-1 px-2 first:pl-0 last:pr-0">
                    {attr.icon}
                    <span className="text-sm font-bold leading-none text-zinc-950">{attr.primary}</span>
                    <span className="text-[11px] leading-none text-zinc-500">{attr.secondary}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Botones — siempre en fila, whitespace-nowrap en "Solicitar visita" */}
          <div className="mt-4 flex gap-2">
            <Link href={`/${slug}/propiedades/${property.id}`} className="min-w-0 flex-1">
              <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] bg-zinc-950 px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-zinc-800">
                Ver ficha
                <Tag className="h-3.5 w-3.5 shrink-0" />
              </span>
            </Link>
            {requestable ? (
              <Link href={`/${slug}/solicitar-visita/${property.id}`} className="shrink-0">
                <span className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[5px] border border-zinc-300 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:border-zinc-400">
                  Solicitar visita
                </span>
              </Link>
            ) : (
              <span className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[5px] border border-zinc-200 px-3 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
