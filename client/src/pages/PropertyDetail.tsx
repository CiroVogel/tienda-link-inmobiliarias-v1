import { useState } from "react";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  Images,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  X,
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
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";

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

function getOperationPriceLabel(operation: string): string {
  return operation === "sale" ? "Precio de venta" : "Precio de alquiler";
}

function buildPropertyDetailItems(property: DemoProperty) {
  return [
    { label: "Ambientes", value: formatNumberDetail(property.rooms) },
    { label: "Dormitorios", value: formatNumberDetail(property.bedrooms) },
    { label: "Baños", value: property.bathrooms != null && property.bathrooms > 0 ? String(property.bathrooms) : null },
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
  const [modalOpen, setModalOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");
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
  const description = publicProfile
    ? publicProfile.description?.trim() || ""
    : realEstateProfile.description;
  const instagram = publicProfile
    ? publicProfile.instagram?.trim() || ""
    : realEstateProfile.instagram;
  const facebook = publicProfile?.facebook?.trim() || "";

  usePageMeta(
    property ? `${property.title} | ${businessName}` : `Propiedad | ${businessName}`,
    buildPropertyMetaDescription(property, businessName),
  );

  if (isLoading && !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <p className="text-sm font-medium text-[#465153]">Cargando propiedad...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <div className="max-w-sm text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#465153]">
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
    { label: "Superficie", value: formatAreaDetail(property.areaM2), Icon: Ruler },
    { label: "Dormitorios", value: formatNumberDetail(property.bedrooms), Icon: BedDouble },
    { label: "Baños", value: property.bathrooms != null && property.bathrooms > 0 ? String(property.bathrooms) : null, Icon: Bath },
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

  async function handleShare() {
    if (!property) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    const shareText = [
      getOperationLabel(property.operation),
      property.propertyType,
      property.location,
      property.price,
    ]
      .filter(Boolean)
      .join(" · ");

    const canUseNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      (navigator.maxTouchPoints > 0 ||
        Boolean(window.matchMedia?.("(pointer: coarse)").matches));

    try {
      if (canUseNativeShare) {
        await navigator.share({ title: property.title, text: shareText, url });
        setShareStatus("shared");
        window.setTimeout(() => setShareStatus("idle"), 2200);
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus("idle"), 2200);
      } else {
        window.prompt("Copiá el link para compartir:", url);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setShareStatus("copied");
          window.setTimeout(() => setShareStatus("idle"), 2200);
        }
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <PublicHeader
        slug={safeSlug}
        businessName={businessName}
        brandImageUrl={brandImageUrl}
        backHref={`/${safeSlug}/propiedades`}
        backLabel="Listado"
      />

      <main className="mx-auto max-w-6xl px-5 py-8 md:py-10">
        {/* Foto principal */}
        <div className="relative overflow-hidden rounded-[16px] border border-[#ded8cc] bg-[#ece7dc]">
          <button
            type="button"
            className="group block w-full cursor-zoom-in"
            aria-label="Ampliar imagen"
            onClick={() => setModalOpen(true)}
          >
            <img
              src={galleryImages[selectedImage] ?? galleryImages[0]}
              alt={property.title}
              className="aspect-[4/3] w-full object-cover md:aspect-[2/1] lg:aspect-[5/2]"
            />
            {galleryImages.length > 1 ? (
              <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-[5px] bg-[#12383d]/85 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-sm transition group-hover:bg-[#12383d]">
                <Images className="h-3.5 w-3.5" />
                Ver fotos · {galleryImages.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* Tira de miniaturas */}
        {galleryImages.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {galleryImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`shrink-0 overflow-hidden rounded-[8px] ${
                  selectedImage === index
                    ? "border-2 border-[#12383d]"
                    : "border border-[#ded8cc]"
                }`}
                aria-label={`Ver foto ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${property.title} foto ${index + 1}`}
                  className="h-20 w-28 object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        {/* Lightbox */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogContent
                showCloseButton={false}
                className="max-w-[95vw] overflow-hidden rounded-lg border-0 bg-[#111111] p-0 sm:max-w-[85vw]"
              >
                <div className="relative flex flex-col items-center">
                  {/* Botón cerrar */}
                  <DialogClose className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                  </DialogClose>

                  {/* Imagen ampliada */}
                  <img
                    src={galleryImages[selectedImage]}
                    alt={`${property.title} foto ${selectedImage + 1}`}
                    className="mx-auto max-h-[85vh] w-auto max-w-full object-contain"
                  />

                  {/* Flechas + contador */}
                  <div className="flex w-full items-center justify-between px-3 py-3">
                    {galleryImages.length > 1 ? (
                      <button
                        type="button"
                        aria-label="Foto anterior"
                        onClick={() =>
                          setSelectedImage((i) =>
                            i === 0 ? galleryImages.length - 1 : i - 1,
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    ) : (
                      <span />
                    )}

                    <span className="text-xs font-semibold text-white/70">
                      {selectedImage + 1} / {galleryImages.length}
                    </span>

                    {galleryImages.length > 1 ? (
                      <button
                        type="button"
                        aria-label="Foto siguiente"
                        onClick={() =>
                          setSelectedImage((i) =>
                            i === galleryImages.length - 1 ? 0 : i + 1,
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

        {/* Card editorial */}
        <div className="mt-6 rounded-[16px] border border-[#ded8cc] bg-[#fffdf8] p-5 sm:p-7">
            {/* Operación y disponibilidad */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-[5px] bg-[#12383d] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                {getOperationLabel(property.operation)}
              </span>
              <span
                className={`rounded-[5px] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  property.status === "available"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#ece6dd] text-[#6a716f]"
                }`}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-950 sm:text-[2.2rem]">
              {property.title}
            </h1>

            {/* Tipo de propiedad */}
            {property.propertyType ? (
              <p className="mt-2 text-[0.8rem] font-medium text-[#465153]">
                {property.propertyType}
              </p>
            ) : null}

            {/* Ubicación */}
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#465153]">
              <MapPin className="h-4 w-4 shrink-0 text-[#6a716f]" />
              {property.address}, {property.location}
            </p>

            {/* Precio */}
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase leading-none tracking-wide text-[#465153]">
                {getOperationPriceLabel(property.operation)}
              </p>
              <p className="mt-1 text-[1.9rem] font-black leading-tight text-zinc-950">
                {property.price}
              </p>
            </div>

            {/* Datos rápidos */}
            {summaryFacts.length > 0 ? (
              <div className="mt-5 border-t border-[#ece6dd] pt-4">
                <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
                  {summaryFacts.map(({ label, value, Icon }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#6a716f]" />
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[0.86rem] font-semibold text-zinc-800">
                          {value}
                        </span>
                        <span className="block text-[0.72rem] font-medium text-[#465153]">
                          {label}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
        </div>

            {/* Detalles técnicos */}
            {hasDetailedBlock ? (
              <div className="mt-5 border-t border-[#ded8cc] pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#465153]">
                  Detalles de la propiedad
                </p>

                {detailItems.length > 0 ? (
                  <div>
                    {detailItems.map((item, index) => (
                      <div
                        key={item.label}
                        className={`flex items-baseline justify-between gap-4 py-2.5 ${
                          index < detailItems.length - 1 ? "border-b border-[#ece6dd]" : ""
                        }`}
                      >
                        <span className="text-sm text-[#465153]">{item.label}</span>
                        <span className="text-sm font-semibold text-zinc-950">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedDetailedFeatureGroups.length > 0 ? (
                  <div className="mt-4 grid gap-4">
                    {selectedDetailedFeatureGroups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#465153]">
                          {group.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.options.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-full border border-[#ded8cc] bg-[#fffdf8] px-3 py-1.5 text-sm text-[#3a3a3a]"
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

            {/* Características libres */}
            {hasFreeFeatures ? (
              <div className="mt-5 border-t border-[#ded8cc] pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#465153]">
                  Características
                </p>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-[#ded8cc] bg-[#fffdf8] px-3 py-1.5 text-sm text-[#3a3a3a]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Descripción */}
            <div className="mt-5 border-t border-[#ded8cc] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#465153]">
                Descripción
              </p>
              <div className="border-l-2 border-[#ded8cc] pl-5">
                <p className="whitespace-pre-line text-[0.95rem] leading-7 text-[#3a3a3a]">{property.description}</p>
              </div>
            </div>

            {/* Contacto */}
            <div className="mt-5 border-t border-[#ded8cc] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#465153]">
                Consulta directa con {businessName}
              </p>
              <div>
                {phone || profileWhatsapp ? (
                  <div className="flex items-center gap-3 border-b border-[#ece6dd] py-3">
                    <Phone className="h-4 w-4 shrink-0 text-[#6a716f]" />
                    <span className="text-sm text-[#3a3a3a]">{phone || profileWhatsapp}</span>
                  </div>
                ) : null}
                {email ? (
                  <div className="flex items-center gap-3 border-b border-[#ece6dd] py-3">
                    <Mail className="h-4 w-4 shrink-0 text-[#6a716f]" />
                    <span className="text-sm text-[#3a3a3a]">{email}</span>
                  </div>
                ) : null}
                {address ? (
                  <div className="flex items-center gap-3 border-b border-[#ece6dd] py-3">
                    <MapPin className="h-4 w-4 shrink-0 text-[#6a716f]" />
                    <span className="text-sm text-[#3a3a3a]">{address}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {requestable ? (
                <Link href={`/${safeSlug}/solicitar-visita/${property.id}`}>
                  <span className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#12383d] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#0f646a]">
                    Solicitar visita
                    <HomeIcon className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-[5px] border border-[#ded8cc] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#6a716f]">
                  No disponible para visita
                </span>
              )}

              {profileWhatsapp ? (
                <a
                  href={buildWhatsappHref(profileWhatsapp, property.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-[#cfc7b8] bg-[#fffdf8] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#12383d] transition hover:border-[#0f646a] hover:bg-[#eef4f2]"
                >
                  WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : null}
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => { void handleShare(); }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] border border-[#ded8cc] bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#172124] transition hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d]"
              >
                <Share2 className="h-4 w-4" />
                {shareStatus === "copied"
                  ? "¡Link copiado!"
                  : shareStatus === "shared"
                    ? "Compartido"
                    : "Compartir"}
              </button>
            </div>
      </main>
      <PublicFooter
        slug={safeSlug}
        businessName={businessName}
        description={description}
        whatsapp={profileWhatsapp}
        phone={phone}
        email={email}
        instagram={instagram}
        facebook={facebook}
        address={address}
      />
    </div>
  );
}
