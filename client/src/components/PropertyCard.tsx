import { Fragment } from "react";
import type { ReactNode } from "react";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
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
};

type Attr = { key: string; icon: ReactNode; primary: string; secondary: string };

function getOperationPriceLabel(operation: PropertyOperation): string {
  return operation === "sale" ? "Precio de venta" : "Precio de alquiler";
}

function buildAttrs(property: DemoProperty): Attr[] {
  const attrs: Attr[] = [];

  // Slot 1: Superficie
  const area = property.areaM2 ?? property.coveredAreaM2 ?? null;
  if (area) {
    attrs.push({
      key: "area",
      icon: <Ruler className="h-5 w-5" />,
      primary: `${area} m²`,
      secondary: "Superficie",
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

  // Slot 3: Baños (independiente de cocheras)
  if (property.bathrooms) {
    attrs.push({
      key: "baths",
      icon: <Bath className="h-5 w-5" />,
      primary: String(property.bathrooms),
      secondary: property.bathrooms === 1 ? "Baño" : "Baños",
    });
  }

  // Slot 4: Cocheras (slot independiente)
  if (property.garages) {
    attrs.push({
      key: "garages",
      icon: <Car className="h-5 w-5" />,
      primary: String(property.garages),
      secondary: property.garages === 1 ? "Cochera" : "Cocheras",
    });
  }

  return attrs;
}

function buildStrip(property: DemoProperty): string[] {
  const source =
    property.detailedFeatures && property.detailedFeatures.length > 0
      ? property.detailedFeatures
      : property.features;
  return Array.from(new Set(source)).slice(0, 2);
}

function TechnicalAttrRow({ attrs }: { attrs: Attr[] }) {
  if (!attrs.length) return null;

  const colsClass =
    attrs.length === 4
      ? "grid-cols-4"
      : attrs.length === 3
        ? "grid-cols-3"
        : attrs.length === 2
          ? "grid-cols-2"
          : "grid-cols-1";

  return (
    <div className="mt-5 border-t border-zinc-200 pt-4">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`mx-auto grid ${colsClass} items-stretch`}>
          {attrs.map((attr, index) => (
            <div
              key={attr.key}
              className="grid grid-cols-[auto_1fr] items-center gap-2 px-3 first:pl-0 last:pr-0"
            >
              {index > 0 ? (
                <span className="-ml-2 mr-1 h-9 w-px shrink-0 bg-zinc-200" aria-hidden="true" />
              ) : (
                <span className="hidden" aria-hidden="true" />
              )}
              <div className="flex min-w-0 items-center justify-center gap-2">
                <span className="shrink-0 text-zinc-500">{attr.icon}</span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[0.86rem] font-semibold text-zinc-800">
                    {attr.primary}
                  </span>
                  <span className="block text-[0.72rem] font-medium text-zinc-500">
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

export function PropertyCard({ property, slug, logoUrl }: PropertyCardProps) {
  const requestable = isPropertyRequestable(property);
  const coverImage = getPropertyCoverImage(property);
  const attrs = buildAttrs(property);
  const strip = buildStrip(property);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(23,23,23,0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_34px_rgba(23,23,23,0.08)]">
      {/* Imagen */}
      <Link href={`/${slug}/propiedades/${property.id}`}>
        <div className="relative h-[210px] overflow-hidden bg-zinc-100">
          <img
            src={coverImage}
            alt={property.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Cinta diagonal de operación — esquina superior izquierda */}
          <div className="pointer-events-none absolute left-0 top-0 h-[100px] w-[100px] overflow-hidden">
            <span className="absolute left-[-28px] top-[22px] block w-[140px] rotate-[-45deg] bg-zinc-950 py-2 text-center text-[9px] font-black uppercase tracking-[0.18em] text-white">
              {getOperationLabel(property.operation)}
            </span>
          </div>

          {/* Badge de estado — solo si no disponible, esquina superior derecha */}
          {property.status !== "available" ? (
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-zinc-900/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-sm">
                {getStatusLabel(property.status)}
              </span>
            </div>
          ) : null}

          {/* Logo de inmobiliaria — solo si existe, esquina inferior izquierda */}
          {logoUrl ? (
            <div className="absolute bottom-3 left-3">
              <div className="rounded-[4px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                <img
                  src={logoUrl}
                  alt=""
                  aria-hidden="true"
                  className="block h-8 w-auto max-w-[110px] object-contain"
                />
              </div>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* Cabecera: título + tipo + ubicación izquierda / precio derecha */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Link href={`/${slug}/propiedades/${property.id}`}>
              <h3 className="line-clamp-2 text-[1.15rem] font-bold leading-tight text-zinc-950 transition group-hover:text-zinc-700">
                {property.title}
              </h3>
            </Link>
            <p className="mt-1 text-[0.8rem] font-medium text-zinc-500">
              {property.propertyType}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[0.8rem] font-medium text-zinc-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
          </div>
          <div className="w-[118px] shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase leading-none tracking-wide text-zinc-400">
              {getOperationPriceLabel(property.operation)}
            </p>
            <p className="mt-1 text-xl font-black leading-tight text-zinc-950">
              {property.price}
            </p>
          </div>
        </div>

        {/* Descripción — 2 líneas máx, min-h para alinear cards en grid */}
        <p
          className="mt-4 min-h-[48px] flex-1 overflow-hidden text-[0.9rem] leading-6 text-zinc-600"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {property.description}
        </p>

        {/* Sección inferior empujada al fondo */}
        <div className="mt-auto">
          <TechnicalAttrRow attrs={attrs} />

          {/* Botones */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades/${property.id}`} className="sm:flex-1">
              <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-zinc-950 px-4 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-zinc-800">
                Ver ficha
                <ChevronRight className="h-4 w-4 shrink-0" />
              </span>
            </Link>
            {requestable ? (
              <Link href={`/${slug}/solicitar-visita/${property.id}`} className="sm:flex-1">
                <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-zinc-300 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:border-zinc-400">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  Solicitar visita
                </span>
              </Link>
            ) : (
              <span className="inline-flex h-11 w-full items-center justify-center rounded-[5px] border border-zinc-200 px-3 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 sm:flex-1">
                No disponible
              </span>
            )}
          </div>

          {/* Franja inferior de diferenciales — detailedFeatures primero, fallback features */}
          {strip.length > 0 ? (
            <div className="mt-4 flex items-center justify-center border-t border-zinc-100 pt-3">
              {strip.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 ? (
                    <span className="mx-3 h-3.5 w-px shrink-0 bg-zinc-300" aria-hidden="true" />
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    {item}
                  </span>
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
