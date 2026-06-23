import type { ReactNode } from "react";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  ChevronRight,
  Facebook,
  Instagram,
  MapPin,
  Ruler,
} from "lucide-react";
import { Link } from "wouter";
import {
  type DemoProperty,
  type PropertyOperation,
  getOperationLabel,
  getPropertyCoverImage,
  getStatusLabel,
  isPropertyRequestable,
} from "@/lib/realEstateDemo";

type PropertyCardProps = {
  property: DemoProperty;
  slug: string;
  logoUrl?: string | null;
  businessName?: string | null;
  instagram?: string | null;
  facebook?: string | null;
};

type Attr = { key: string; icon: ReactNode; primary: string; secondary: string };

function getOperationPriceLabel(operation: PropertyOperation): string {
  return operation === "sale" ? "Precio de venta" : "Precio de alquiler";
}

function buildAttrs(property: DemoProperty): Attr[] {
  const attrs: Attr[] = [];

  const area = property.areaM2 ?? property.coveredAreaM2 ?? null;
  if (area) {
    attrs.push({
      key: "area",
      icon: <Ruler className="h-5 w-5" />,
      primary: `${area} m²`,
      secondary: "Superficie",
    });
  }

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
    attrs.length === 3 ? "grid-cols-3" : attrs.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="mt-5 border-t border-[#ece6dd] pt-4">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`mx-auto grid ${colsClass} items-stretch`}>
          {attrs.map((attr, index) => (
            <div
              key={attr.key}
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-3 first:pl-0 last:pr-0"
            >
              {index > 0 ? (
                <span className="-ml-2 mr-1 h-9 w-px shrink-0 bg-[#ded8cc]" aria-hidden="true" />
              ) : (
                <span className="hidden" aria-hidden="true" />
              )}
              <div className="flex min-w-0 items-center justify-center gap-2">
                <span className="shrink-0 text-[#6a716f]">{attr.icon}</span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[0.86rem] font-semibold text-zinc-800">
                    {attr.primary}
                  </span>
                  <span className="block text-[0.72rem] font-medium text-[#465153]">
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

export function PropertyCard({
  property,
  slug,
  logoUrl,
  businessName,
  instagram,
  facebook,
}: PropertyCardProps) {
  const requestable = isPropertyRequestable(property);
  const coverImage = getPropertyCoverImage(property);
  const attrs = buildAttrs(property);

  const name = businessName?.trim() || null;
  const igUrl = instagram?.trim() || null;
  const fbUrl = facebook?.trim() || null;
  const hasIdentityStrip = Boolean(name);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(23,23,23,0.04)] transition hover:-translate-y-0.5 hover:border-[#bcb5aa] hover:shadow-[0_14px_34px_rgba(23,23,23,0.08)]">
      {/* Imagen */}
      <Link href={`/${slug}/propiedades/${property.id}`}>
        <div className="relative h-[210px] overflow-hidden bg-[#ece7dc]">
          <img
            src={coverImage}
            alt={property.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Cinta diagonal de operación — esquina superior izquierda */}
          <div className="pointer-events-none absolute left-0 top-0 h-[100px] w-[100px] overflow-hidden">
            <span className="absolute left-[-28px] top-[22px] block w-[140px] rotate-[-45deg] bg-[#12383d] py-2 text-center text-[9px] font-black uppercase tracking-[0.18em] text-white">
              {getOperationLabel(property.operation)}
            </span>
          </div>

          {/* Badge de estado — solo si no disponible */}
          {property.status !== "available" ? (
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-[#12383d]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-sm">
                {getStatusLabel(property.status)}
              </span>
            </div>
          ) : null}

          {/* Logo de inmobiliaria — cuadrado con fallback a inicial */}
          <div className="absolute bottom-3 left-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#d8d1c4] bg-[#fffdf8]/90 text-base font-bold text-[#12383d] shadow-[0_8px_20px_rgba(25,31,28,0.08)]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessName ?? ""}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span aria-hidden="true">{(businessName?.trim() || "I").charAt(0).toUpperCase()}</span>
              )}
            </span>
          </div>
        </div>
      </Link>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* Título */}
        <Link href={`/${slug}/propiedades/${property.id}`}>
          <h3 className="line-clamp-2 text-[1.15rem] font-bold leading-tight text-zinc-950 transition group-hover:text-zinc-700">
            {property.title}
          </h3>
        </Link>

        {/* Tipo de propiedad + Precio */}
        <div className="mt-2 flex items-start justify-between gap-3">
          <p className="text-[0.8rem] font-medium text-[#465153]">{property.propertyType}</p>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase leading-none tracking-wide text-[#465153]">
              {getOperationPriceLabel(property.operation)}
            </p>
            <p className="mt-0.5 text-lg font-black leading-tight text-zinc-950">
              {property.price}
            </p>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mt-1 flex items-center gap-1 text-[0.8rem] font-medium text-[#465153]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Descripción */}
        <p
          className="mt-4 min-h-[48px] flex-1 overflow-hidden text-[0.9rem] leading-6 text-[#3a3a3a]"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {property.description}
        </p>

        {/* Sección inferior */}
        <div className="mt-auto">
          <TechnicalAttrRow attrs={attrs} />

          {/* Botones */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades/${property.id}`} className="sm:flex-1">
              <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-[#12383d] px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#0f646a]">
                Ver ficha
                <ChevronRight className="h-4 w-4 shrink-0" />
              </span>
            </Link>
            {requestable ? (
              <Link href={`/${slug}/solicitar-visita/${property.id}`} className="sm:flex-1">
                <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-[#cfc7b8] bg-[#fffdf8] px-3 text-xs font-black uppercase tracking-[0.12em] text-[#12383d] transition hover:border-[#0f646a] hover:bg-[#eef4f2] hover:text-[#0f646a]">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  Solicitar visita
                </span>
              </Link>
            ) : (
              <span className="inline-flex h-11 w-full items-center justify-center rounded-[5px] border border-[#ded8cc] px-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6a716f] sm:flex-1">
                No disponible
              </span>
            )}
          </div>

          {/* Franja de identidad */}
          {hasIdentityStrip ? (
            <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe3] pt-3">
              <span className="truncate text-[11px] font-semibold text-[#3a3a3a]">{name}</span>
              {igUrl || fbUrl ? (
                <div className="ml-3 flex shrink-0 items-center gap-2.5">
                  {igUrl ? (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      className="text-[#6a716f] transition hover:text-[#12383d]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Instagram className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {fbUrl ? (
                    <a
                      href={fbUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="text-[#6a716f] transition hover:text-[#12383d]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Facebook className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
