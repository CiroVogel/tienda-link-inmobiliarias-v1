import { useState } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  HomeIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { usePublicProperty } from "@/lib/propertyData";
import {
  detailedPropertyFeatureGroups,
  type DemoProperty,
  getPropertyGalleryImages,
  getOperationLabel,
  getStatusLabel,
  isPropertyRequestable,
  realEstateProfile,
} from "@/lib/realEstateDemo";
import { usePageMeta } from "@/lib/seo";
import { trpc } from "@/lib/trpc";

function buildWhatsappHref(whatsapp: string, propertyTitle: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, quiero consultar por la propiedad: ${propertyTitle}`,
  )}`;
}

function formatNumberDetail(value?: number | null) {
  return value != null ? String(value) : null;
}

function formatAreaDetail(value?: number | null) {
  return value != null ? `${value} m²` : null;
}

function formatAgeDetail(value?: number | null) {
  if (value == null) return null;
  return value === 0 ? "A estrenar" : `${value} año${value === 1 ? "" : "s"}`;
}

function formatTextDetail(value?: string | null) {
  return value?.trim() || null;
}

function hasDetailValue(item: { label: string; value: string | null }): item is {
  label: string;
  value: string;
} {
  return Boolean(item.value);
}

function buildPropertyDetailItems(property: DemoProperty) {
  return [
    { label: "Ambientes", value: formatNumberDetail(property.rooms) },
    { label: "Dormitorios", value: formatNumberDetail(property.bedrooms) },
    { label: "Baños", value: formatNumberDetail(property.bathrooms) },
    { label: "Cocheras", value: formatNumberDetail(property.garages) },
    { label: "Antigüedad", value: formatAgeDetail(property.ageYears) },
    { label: "Expensas", value: formatTextDetail(property.expenses) },
    { label: "Superficie cubierta", value: formatAreaDetail(property.coveredAreaM2) },
    { label: "Superficie descubierta", value: formatAreaDetail(property.uncoveredAreaM2) },
    { label: "Superficie total", value: formatAreaDetail(property.areaM2) },
    { label: "Disposición", value: formatTextDetail(property.disposition) },
    { label: "Orientación", value: formatTextDetail(property.orientation) },
  ].filter(hasDetailValue);
}

function buildPropertyMetaDescription(property: DemoProperty | null, businessName: string) {
  if (!property) {
    return `Ficha de propiedad de ${businessName}.`;
  }

  const details = [
    getOperationLabel(property.operation),
    property.propertyType,
    property.location,
    property.price,
  ].filter(Boolean);

  return details.length > 0
    ? `${details.join(" · ")}. Consulta directa con ${businessName}.`
    : `Ficha de propiedad de ${businessName}.`;
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
  const businessName = publicProfile
    ? publicProfile.businessName?.trim() || "Inmobiliaria"
    : realEstateProfile.name;
  const brandImageUrl =
    publicProfile?.logoUrl?.trim() ||
    publicProfile?.ownerImageUrl?.trim() ||
    null;
  const profileWhatsapp = publicProfile
    ? publicProfile.whatsapp?.trim() || ""
    : realEstateProfile.whatsapp;
  const phone = publicProfile
    ? publicProfile.phone?.trim() || ""
    : realEstateProfile.phone;
  const email = publicProfile
    ? publicProfile.email?.trim() || ""
    : realEstateProfile.email;
  const address = publicProfile
    ? publicProfile.address?.trim() || ""
    : realEstateProfile.address;

  usePageMeta(
    property ? `${property.title} | ${businessName}` : `Propiedad | ${businessName}`,
    buildPropertyMetaDescription(property, businessName),
  );

  if (isLoading && !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <p className="text-sm font-medium text-[#6a716f]">Cargando propiedad...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <div className="max-w-sm text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
            Propiedad no encontrada
          </p>
          <h1 className="mb-6 text-4xl font-black text-zinc-950">
            No pudimos encontrar esta ficha.
          </h1>
          <Link href={`/${safeSlug}/propiedades`}>
            <span className="inline-flex rounded-full bg-[#12383d] px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#0f646a]">
              Volver al listado
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const requestable = isPropertyRequestable(property);
  const summaryFacts = [
    { label: "Tipo", value: property.propertyType, Icon: Building2 },
    { label: "Superficie", value: formatAreaDetail(property.areaM2), Icon: Ruler },
    { label: "Dormitorios", value: formatNumberDetail(property.bedrooms), Icon: BedDouble },
    { label: "Baños", value: formatNumberDetail(property.bathrooms), Icon: Bath },
  ].filter((fact) => Boolean(fact.value));
  const detailItems = buildPropertyDetailItems(property);
  const selectedDetailedFeatureGroups = detailedPropertyFeatureGroups
    .map((group) => ({
      title: group.title,
      options: group.options.filter((feature) =>
        (property.detailedFeatures ?? []).includes(feature),
      ),
    }))
    .filter((group) => group.options.length > 0);
  const hasDetailedBlock = detailItems.length > 0 || selectedDetailedFeatureGroups.length > 0;
  const hasFreeFeatures = property.features.length > 0;

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-[#ded8cc] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href={`/${safeSlug}/propiedades`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#6a716f]">
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
          <a
            href="/admin"
            className="rounded-full border border-[#ded8cc] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6a716f] transition hover:border-[#0f646a] hover:text-[#12383d]"
          >
            Mi panel
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 md:py-8">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="overflow-hidden bg-[#ece7dc]">
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
                    selectedImage === index ? "border-[#12383d]" : "border-[#ded8cc]"
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
              <span className="rounded-md bg-[#12383d] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                {getOperationLabel(property.operation)}
              </span>
              <span
                className={`px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  property.status === "available"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#ece6dd] text-[#6a716f]"
                }`}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-950 md:text-4xl">
              {property.title}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#6a716f]">
              <MapPin className="h-4 w-4 text-[#6a716f]" />
              {property.address}, {property.location}
            </p>

            <p className="mt-4 text-3xl font-black text-zinc-950">{property.price}</p>

            <div className="mt-5 grid grid-cols-2 gap-px bg-[#ded8cc]">
              {summaryFacts.map(({ label, value, Icon }) => (
                <div key={label} className="bg-[#fffdf8] p-3">
                  <Icon className="mb-2 h-5 w-5 text-[#6a716f]" />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6a716f]">
                    {label}
                  </p>
                  <p className="mt-1 font-bold text-zinc-950">{value}</p>
                </div>
              ))}
            </div>

            {hasDetailedBlock ? (
              <div className="mt-5 border-t border-[#ded8cc] pt-5">
                <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950">
                  Detalles de la propiedad
                </h2>

                {detailItems.length > 0 ? (
                  <div className="grid gap-px bg-[#ded8cc] sm:grid-cols-2">
                    {detailItems.map((item) => (
                      <div key={item.label} className="bg-[#fffdf8] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6a716f]">
                          {item.label}
                        </p>
                        <p className="mt-1 font-bold text-zinc-950">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedDetailedFeatureGroups.length > 0 ? (
                  <div className="mt-4 grid gap-4">
                    {selectedDetailedFeatureGroups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#6a716f]">
                          {group.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.options.map((feature) => (
                            <span
                              key={feature}
                              className="border border-[#ded8cc] bg-[#fffdf8] px-3 py-2 text-sm text-[#3a3a3a]"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {hasFreeFeatures ? (
              <div className="mt-5">
                <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950">
                  Características
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature) => (
                    <span
                      key={feature}
                      className="border border-[#ded8cc] bg-[#fffdf8] px-3 py-2 text-sm text-[#3a3a3a]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 border-t border-[#ded8cc] pt-5">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950">
                Descripción
              </h2>
              <p className="text-sm leading-7 text-[#3a3a3a]">{property.description}</p>
            </div>

            <div className="mt-5 border-t border-[#ded8cc] pt-5">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950">
                Consulta directa con {businessName}
              </h2>
              <div className="grid gap-3 text-sm text-[#3a3a3a]">
                {phone || profileWhatsapp ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-[#6a716f]" />
                    <span>{phone || profileWhatsapp}</span>
                  </p>
                ) : null}
                {email ? (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-[#6a716f]" />
                    <span>{email}</span>
                  </p>
                ) : null}
                {address ? (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#6a716f]" />
                    <span>{address}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {requestable ? (
                <Link href={`/${safeSlug}/solicitar-visita/${property.id}`}>
                  <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[#12383d] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#0f646a]">
                    Solicitar visita
                    <HomeIcon className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center bg-[#ece6dd] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#6a716f]">
                  No disponible para visita
                </span>
              )}

              {profileWhatsapp ? (
                <a
                  href={buildWhatsappHref(profileWhatsapp, property.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cfc7b8] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#12383d] transition hover:border-[#0f646a]"
                >
                  WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
