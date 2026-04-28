import { useState } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  HomeIcon,
  MapPin,
  MessageCircle,
  Ruler,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { usePublicProperty } from "@/lib/propertyData";
import {
  getPropertyGalleryImages,
  getOperationLabel,
  getStatusLabel,
  isPropertyRequestable,
  realEstateProfile,
} from "@/lib/realEstateDemo";
import { trpc } from "@/lib/trpc";

function buildWhatsappHref(propertyTitle: string) {
  return `https://wa.me/${realEstateProfile.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, quiero consultar por la propiedad: ${propertyTitle}`,
  )}`;
}

export default function PropertyDetail() {
  const { slug, propertyId } = useParams<{ slug: string; propertyId: string }>();
  const safeSlug = slug ?? realEstateProfile.slug;
  const { property, isLoading } = usePublicProperty(safeSlug, propertyId);
  const { data: publicProfile } = trpc.business.getPublic.useQuery(
    { slug: safeSlug },
    { enabled: Boolean(safeSlug) },
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const galleryImages = getPropertyGalleryImages(property);
  const businessName =
    publicProfile?.businessName?.trim() || realEstateProfile.name;
  const brandImageUrl =
    publicProfile?.logoUrl?.trim() ||
    publicProfile?.ownerImageUrl?.trim() ||
    null;

  if (isLoading && !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-5">
        <p className="text-sm font-medium text-zinc-500">Cargando propiedad...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-sm text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Propiedad no encontrada
          </p>
          <h1 className="mb-6 text-4xl font-black text-zinc-950">
            No pudimos encontrar esta ficha.
          </h1>
          <Link href={`/${safeSlug}/propiedades`}>
            <span className="inline-flex bg-zinc-950 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white">
              Volver al listado
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const requestable = isPropertyRequestable(property);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href={`/${safeSlug}/propiedades`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              <ArrowLeft className="h-4 w-4" />
              Listado
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

      <main className="mx-auto max-w-6xl px-5 py-6 md:py-8">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="overflow-hidden bg-zinc-100">
              <img
                src={galleryImages[selectedImage] ?? galleryImages[0]}
                alt={property.title}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden border ${
                    selectedImage === index ? "border-zinc-950" : "border-zinc-200"
                  }`}
                  aria-label={`Ver foto ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${property.title} foto ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <aside>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="bg-zinc-950 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                {getOperationLabel(property.operation)}
              </span>
              <span
                className={`px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  property.status === "available"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-950 md:text-4xl">
              {property.title}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-zinc-400">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.location}
            </p>

            <p className="mt-4 text-3xl font-black text-zinc-950">{property.price}</p>

            <div className="mt-5 grid grid-cols-2 gap-px bg-zinc-200">
              <div className="bg-zinc-50 p-3">
                <Building2 className="mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Tipo
                </p>
                <p className="mt-1 font-bold text-zinc-950">{property.propertyType}</p>
              </div>
              <div className="bg-zinc-50 p-3">
                <Ruler className="mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Superficie
                </p>
                <p className="mt-1 font-bold text-zinc-950">
                  {property.areaM2 ? `${property.areaM2} m²` : "A consultar"}
                </p>
              </div>
              <div className="bg-zinc-50 p-3">
                <BedDouble className="mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Dormitorios
                </p>
                <p className="mt-1 font-bold text-zinc-950">
                  {property.bedrooms ?? "No aplica"}
                </p>
              </div>
              <div className="bg-zinc-50 p-3">
                <Bath className="mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Baños
                </p>
                <p className="mt-1 font-bold text-zinc-950">
                  {property.bathrooms ?? "A consultar"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950">
                Caracteristicas
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature) => (
                  <span
                    key={feature}
                    className="border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-200 pt-5">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950">
                Descripción
              </h2>
              <p className="text-sm leading-7 text-zinc-600">{property.description}</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {requestable ? (
                <Link href={`/${safeSlug}/solicitar-visita/${property.id}`}>
                  <span className="inline-flex items-center justify-center gap-2 bg-zinc-950 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white">
                    Solicitar visita
                    <HomeIcon className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center bg-zinc-200 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  No disponible para visita
                </span>
              )}

              <a
                href={buildWhatsappHref(property.title)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-zinc-300 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-950"
              >
                WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

