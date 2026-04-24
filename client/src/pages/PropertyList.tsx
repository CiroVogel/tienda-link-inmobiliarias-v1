import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { usePublicProperties } from "@/lib/propertyData";
import {
  getOperationLabel,
  getStatusLabel,
  realEstateProfile,
} from "@/lib/realEstateDemo";

export default function PropertyList() {
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = slug ?? realEstateProfile.slug;
  const { properties } = usePublicProperties(safeSlug);

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
          <span className="text-sm font-black uppercase tracking-[0.18em] text-zinc-950">
            Propiedades
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            <Building2 className="h-4 w-4" />
            {realEstateProfile.name}
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
          {["sale", "rent"].map((operation) => (
            <span
              key={operation}
              className="border border-zinc-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500"
            >
              {getOperationLabel(operation as "sale" | "rent")}
            </span>
          ))}
          {["available", "reserved", "sold", "rented"].map((status) => (
            <span
              key={status}
              className="border border-zinc-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500"
            >
              {getStatusLabel(status as "available" | "reserved" | "sold" | "rented")}
            </span>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} slug={safeSlug} />
          ))}
        </div>
      </main>
    </div>
  );
}
