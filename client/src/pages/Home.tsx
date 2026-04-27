import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HomeIcon,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { PropertyCard } from "@/components/PropertyCard";
import PublicSavedSearchSection from "@/components/public/SavedSearchSection";
import { usePublicProperties } from "@/lib/propertyData";
import {
  getPropertyCoverImage,
  realEstateProfile,
  type DemoProperty,
} from "@/lib/realEstateDemo";
import {
  savedSearchBedroomOptions,
  savedSearchOperationOptions,
  savedSearchPropertyTypeOptions,
} from "@/lib/savedSearches";
import { trpc } from "@/lib/trpc";

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

  return parts?.at(-1) ?? realEstateProfile.city;
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href={`/${slug}`}>
          <span className="flex items-center gap-3">
            {brandImageUrl ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm sm:h-8 sm:w-8">
                <img
                  src={brandImageUrl}
                  alt={businessName}
                  className="h-full w-full scale-[1.18] object-contain"
                />
              </span>
            ) : null}
            <span className="block whitespace-nowrap text-[11px] font-black uppercase tracking-[0.1em] text-white sm:text-sm sm:tracking-[0.18em]">
              {businessName}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.16em] text-white/70 md:flex">
          <Link href={`/${slug}/propiedades`}>Propiedades</Link>
          <a href="#como-funciona">Como funciona</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <Link href={`/${slug}/propiedades`}>
          <span className="hidden bg-[#81856a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white sm:inline-flex">
            Ver propiedades
          </span>
        </Link>
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
  const coverImage = heroImageUrl?.trim() || getPropertyCoverImage(featured);

  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
      <img
        src={coverImage}
        alt={featured?.title ?? businessName}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-black/18" />

      <div className="relative mx-auto flex min-h-[620px] max-w-6xl items-center px-5 py-16 sm:min-h-[680px] lg:min-h-[720px]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            Inmobiliaria urbana en {cityLabel}
          </p>

          <h1 className="mt-6 max-w-xl text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
            {businessName}
          </h1>

          <p className="mt-5 max-w-2xl text-2xl font-medium leading-tight text-white/90 sm:text-3xl">
            {tagline}
          </p>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/72 sm:text-lg">
            {description}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades`}>
              <span className="inline-flex items-center justify-center gap-2 bg-[#81856a] px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white">
                Ver propiedades
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <a
              href={whatsappHref(
                whatsapp,
                "Hola, quiero consultar por propiedades de Clave Urbana.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/25 bg-black/15 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-black/25"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueBlock() {
  const values = [
    "Precio, zona, operación y estado visibles desde el primer vistazo.",
    "Fotos, medidas y características reunidas para comparar con calma.",
    "Solicitud de visita directa para coordinar una fecha posible.",
  ];

  return (
    <section className="border-y border-zinc-200 bg-white py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Buscar con claridad
          </p>
          <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-950 md:text-4xl">
            Información ordenada para elegir la próxima visita.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value} className="border border-zinc-200 bg-zinc-50 p-5">
              <CheckCircle2 className="mb-4 h-5 w-5 text-zinc-950" />
              <p className="text-sm leading-6 text-zinc-600">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProperties({
  properties,
  slug,
}: {
  properties: DemoProperty[];
  slug: string;
}) {
  return (
    <section id="propiedades" className="bg-zinc-50 py-14 md:py-18">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Destacadas
            </p>
            <h2 className="text-4xl font-black tracking-tight text-zinc-950">
              Propiedades disponibles y recientes
            </h2>
          </div>

          <Link href={`/${slug}/propiedades`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
              Ver listado completo
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ slug }: { slug: string }) {
  const steps = [
    [
      "Explora propiedades",
      "Recorre opciones en venta y alquiler según zona, precio y tipo de propiedad.",
    ],
    [
      "Revisa la ficha",
      "Mira fotos, ubicación, medidas, ambientes y detalles principales antes de consultar.",
    ],
    [
      "Solicita visita",
      "Deja tus datos y tu disponibilidad para que podamos coordinar contigo.",
    ],
  ];

  return (
    <section id="como-funciona" className="bg-white py-14 md:py-18">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Como funciona
          </p>
          <h2 className="text-4xl font-black tracking-tight text-zinc-950">
            Del primer vistazo a la visita, sin vueltas.
          </h2>
        </div>

        <div className="grid gap-px bg-zinc-200 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <div key={title} className="bg-white p-7">
              <span className="mb-8 inline-flex h-10 w-10 items-center justify-center bg-zinc-950 text-sm font-black text-white">
                {index + 1}
              </span>
              <h3 className="mb-3 text-xl font-black text-zinc-950">{title}</h3>
              <p className="text-sm leading-6 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href={`/${slug}/propiedades`}>
            <span className="inline-flex items-center gap-2 bg-zinc-950 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white">
              Ver propiedades
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SavedSearchSection({ slug }: { slug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<{
    operationType: "buy" | "rent" | "both";
    propertyType: string;
    zone: string;
    budget: string;
    bedrooms: "studio" | "1" | "2" | "3" | "4_plus" | "any";
    name: string;
    whatsapp: string;
    comments: string;
  }>({
    operationType: "buy" as "buy" | "rent" | "both",
    propertyType: savedSearchPropertyTypeOptions[0],
    zone: "",
    budget: "",
    bedrooms: "any" as "studio" | "1" | "2" | "3" | "4_plus" | "any",
    name: "",
    whatsapp: "",
    comments: "",
  });

  const createSavedSearch = trpc.savedSearches.create.useMutation({
    onSuccess: () => {
      setForm({
        operationType: "buy",
        propertyType: savedSearchPropertyTypeOptions[0],
        zone: "",
        budget: "",
        bedrooms: "any",
        name: "",
        whatsapp: "",
        comments: "",
      });
      setIsSubmitted(true);
      toast.success(
        "Búsqueda guardada. La inmobiliaria podrá contactarte cuando tenga una propiedad que coincida con lo que necesitás.",
      );
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos guardar la búsqueda");
    },
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.zone.trim() || !form.budget.trim() || !form.name.trim() || !form.whatsapp.trim()) {
      toast.error("Completa zona, presupuesto, nombre y WhatsApp.");
      return;
    }

    await createSavedSearch.mutateAsync({
      slug,
      operationType: form.operationType,
      propertyType: form.propertyType,
      zone: form.zone.trim(),
      budget: form.budget.trim(),
      bedrooms: form.bedrooms,
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      comments: form.comments.trim() || undefined,
    });
  }

  return (
    <section className="bg-zinc-50 py-14 md:py-18">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Tu búsqueda
            </p>
            <h2 className="text-4xl font-black tracking-tight text-zinc-950">
              ¿No encontraste lo que buscas?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              Dejanos tu búsqueda y te avisamos cuando tengamos una propiedad que se ajuste a lo
              que necesitás.
            </p>

            {!isOpen ? (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-6 inline-flex items-center gap-2 bg-zinc-950 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                Dejar mi búsqueda
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {isOpen ? (
            <div className="border border-zinc-200 bg-white p-6">
              {isSubmitted ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Búsqueda guardada
                  </p>
                  <p className="text-sm leading-7 text-zinc-600">
                    La inmobiliaria podrá contactarte cuando tenga una propiedad que coincida con
                    lo que necesitás.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex border border-zinc-200 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-700"
                  >
                    Cargar otra búsqueda
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Operación
                    <select
                      value={form.operationType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          operationType: event.target.value as "buy" | "rent" | "both",
                        }))
                      }
                      className="h-12 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950"
                    >
                      {savedSearchOperationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Tipo de propiedad
                    <select
                      value={form.propertyType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          propertyType: event.target.value,
                        }))
                      }
                      className="h-12 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950"
                    >
                      {savedSearchPropertyTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Zona
                    <input
                      value={form.zone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, zone: event.target.value }))
                      }
                      placeholder="Ej: Centro, Fisherton, Abasto..."
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Presupuesto
                    <input
                      value={form.budget}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, budget: event.target.value }))
                      }
                      placeholder="Ej: Hasta USD 100.000 / $500.000 mensual"
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Dormitorios
                    <select
                      value={form.bedrooms}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bedrooms: event.target.value as
                            | "studio"
                            | "1"
                            | "2"
                            | "3"
                            | "4_plus"
                            | "any",
                        }))
                      }
                      className="h-12 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950"
                    >
                      {savedSearchBedroomOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Nombre
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    WhatsApp
                    <input
                      value={form.whatsapp}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, whatsapp: event.target.value }))
                      }
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 md:col-span-2">
                    Comentarios
                    <textarea
                      value={form.comments}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, comments: event.target.value }))
                      }
                      rows={4}
                      className="resize-none border border-zinc-200 px-3 py-3 text-sm text-zinc-950 outline-none focus:border-zinc-950"
                    />
                  </label>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={createSavedSearch.isPending}
                      className="inline-flex items-center gap-2 bg-zinc-950 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Enviar búsqueda
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Contact({
  slug,
  businessName,
  address,
  phone,
  email,
  whatsapp,
}: {
  slug: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}) {
  return (
    <section id="contacto" className="bg-zinc-950 py-14 text-white md:py-18">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
            Contacto
          </p>
          <h2 className="text-4xl font-black tracking-tight">
            Coordinemos una visita a la propiedad que te interesa.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            Envíanos tus datos y tu disponibilidad. Si tenes una consulta
            puntual, también podes escribirnos por WhatsApp.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades`}>
              <span className="inline-flex items-center justify-center gap-2 bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
                Ver propiedades
                <HomeIcon className="h-4 w-4" />
              </span>
            </Link>
            <a
              href={whatsappHref(
                whatsapp,
                "Hola, quiero hacer una consulta sobre una propiedad.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white/80"
            >
              WhatsApp
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="border border-white/10 p-6">
          <div className="space-y-5 text-sm">
            <p className="flex items-start gap-3 text-white/70">
              <Building2 className="mt-0.5 h-4 w-4 text-white/35" />
              <span>{businessName}</span>
            </p>
            <p className="flex items-start gap-3 text-white/70">
              <MapPin className="mt-0.5 h-4 w-4 text-white/35" />
              <span>{address}</span>
            </p>
            <p className="text-white/45">{phone}</p>
            <p className="text-white/45">{email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({
  slug,
  businessName,
  instagram,
}: {
  slug: string;
  businessName: string;
  instagram: string;
}) {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
        <p className="font-bold text-zinc-950">{businessName}</p>
        <div className="flex flex-wrap gap-4">
          <Link href={`/${slug}/propiedades`}>Propiedades</Link>
          <a href={instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
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
            Si necesitas acceso, te conviene revisar el slug o entrar desde la administración central.
          </p>
        </div>
      </div>
    );
  }

  const businessName =
    publicProfile?.businessName?.trim() || realEstateProfile.name;
  const brandImageUrl =
    publicProfile?.logoUrl?.trim() ||
    publicProfile?.ownerImageUrl?.trim() ||
    null;
  const tagline =
    publicProfile?.tagline?.trim() ||
    "Propiedades claras para encontrar tu proximo lugar.";
  const description =
    publicProfile?.description?.trim() || realEstateProfile.description;
  const whatsapp = publicProfile?.whatsapp?.trim() || realEstateProfile.whatsapp;
  const phone = publicProfile?.phone?.trim() || realEstateProfile.phone;
  const email = publicProfile?.email?.trim() || realEstateProfile.email;
  const address = publicProfile?.address?.trim() || realEstateProfile.address;
  const instagram =
    publicProfile?.instagram?.trim() || realEstateProfile.instagram;
  const cityLabel = getCityLabel(address);
  const featuredProperties = properties
    .filter((property) => property.featured)
    .slice(0, 3);
  const featuredCards =
    featuredProperties.length > 0 ? featuredProperties : properties.slice(0, 3);
  const heroProperty = featuredProperties[0] ?? properties[0];
  const visibleCount = properties.length;

  return (
    <div className="min-h-screen bg-white">
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
      <ValueBlock />
      <FeaturedProperties properties={featuredCards} slug={slug} />
      <section className="bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            {visibleCount} propiedades publicadas entre venta, alquiler y
            operaciones recientes.
          </p>
          <Link href={`/${slug}/propiedades`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
              Ir al listado
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>
      <HowItWorks slug={slug} />
      <PublicSavedSearchSection slug={slug} />
      <Contact
        slug={slug}
        businessName={businessName}
        address={address}
        phone={phone}
        email={email}
        whatsapp={whatsapp}
      />
      <Footer slug={slug} businessName={businessName} instagram={instagram} />
    </div>
  );
}
