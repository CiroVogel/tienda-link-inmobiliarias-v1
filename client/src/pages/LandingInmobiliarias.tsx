import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Instagram,
  LayoutPanelLeft,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import demoMainImage from "@/assets/real-estate-landing/clave-urbana-demo-main.png";
import demoListImage from "@/assets/real-estate-landing/clave-urbana-listado.png";
import demoDetailImage from "@/assets/real-estate-landing/clave-urbana-ficha.png";

const whatsappHref =
  "https://wa.me/543415634632?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Mini%20Web%20Inmobiliarias";

const sections = {
  problem: "problema",
  difference: "diferencia",
  tools: "herramientas",
  demos: "demos",
  process: "como-funciona",
  scope: "transparencia",
  plan: "plan",
  contact: "contacto",
};

const palette = {
  ink: "#0b0b0d",
  inkSoft: "#121316",
  hero: "#0b0b0d",
  heroDeep: "#23282f",
  heroSoft: "#eceff1",
  offWhite: "#f8f6f3",
  soft: "#f2efea",
  line: "#e7e1da",
  text: "#49423d",
  muted: "#756d67",
  white: "#ffffff",
};

const differenceCards = [
  {
    title: "Tu marca, sin competencia al lado",
    body: "Tus propiedades aparecen dentro de tu propia página, con tu nombre, tu estilo y tus datos de contacto.",
  },
  {
    title: "Consultas directas",
    body: "El interesado consulta desde tu web y queda registrado de forma más ordenada.",
  },
  {
    title: "Búsquedas recibidas",
    body: "Si alguien no encuentra lo que busca, deja su pedido. Recibís zona, presupuesto, tipo de propiedad y WhatsApp.",
  },
  {
    title: "Mensualidad fija",
    body: "Pagás lo mismo todos los meses. Sin comisión por publicación ni por consultas recibidas.",
  },
];

const toolCards = [
  {
    icon: FileText,
    title: "Ficha en PDF para enviar",
    body: "Generá una ficha profesional de cada propiedad y compartila por WhatsApp o email sin armar nada a mano.",
  },
  {
    icon: Users,
    title: "Base de interesados",
    body: "Cada consulta queda registrada con datos de contacto, propiedad consultada, estado y notas internas.",
  },
  {
    icon: Search,
    title: "Búsquedas recibidas",
    body: "Capturá demanda aunque no tengas la propiedad publicada. El interesado deja lo que busca y vos lo seguís desde el panel.",
  },
  {
    icon: LayoutPanelLeft,
    title: "Panel simple",
    body: "Administrás propiedades, fotos, estados, consultas e interesados desde una pantalla clara.",
  },
];

const demoCards = [
  {
    label: "Demo principal",
    title: "Clave Urbana Propiedades",
    body: "Sobria, clara y profesional. Propiedades, contacto y marca propia sin distracciones.",
    image: demoMainImage,
    href: "/clave-urbana-propiedades",
    cta: "Ver demo",
    featured: true,
    live: true,
  },
  {
    label: "Próximamente",
    title: "Nueva demo en preparación",
    body: "Espacio reservado para una segunda inmobiliaria publicada dentro de la línea Inmobiliarias.",
    image: demoListImage,
    href: "#",
    cta: "Próximamente",
    featured: false,
    live: false,
  },
  {
    label: "Próximamente",
    title: "Tercera demo futura",
    body: "Otra muestra preparada para presentar una inmobiliaria con el mismo criterio visual y comercial.",
    image: demoDetailImage,
    href: "#",
    cta: "Próximamente",
    featured: false,
    live: false,
  },
];

const processSteps = [
  {
    n: "1",
    title: "Me escribís por WhatsApp",
    body: "Te respondo y te digo qué información necesito para empezar.",
  },
  {
    n: "2",
    title: "Pasás los datos",
    body: "Nombre de la inmobiliaria, contacto, imágenes, propiedades iniciales y textos básicos.",
  },
  {
    n: "3",
    title: "Armamos la base",
    body: "Preparamos tu mini web con estructura inicial y datos cargados.",
  },
  {
    n: "4",
    title: "La revisás",
    body: "Ves cómo queda antes de activarla como página de trabajo.",
  },
  {
    n: "5",
    title: "La activamos",
    body: "Tu inmobiliaria queda lista para mostrar propiedades y recibir consultas.",
  },
];

const includes = [
  "Página profesional con tu marca",
  "Listado de propiedades con filtros",
  "Ficha individual por propiedad",
  "Galería de fotos por propiedad",
  "Formulario de consulta por propiedad",
  "Estados de propiedad",
  "PDF descargable por propiedad",
  "Base de interesados con notas",
  "Búsquedas recibidas",
  "Panel de autogestión",
  "Contacto directo visible",
];

const excludes = [
  "Portal multi-inmobiliaria",
  "Marketplace de propiedades",
  "Cobro online integrado",
  "CRM complejo",
  "Desarrollo a medida permanente",
  "Publicidad paga incluida",
];

const planItems = [
  "Página profesional con tu marca",
  "Listado de propiedades",
  "Ficha individual con galería",
  "Formulario de consulta",
  "PDF descargable por propiedad",
  "Base de interesados",
  "Búsquedas recibidas",
  "Panel de autogestión",
  "Contacto directo",
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.muted }}>
      {children}
    </p>
  );
}

function HeroButton({
  href,
  children,
  primary = false,
  external = false,
}: {
  href: string;
  children: string;
  primary?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition ${
        primary ? "text-zinc-950" : "border text-white hover:bg-white/10"
      }`}
      style={
        primary
          ? { backgroundColor: palette.white, border: `1px solid ${palette.white}` }
          : { borderColor: "rgba(255,255,255,0.18)" }
      }
    >
      {children}
    </a>
  );
}

function DemoCard({ demo }: { demo: (typeof demoCards)[number] }) {
  return (
    <article
      className={`overflow-hidden rounded-[28px] border bg-white ${demo.featured ? "lg:col-span-2" : ""}`}
      style={{
        borderColor: palette.line,
        boxShadow: "0 18px 42px rgba(11, 11, 13, 0.05)",
      }}
    >
      <div
        className={demo.featured ? "aspect-[16/8.25]" : "aspect-[16/9.5]"}
        style={{ backgroundColor: palette.soft }}
      >
        <img
          src={demo.image}
          alt={demo.title}
          className={`h-full w-full ${demo.featured ? "object-cover object-top" : "object-cover object-top"}`}
        />
      </div>

      <div className={demo.featured ? "grid gap-5 px-7 py-7 md:grid-cols-[1.15fr_0.85fr]" : "grid gap-4 p-6"}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.muted }}>
            {demo.label}
          </p>
          <h3 className={`${demo.featured ? "mt-3 text-[2rem]" : "mt-3 text-2xl"} font-black tracking-tight text-zinc-950`}>
            {demo.title}
          </h3>
          <p className="mt-3 text-sm leading-7" style={{ color: palette.text }}>
            {demo.body}
          </p>
        </div>

        <div className={`flex ${demo.featured ? "items-end justify-start md:justify-end" : "items-end"}`}>
          {demo.live ? (
            <a
              href={demo.href}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white"
              style={{ backgroundColor: palette.hero }}
            >
              {demo.cta}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <span
              className="inline-flex items-center rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.16em]"
              style={{ borderColor: palette.line, color: palette.muted }}
            >
              {demo.cta}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 py-4">
      <div
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border"
        style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        <Icon className="h-4 w-4 text-white/74" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{label}</p>
        <p className="mt-2 text-sm leading-7 text-white/82">{value}</p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block transition hover:opacity-90">
      {content}
    </a>
  );
}

export default function LandingInmobiliarias() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section style={{ backgroundColor: palette.hero, color: palette.white }}>
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 lg:pb-28 lg:pt-8" style={{ minHeight: "100vh" }}>
          <div className="max-w-4xl">
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: "rgba(255,255,255,0.18)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.85)" }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                MINI WEB INMOBILIARIA
              </span>
            </div>

            <h1 className="max-w-[11.5ch] text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-[5.35rem]">
              <span className="block text-white">Tu inmobiliaria</span>
              <span className="block text-white/68">no necesita compartir la pantalla.</span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/84">
              Una mini web propia para mostrar tus propiedades con tu marca, recibir consultas directas y captar
              búsquedas de personas que todavía no encontraron lo que necesitan.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <HeroButton href={`#${sections.plan}`} primary>
                Ver plan
              </HeroButton>
              <HeroButton href={`#${sections.process}`}>Cómo funciona</HeroButton>
              <HeroButton href={whatsappHref} external>
                Escribinos por WhatsApp
              </HeroButton>
            </div>

            <p className="mt-6 text-sm text-white/64">
              Desde $35.000/mes · Lista en menos de 24 hs hábiles · Sin comisión por publicación
            </p>
          </div>
        </div>
      </section>

      <section id={sections.problem} className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionLabel>EL PROBLEMA</SectionLabel>
            <h2 className="max-w-2xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              Publicar en un listado gigante reparte la atención de tu cliente.
            </h2>
          </div>
          <div className="grid gap-5">
            <p className="text-base leading-8" style={{ color: palette.text }}>
              Cuando una propiedad aparece junto a muchas opciones similares, el interesado compara antes de escribir.
              Tu marca queda mezclada, la atención se dispersa y muchas oportunidades se pierden antes de llegar a una
              consulta real.
            </p>
            <p className="text-base leading-8" style={{ color: palette.text }}>
              Y si no tenés justo lo que la persona busca, normalmente no queda ningún registro útil: ni contacto, ni
              presupuesto, ni zona buscada.
            </p>
          </div>
        </div>
      </section>

      <section
        id={sections.difference}
        className="border-b"
        style={{ borderColor: palette.line, backgroundColor: palette.offWhite }}
      >
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionLabel>LA DIFERENCIA</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Con Tienda Link, tu cliente ve tu marca.
Y si no encuentra la propiedad ideal, puede dejar su búsqueda.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {differenceCards.map((card) => (
              <article key={card.title} className="rounded-[26px] border bg-white p-6" style={{ borderColor: palette.line }}>
                <h3 className="text-xl font-black tracking-tight text-zinc-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: palette.text }}>
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id={sections.tools} className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionLabel>HERRAMIENTAS</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Tu página no solo muestra propiedades. También te ayuda a trabajar mejor.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {toolCards.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-[26px] border p-6"
                style={{ borderColor: palette.line, backgroundColor: palette.offWhite }}
              >
                <div
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.heroSoft, color: palette.heroDeep }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-zinc-950">{title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: palette.text }}>
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id={sections.demos}
        className="border-b"
        style={{ borderColor: palette.line, backgroundColor: "#f5f1ed" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionLabel>DEMOS REALES</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Mirá cómo se ve una inmobiliaria con página propia.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8" style={{ color: palette.text }}>
            Demos pensadas para mostrar propiedades sin compartir espacio con otras marcas.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <DemoCard demo={demoCards[0]} />
            <DemoCard demo={demoCards[1]} />
            <DemoCard demo={demoCards[2]} />
          </div>
        </div>
      </section>

      <section id={sections.process} className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionLabel>CÓMO FUNCIONA</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            De la información inicial a tu página lista.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {processSteps.map((step) => (
              <article
                key={step.n}
                className="rounded-[26px] border p-6"
                style={{ borderColor: palette.line, backgroundColor: palette.offWhite }}
              >
                <span
                  className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ backgroundColor: palette.hero }}
                >
                  {step.n}
                </span>
                <h3 className="text-xl font-black tracking-tight text-zinc-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: palette.text }}>
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id={sections.scope}
        className="border-b"
        style={{ borderColor: palette.line, backgroundColor: palette.offWhite }}
      >
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionLabel>TRANSPARENCIA</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Lo que viene listo y lo que no forma parte del servicio.
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[28px] border bg-white p-7" style={{ borderColor: palette.line }}>
              <h3 className="text-2xl font-black tracking-tight text-zinc-950">Incluye</h3>
              <ul className="mt-5 grid gap-3 text-sm leading-7" style={{ color: palette.text }}>
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color: palette.hero }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[28px] border p-7" style={{ borderColor: palette.line, backgroundColor: "#f1f3f2" }}>
              <h3 className="text-2xl font-black tracking-tight text-zinc-950">No incluye</h3>
              <ul className="mt-5 grid gap-3 text-sm leading-7" style={{ color: palette.text }}>
                {excludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: palette.hero }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id={sections.plan} className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionLabel>PLAN Y PRECIO</SectionLabel>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
            Un solo plan. Todo incluido. Sin comisiones ni sorpresas.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8" style={{ color: palette.text }}>
            Una mini web para mostrar propiedades, recibir consultas y capturar búsquedas sin depender de una estructura pesada.
          </p>

          <div className="mt-10 max-w-3xl rounded-[30px] border bg-white p-7 sm:p-8" style={{ borderColor: palette.line }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.muted }}>
              MINI WEB INMOBILIARIAS
            </p>
            <h3 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-zinc-950">
              Una mini web para mostrar propiedades, recibir consultas y capturar búsquedas sin depender de una estructura pesada.
            </h3>
            <p className="mt-6 text-5xl font-black tracking-tight text-zinc-950">$35.000 / mes</p>
            <p className="mt-3 text-sm" style={{ color: palette.muted }}>
              Armado inicial incluido · Sin comisión por publicación · Sin límite de consultas
            </p>

            <ul className="mt-8 grid gap-3 text-sm leading-7" style={{ color: palette.text }}>
              {planItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color: palette.hero }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-95"
              style={{ backgroundColor: palette.hero }}
            >
              Quiero mi página
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id={sections.contact} style={{ backgroundColor: palette.ink, color: palette.white }}>
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              EMPEZÁ HOY
            </p>
            <h2 className="mt-8 text-4xl font-black tracking-tight text-white md:text-5xl">
              Tu inmobiliaria merece una página propia.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/70">
              Mostrá tus propiedades con tu marca, recibí consultas directas y capturá búsquedas que de otra forma se pierden.
            </p>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-zinc-950 transition hover:opacity-95"
              style={{ backgroundColor: palette.white }}
            >
              Quiero mi página de inmobiliaria
            </a>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionLabel>CONTACTO</SectionLabel>
              <h3 className="max-w-xl text-3xl font-black tracking-tight text-white md:text-4xl">
                ¿Querés consultarnos antes de avanzar?
              </h3>
              <p className="mt-4 max-w-lg text-base leading-8 text-white/66">
                Escribinos por WhatsApp o encontranos en nuestros canales para resolver dudas antes de activar tu página.
              </p>
            </div>

            <div
              className="rounded-[30px] border p-7"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <ContactRow icon={MessageCircle} label="WhatsApp" value="+54 341 563 4632" href="https://wa.me/543415634632" />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
              <ContactRow icon={Instagram} label="Instagram" value="@tiendalink.ar" href="https://instagram.com/tiendalink.ar" />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
              <ContactRow icon={Mail} label="Email" value="tiendalinkok@gmail.com" href="mailto:tiendalinkok@gmail.com" />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
              <ContactRow icon={MapPin} label="Ubicación" value="Rosario, Santa Fe, Argentina" />
            </div>
          </div>
        </div>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <p className="text-sm font-black text-white">Tienda Link</p>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/54">
                Una marca paraguas con líneas claras para mostrar, vender o trabajar con más orden online.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">Líneas</p>
              <ul className="mt-4 grid gap-3 text-sm text-white/68">
                <li>Tienda Mini</li>
                <li>Comercio</li>
                <li>Servicios</li>
                <li>Inmobiliarias</li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">Ruta</p>
              <ul className="mt-4 grid gap-3 text-sm text-white/68">
                <li><a href={`#${sections.demos}`}>Demos reales</a></li>
                <li><a href={`#${sections.process}`}>Cómo funciona</a></li>
                <li><a href={`#${sections.plan}`}>Plan y precio</a></li>
                <li><a href={`#${sections.contact}`}>Contacto</a></li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">Contacto</p>
              <ul className="mt-4 grid gap-3 text-sm text-white/68">
                <li>WhatsApp<br /><span className="text-white/54">+54 341 563 4632</span></li>
                <li>Instagram<br /><span className="text-white/54">@tiendalink.ar</span></li>
                <li>Email<br /><span className="text-white/54">tiendalinkok@gmail.com</span></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between">
              <span>Mini Web Inmobiliarias</span>
              <span>Páginas propias, consultas directas y búsquedas recibidas.</span>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
