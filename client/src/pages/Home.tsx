import {
  ArrowRight,
  CalendarDays,
  FileText,
  MessageCircle,
  Search,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import PublicSavedSearchSection from "@/components/public/SavedSearchSection";
import { usePublicProperties } from "@/lib/propertyData";
import {
  getPropertyCoverImage,
  realEstateProfile,
  type DemoProperty,
} from "@/lib/realEstateDemo";
import { usePageMeta } from "@/lib/seo";
import { trpc } from "@/lib/trpc";
import { PublicFooter } from "@/components/public/PublicFooter";

type HomeProps = {
  forcedSlug?: string;
};

function whatsappHref(whatsapp: string, message: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

function getCityLabel(address?: string | null) {
  const parts = address
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts?.at(-1);
}

function Header({
  slug,
  businessName,
  brandImageUrl,
}: {
  slug: string;
  businessName: string;
  brandImageUrl?: string | null;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d7c8b6]/35 bg-[#fff8ef]/74 shadow-[0_12px_34px_-30px_rgba(35,26,18,0.38)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-10">
        <Link href={`/${slug}`}>
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#d8d1c4] bg-[#fffdf8]/85 text-sm font-bold text-[#12383d] shadow-[0_8px_20px_rgba(25,31,28,0.08)]">
              {brandImageUrl ? (
                <img
                  src={brandImageUrl}
                  alt={businessName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span aria-hidden="true">{businessName.trim().charAt(0).toUpperCase()}</span>
              )}
            </span>
            <span className="max-w-[180px] truncate text-xs font-black uppercase tracking-[0.12em] text-[#182125] sm:max-w-none sm:text-sm sm:tracking-[0.18em]">
              {businessName}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href={`/${slug}/propiedades`}
            className="relative text-sm font-medium text-[#382d24]/75 transition hover:text-[#12383d] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#12383d] after:transition-all hover:after:w-full"
          >
            Propiedades
          </Link>
          <a
            href="#como-funciona"
            className="relative text-sm font-medium text-[#382d24]/75 transition hover:text-[#12383d] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#12383d] after:transition-all hover:after:w-full"
          >
            Cómo funciona
          </a>
          <a
            href="#contacto"
            className="relative text-sm font-medium text-[#382d24]/75 transition hover:text-[#12383d] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#12383d] after:transition-all hover:after:w-full"
          >
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="hidden items-center rounded-[6px] border border-[#cfc7b8] bg-[#fffdf8]/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#12383d] transition hover:border-[#0f646a] hover:bg-[#eef4f2] hover:text-[#0f646a] sm:inline-flex"
          >
            Mi panel
          </a>
          <Link href={`/${slug}/propiedades`}>
            <span className="hidden rounded-[6px] bg-[#12383d] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f646a] sm:inline-flex">
              Ver propiedades
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-[#d7c8b6]/30 bg-[#fff8ef]/72 px-5 py-2 backdrop-blur-md md:hidden">
        <div className="flex gap-5 overflow-x-auto whitespace-nowrap">
          <Link
            href={`/${slug}/propiedades`}
            className="text-sm font-medium text-[#382d24]/75 transition hover:text-[#12383d]"
          >
            Propiedades
          </Link>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-[#382d24]/75 transition hover:text-[#12383d]"
          >
            Cómo funciona
          </a>
          <a
            href="#contacto"
            className="text-sm font-medium text-[#382d24]/75 transition hover:text-[#12383d]"
          >
            Contacto
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({
  featured,
  slug,
  businessName,
  cityLabel,
  tagline,
  description,
  whatsapp,
  heroImageUrl,
}: {
  featured?: DemoProperty;
  slug: string;
  businessName: string;
  cityLabel: string;
  tagline: string;
  description: string;
  whatsapp: string;
  heroImageUrl?: string | null;
}) {
  const coverImage =
    heroImageUrl?.trim() ||
    (featured ? getPropertyCoverImage(featured) : undefined);

  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
      {coverImage ? (
        <img
          src={coverImage}
          alt={featured?.title ?? businessName}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/68 via-black/48 to-black/18" />
      <div className="absolute inset-0 bg-black/8" />

      <div className="relative mx-auto flex min-h-[500px] max-w-[1440px] items-start px-5 pb-16 pt-32 sm:min-h-[560px] sm:pt-36 lg:min-h-[610px] lg:items-stretch lg:pb-20 lg:pt-40 lg:px-10">
        <div className="max-w-2xl lg:flex lg:flex-col">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/82">
            {cityLabel ? `Inmobiliaria en ${cityLabel}` : "Inmobiliaria"}
          </p>

          <h1 className="mt-6 max-w-xl text-[3rem] font-black leading-[0.9] tracking-tight text-white sm:text-[3.6rem] lg:text-[4.5rem]">
            {businessName}
          </h1>

          {tagline ? (
            <p className="mt-5 max-w-xl text-sm font-medium leading-snug text-white/75 sm:text-base">
              {tagline}
            </p>
          ) : null}

          {description ? (
            <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
              {description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto">
            <Link href={`/${slug}/propiedades`}>
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[#81856a] px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:opacity-90">
                Ver propiedades
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {whatsapp ? (
              <a
                href={whatsappHref(
                  whatsapp,
                  `Hola, quiero consultar por propiedades de ${businessName}.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-black/15 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-black/25"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}


function FeaturedProperties({
  properties,
  slug,
  logoUrl,
  businessName,
  instagram,
  facebook,
}: {
  properties: DemoProperty[];
  slug: string;
  logoUrl?: string | null;
  businessName?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}) {
  return (
    <section id="propiedades" className="bg-[#f7f5ef] py-14 md:py-18">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
            Destacadas
          </p>
          <h2 className="text-4xl font-black tracking-tight text-zinc-950">
            Propiedades
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} slug={slug} logoUrl={logoUrl} businessName={businessName} instagram={instagram} facebook={facebook} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection({
  ownerName,
  ownerTitle,
  ownerBio,
}: {
  ownerName: string;
  ownerTitle: string;
  ownerBio: string;
}) {
  if (!ownerName && !ownerTitle && !ownerBio) return null;

  return (
    <section className="border-b border-[#ded8cc] bg-[#fffdf8] py-12 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[0.44fr_1fr] md:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#12383d]">
              Sobre la inmobiliaria
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-[#182125] md:text-[2.2rem]">
              Quiénes somos
            </h2>
            {ownerTitle ? (
              <p className="mt-3 text-sm font-medium text-[#6a716f]">
                {ownerTitle}
              </p>
            ) : null}
          </div>
          <article className="border-l-2 border-[#ded8cc] pl-5 sm:pl-7">
            {ownerBio ? (
              <p className="break-words text-[1.05rem] leading-8 text-[#3a3a3a]">
                {ownerBio}
              </p>
            ) : null}
            {ownerName ? (
              <p className={`text-sm font-semibold text-[#6a716f]${ownerBio ? " mt-6" : ""}`}>
                {ownerName}
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ slug }: { slug: string }) {
  const steps = [
    {
      icon: Search,
      title: "Explorá propiedades",
      text: "Recorré opciones en venta y alquiler según zona, precio y tipo de propiedad.",
    },
    {
      icon: FileText,
      title: "Revisá la ficha",
      text: "Mirá fotos, ubicación, medidas, ambientes y detalles principales antes de consultar.",
    },
    {
      icon: CalendarDays,
      title: "Solicitá visita",
      text: "Dejá tus datos y tu disponibilidad para que podamos coordinar con vos.",
    },
  ];

  return (
    <section id="como-funciona" className="bg-[#f7f5ef] pt-14 pb-8 md:pt-16 md:pb-10 border-b border-[#ded8cc]">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
            Cómo funciona
          </p>
          <h2 className="text-4xl font-black tracking-tight text-zinc-950">
            Del primer vistazo a la visita, sin vueltas.
          </h2>
        </div>

        <div className="grid gap-2 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-2 shadow-[0_10px_30px_rgba(23,23,23,0.04)] md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4 rounded-xl border border-[#ded8cc] bg-white p-5 shadow-[0_10px_30px_rgba(23,23,23,0.04)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef4f2] text-[#0f646a]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-zinc-950">{step.title}</h3>
                  <p className="text-xs leading-5 text-[#3a3a3a]">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href={`/${slug}/propiedades`}>
            <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12383d] px-8 text-sm font-semibold text-white transition hover:bg-[#0f646a]">
              Ver propiedades
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Closing({
  slug,
  businessName,
  description,
  whatsapp,
  phone,
  email,
  instagram,
  facebook,
  address,
}: {
  slug: string;
  businessName: string;
  description: string;
  whatsapp: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  address: string;
}) {
  const waHref = whatsapp
    ? whatsappHref(whatsapp, `Hola, quiero consultar por propiedades de ${businessName}.`)
    : null;

  return (
    <>
      {/* CTA final */}
      <section id="contacto" className="bg-[#071c1b] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            {businessName}
          </p>
          <h2 className="text-[2rem] font-black leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
            ¿Buscás comprar, vender o alquilar una propiedad?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/60">
            Consultanos para conocer propiedades disponibles, coordinar una visita o recibir atención directa.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/${slug}/propiedades`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition hover:bg-white/90"
            >
              Ver propiedades
            </Link>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <PublicFooter
        slug={slug}
        businessName={businessName}
        description={description}
        whatsapp={whatsapp}
        phone={phone}
        email={email}
        instagram={instagram}
        facebook={facebook}
        address={address}
      />
    </>
  );
}

export default function Home({ forcedSlug }: HomeProps) {
  const params = useParams<{ slug: string }>();
  const slug = forcedSlug ?? params.slug ?? realEstateProfile.slug;
  const { properties } = usePublicProperties(slug);
  const { data: publicProfile, isLoading: isPublicProfileLoading } = trpc.business.getPublic.useQuery(
    { slug },
    { enabled: Boolean(slug) },
  );
  const isDemoSlug = slug === realEstateProfile.slug;
  const businessName = publicProfile
    ? publicProfile.businessName?.trim() || "Inmobiliaria"
    : realEstateProfile.name;

  usePageMeta(
    `${businessName} | Tienda Link Inmobiliarias`,
    `Propiedades, consultas y atención directa de ${businessName}.`,
  );

  if (!isDemoSlug && !isPublicProfileLoading && !publicProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-md text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Inmobiliaria no disponible
          </p>
          <h1 className="mb-4 text-4xl font-black text-zinc-950">
            Esta página no está pública en este momento.
          </h1>
          <p className="text-sm leading-7 text-zinc-500">
            Si necesitás acceso, te conviene revisar el slug o entrar desde la administración central.
          </p>
        </div>
      </div>
    );
  }

  const brandImageUrl =
    publicProfile?.logoUrl?.trim() ||
    publicProfile?.ownerImageUrl?.trim() ||
    null;
  const tagline = publicProfile
    ? publicProfile.tagline?.trim() || ""
    : "Propiedades claras para encontrar tu próximo lugar.";
  const description = publicProfile
    ? publicProfile.description?.trim() || ""
    : realEstateProfile.description;
  const whatsapp = publicProfile
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
  const instagram = publicProfile
    ? publicProfile.instagram?.trim() || ""
    : realEstateProfile.instagram;
  const facebook = publicProfile?.facebook?.trim() || "";
  const ownerName = publicProfile ? publicProfile.ownerName?.trim() || "" : "";
  const ownerTitle = publicProfile ? publicProfile.ownerTitle?.trim() || "" : "";
  const ownerBio = publicProfile ? publicProfile.ownerBio?.trim() || "" : "";
  const cityLabel = getCityLabel(address) ?? (publicProfile ? "" : realEstateProfile.city);
  const featuredProperties = properties
    .filter((property) => property.featured)
    .slice(0, 9);
  const featuredCards =
    featuredProperties.length > 0 ? featuredProperties : properties.slice(0, 9);
  const heroProperty = featuredProperties[0] ?? properties[0];
  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <Header slug={slug} businessName={businessName} brandImageUrl={brandImageUrl} />
      <Hero
        featured={heroProperty}
        slug={slug}
        businessName={businessName}
        cityLabel={cityLabel}
        tagline={tagline}
        description={description}
        whatsapp={whatsapp}
        heroImageUrl={publicProfile?.heroImageUrl}
      />
      <AboutSection ownerName={ownerName} ownerTitle={ownerTitle} ownerBio={ownerBio} />
      <FeaturedProperties properties={featuredCards} slug={slug} logoUrl={brandImageUrl} businessName={businessName} instagram={instagram} facebook={facebook} />
      <section className="bg-[#fffdf8] py-5">
        <div className="mx-auto flex max-w-[1440px] justify-end px-5 lg:px-10">
          <Link href={`/${slug}/propiedades`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
              Ir al listado
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>
      <HowItWorks slug={slug} />
      <PublicSavedSearchSection
        slug={slug}
        className="bg-[#f7f5ef] pt-8 pb-14 md:pt-10 md:pb-18"
      />
      <Closing
        slug={slug}
        businessName={businessName}
        description={description}
        whatsapp={whatsapp}
        phone={phone}
        email={email}
        instagram={instagram}
        facebook={facebook}
        address={address}
      />
    </div>
  );
}



