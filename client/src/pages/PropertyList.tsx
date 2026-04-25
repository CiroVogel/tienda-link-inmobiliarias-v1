import { useMemo, useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { usePublicProperties } from "@/lib/propertyData";
import {
  getOperationLabel,
  getStatusLabel,
  realEstateProfile,
  type PropertyOperation,
  type PropertyStatus,
} from "@/lib/realEstateDemo";
import { trpc } from "@/lib/trpc";

const operationFilters: PropertyOperation[] = ["sale", "rent"];
const statusFilters: Array<Exclude<PropertyStatus, "hidden">> = [
  "available",
  "reserved",
  "sold",
  "rented",
];

export default function PropertyList() {
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = slug ?? realEstateProfile.slug;
  const { properties } = usePublicProperties(safeSlug);
  const [operationFilter, setOperationFilter] = useState<PropertyOperation | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Exclude<PropertyStatus, "hidden"> | "all">(
    "all",
  );
  const { data: publicProfile } = trpc.business.getPublic.useQuery(
    { slug: safeSlug },
    { enabled: Boolean(safeSlug) },
  );
  const businessName =
    publicProfile?.businessName?.trim() || realEstateProfile.name;
  const brandImageUrl =
    publicProfile?.logoUrl?.trim() ||
    publicProfile?.ownerImageUrl?.trim() ||
    null;
  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesOperation =
          operationFilter === "all" || property.operation === operationFilter;
        const matchesStatus = statusFilter === "all" || property.status === statusFilter;

        return matchesOperation && matchesStatus;
      }),
    [operationFilter, properties, statusFilter],
  );
  const showingAll = operationFilter === "all" && statusFilter === "all";

  function getFilterClasses(active: boolean) {
    return `border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
      active
        ? "border-zinc-950 bg-zinc-950 text-white"
        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-950"
    }`;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href={`/${safeSlug}`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              <ArrowLeft className="h-4 w-4" />
              Inicio
            </span>
          </Link>
          <Link href={`/${safeSlug}`}>
            <span className="flex max-w-[58vw] items-center gap-3">
              {brandImageUrl ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm sm:h-8 sm:w-8">
                  <img
                    src={brandImageUrl}
                    alt={businessName}
                    className="h-full w-full scale-[1.18] object-contain"
                  />
                </span>
              ) : null}
              <span className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-zinc-950 sm:text-sm sm:tracking-[0.18em]">
                {businessName}
              </span>
            </span>
          </Link>
          <div className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            <Building2 className="h-4 w-4" />
            {businessName}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Listado de propiedades
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-500">
            Opciones en venta y alquiler en Rosario, con estado actualizado para
            consultar o coordinar una visita.
          </p>
        </div>

        <div className="mb-7 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setOperationFilter("all");
              setStatusFilter("all");
            }}
            className={getFilterClasses(showingAll)}
          >
            Todas
          </button>

          {operationFilters.map((operation) => (
            <button
              key={operation}
              type="button"
              onClick={() =>
                setOperationFilter((current) => (current === operation ? "all" : operation))
              }
              className={getFilterClasses(operationFilter === operation)}
            >
              {getOperationLabel(operation as "sale" | "rent")}
            </button>
          ))}
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter((current) => (current === status ? "all" : status))}
              className={getFilterClasses(statusFilter === status)}
            >
              {getStatusLabel(status as "available" | "reserved" | "sold" | "rented")}
            </button>
          ))}
        </div>

        <p className="mb-6 text-sm text-zinc-500">
          Mostrando {filteredProperties.length} de {properties.length} propiedades.
        </p>

        {filteredProperties.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} slug={safeSlug} />
            ))}
          </div>
        ) : (
          <div className="border border-zinc-200 bg-white px-6 py-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Sin resultados
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              No encontramos propiedades para ese filtro. Puedes desactivarlo o volver a{" "}
              <button
                type="button"
                onClick={() => {
                  setOperationFilter("all");
                  setStatusFilter("all");
                }}
                className="font-bold text-zinc-950"
              >
                ver todas
              </button>
              .
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
