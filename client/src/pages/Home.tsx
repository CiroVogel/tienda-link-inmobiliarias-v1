import { ArrowRight, Building2, CheckCircle2, HomeIcon, MapPin, MessageCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import {
  getFeaturedProperties,
  getVisibleProperties,
  realEstateProfile,
} from "@/lib/realEstateDemo";

type HomeProps = {
  forcedSlug?: string;
};

function whatsappHref(message: string) {
  return `https://wa.me/${realEstateProfile.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

function Header({ slug }: { slug: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href={`/${slug}`}>
          <span className="block whitespace-nowrap text-[11px] font-black uppercase tracking-[0.1em] text-zinc-950 sm:text-sm sm:tracking-[0.18em]">
            {realEstateProfile.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 md:flex">
          <Link href={`/${slug}/propiedades`}>Propiedades</Link>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <Link href={`/${slug}/propiedades`}>
          <span className="hidden bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white sm:inline-flex">
            Ver propiedades
          </span>
        </Link>
      </div>
    </header>
  );
}

function Hero({ slug }: { slug: string }) {
  const featured = getFeaturedProperties()[0];

  return (
    <section className="overflow-hidden bg-zinc-950 text-white">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-end gap-10 px-5 py-10 md:grid-cols-[1fr_0.9fr] md:py-14">
        <div className="min-w-0 pb-4 md:pb-10">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/45">
            Inmobiliaria urbana en {realEstateProfile.city}
          </p>

          <h1 className="max-w-3xl break-words text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Propiedades claras para encontrar tu proximo lugar.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/62">
            Departamentos, casas y espacios comerciales en Rosario y alrededores.
            Recorre opciones en venta y alquiler, revisa cada ficha y solicita
            una visita cuando una propiedad te interese.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades`}>
              <span className="inline-flex items-center justify-center gap-2 bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
                Ver propiedades
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <a
              href={whatsappHref("Hola, quiero consultar por propiedades de Clave Urbana.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-white/60 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {featured ? (
          <div className="relative mb-2 min-w-0 overflow-hidden border border-white/10 bg-white/5 md:mb-10">
            <img
              src={featured.images[0]}
              alt={featured.title}
              className="aspect-[4/5] h-full w-full max-w-full object-cover opacity-95"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                Destacada
              </p>
              <p className="text-xl font-black">{featured.title}</p>
              <p className="mt-1 text-sm text-white/65">{featured.location}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ValueBlock() {
  const values = [
    "Precio, zona, operacion y estado visibles desde el primer vistazo.",
    "Fotos, medidas y caracteristicas reunidas para comparar con calma.",
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
            Informacion ordenada para elegir la proxima visita.
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

function FeaturedProperties({ slug }: { slug: string }) {
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
          {getFeaturedProperties().map((property) => (
            <PropertyCard key={property.id} property={property} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ slug }: { slug: string }) {
  const steps = [
    ["Explorá propiedades", "Recorré opciones en venta y alquiler según zona, precio y tipo de propiedad."],
    ["Revisá la ficha", "Mirá fotos, ubicación, medidas, ambientes y detalles principales antes de consultar."],
    ["Solicitá visita", "Dejá tus datos y una fecha preferida para que podamos coordinar contigo."],
  ];

  return (
    <section id="como-funciona" className="bg-white py-14 md:py-18">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Cómo funciona
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

function Contact({ slug }: { slug: string }) {
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
            Envianos tus datos y una fecha preferida. Si tenes una consulta
            puntual, tambien podes escribirnos por WhatsApp.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}/propiedades`}>
              <span className="inline-flex items-center justify-center gap-2 bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
                Ver propiedades
                <HomeIcon className="h-4 w-4" />
              </span>
            </Link>
            <a
              href={whatsappHref("Hola, quiero hacer una consulta sobre una propiedad.")}
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
              <span>{realEstateProfile.name}</span>
            </p>
            <p className="flex items-start gap-3 text-white/70">
              <MapPin className="mt-0.5 h-4 w-4 text-white/35" />
              <span>{realEstateProfile.address}</span>
            </p>
            <p className="text-white/45">{realEstateProfile.phone}</p>
            <p className="text-white/45">{realEstateProfile.email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ slug }: { slug: string }) {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
        <p className="font-bold text-zinc-950">{realEstateProfile.name}</p>
        <div className="flex flex-wrap gap-4">
          <Link href={`/${slug}/propiedades`}>Propiedades</Link>
          <a href={realEstateProfile.instagram} target="_blank" rel="noreferrer">
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
  const visibleCount = getVisibleProperties().length;

  return (
    <div className="min-h-screen bg-white">
      <Header slug={slug} />
      <Hero slug={slug} />
      <ValueBlock />
      <FeaturedProperties slug={slug} />
      <section className="bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            {visibleCount} propiedades publicadas entre venta, alquiler y operaciones recientes.
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
      <Contact slug={slug} />
      <Footer slug={slug} />
    </div>
  );
}
