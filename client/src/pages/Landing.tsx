import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import {
  trackLandingEvent,
  trackLandingPageView,
  type LandingClickEventName,
} from "@/lib/marketingTracking";
import claraNutricionImage from "@/assets/demo-covers/clara-nutricion.png";
import norteBarberiaImage from "@/assets/demo-covers/norte-barberia.png";
import linaStudioImage from "@/assets/demo-covers/lina-studio.png";
import lunaBienestarImage from "@/assets/demo-covers/luna-bienestar.jpg";
import petvitalVeterinariaImage from "@/assets/demo-covers/petvital-veterinaria.png";
import valoraConsultoriaImage from "@/assets/demo-covers/valora-consultoria.jpg";

const DEMO_FONT = '"Plus Jakarta Sans", system-ui, sans-serif';
const checkoutHref =
  "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=40e2076459bb4a7b9a014282340aea3a";

const benefits = [
  {
    title: "Más orden desde el primer clic",
    body: "Servicios, precios y forma de atención claros en una sola página.",
  },
  {
    title: "Turnos online reales",
    body: "Tus clientes reservan sin depender de mensajes cruzados ni vueltas innecesarias.",
  },
  {
    title: "WhatsApp como apoyo, no como sistema",
    body: "Recibís avisos y recordatorios, pero dejás de usar el chat para explicar todo.",
  },
  {
    title: "Cobro directo, sin comisión",
    body: "Cobrás vos, en tu cuenta, sin perder margen por cada reserva.",
  },
];

const planIncludes = [
  "página profesional",
  "turnos online",
  "galería de fotos",
  "datos de contacto y de tu actividad",
  "recordatorios por WhatsApp",
  "aviso por WhatsApp cuando entra una reserva",
  "cobro directo en tu cuenta",
  "sin comisión por reserva",
];

const processSteps = [
  {
    n: "1",
    title: "Me escribís por WhatsApp",
    body: "Te respondo y te digo qué necesito para empezar.",
  },
  {
    n: "2",
    title: "Me pasás la información",
    body: "Servicios, textos, fotos, horarios y datos de contacto.",
  },
  {
    n: "3",
    title: "Armamos tu base inicial",
    body: "Dejamos tu página preparada para empezar a funcionar rápido.",
  },
  {
    n: "4",
    title: "La revisás",
    body: "Confirmás que todo esté claro y bien presentado.",
  },
  {
    n: "5",
    title: "La aprobás, abonás y la activamos",
    body: "Con el pago confirmado, tu página queda lista para usar.",
  },
];

const scopeIncludes = [
  "página profesional",
  "presentación clara de servicios",
  "reservas online",
  "cobro directo",
  "avisos automáticos",
  "datos de contacto visibles",
  "base inicial lista para empezar rápido",
  "panel simple para autogestionar contenido",
];

const scopeExcludes = [
  "desarrollo artesanal permanente",
  "gestión manual diaria por parte nuestra",
  "comisión por cada reserva",
  "integraciones complejas especiales",
  "cambios fuera del alcance del plan",
];

const demos = [
  {
    category: "Nutrición",
    title: "Clara Nutrición",
    body: "Una propuesta clara, cálida y profesional para mostrar servicios, agenda online y una atención cercana desde la primera visita.",
    href: "https://servicios.tienda-link.com/clara-nutricion",
    image: claraNutricionImage,
    featured: true,
    order: 1,
  },
  {
    category: "Barbería",
    title: "Norte Barbería",
    body: "Una demo con carácter, presencia visual firme y recorrido simple para negocios que quieren verse modernos, prolijos y fáciles de reservar.",
    href: "https://servicios.tienda-link.com/norte-barberia",
    image: norteBarberiaImage,
    featured: true,
    order: 2,
  },
  {
    category: "Belleza",
    title: "Lina Studio",
    body: "Una muestra suave, luminosa y cuidada para estudios de uñas, estética y servicios personales que buscan una imagen actual y confiable.",
    href: "https://servicios.tienda-link.com/lina-studio",
    image: linaStudioImage,
    featured: true,
    order: 3,
  },
  {
    category: "Bienestar",
    title: "Luna Bienestar",
    body: "Un ejemplo sobrio y cálido para servicios de bienestar que necesitan transmitir calma, profesionalismo y una reserva clara en una sola página.",
    href: "https://servicios.tienda-link.com/luna-bienestar",
    image: lunaBienestarImage,
    featured: true,
    order: 4,
  },
  {
    category: "Atención especializada",
    title: "PetVital Veterinaria",
    body: "Una muestra orientada al cuidado animal, con presencia profesional, cercanía y una forma simple de mostrar servicios y reservas.",
    href: "https://servicios.tienda-link.com/petvital-veterinaria",
    image: petvitalVeterinariaImage,
    featured: false,
    order: 5,
  },
  {
    category: "Profesionales",
    title: "Valora Consultoría",
    body: "Una demo pensada para profesionales que necesitan una imagen seria, ordenada y confiable para presentar su trabajo con claridad.",
    href: "https://servicios.tienda-link.com/valora-consultoria",
    image: valoraConsultoriaImage,
    featured: false,
    order: 6,
  },
];

const orderedDemos = [...demos].sort((a, b) => a.order - b.order);
const featuredDemos = orderedDemos.filter(demo => demo.featured);
const secondaryDemos = orderedDemos.filter(demo => !demo.featured);

type ContactLink = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  eventName?: LandingClickEventName;
  external?: boolean;
  secondaryLabel?: string;
  secondaryHref?: string;
};

const contactLinks: ContactLink[] = [
  {
  label: "WhatsApp",
  value: "+54 341 5634632",
  href: "https://wa.me/543415634632",
  icon: MessageCircle,
  eventName: "whatsapp_click",
  external: true,
},
  {
    label: "Instagram",
    value: "@tiendalink.ar",
    href: "https://www.instagram.com/tiendalink.ar/",
    icon: Instagram,
    eventName: "instagram_click",
    external: true,
  },
  {
    label: "Email",
    value: "tiendalinkok@gmail.com",
    href: "mailto:tiendalinkok@gmail.com",
    icon: Mail,
    eventName: "email_click",
  },
  {
    label: "Facebook",
    value: "Tienda Link",
    href: "https://www.facebook.com/profile.php?id=61577527286796",
    icon: Facebook,
    eventName: "facebook_click",
    external: true,
  },
];

const C = {
  hero: "#143a38",
  heroBorder: "#27524f",
  accent: "#2f6e69",
  accentSoft: "#eaf3f2",
  neutral900: "#09090b",
  neutral700: "#3f3f46",
  neutral600: "#52525b",
  neutral500: "#71717a",
  neutral300: "#d4d4d8",
  neutral200: "#e4e4e7",
  neutral100: "#f4f4f5",
  white: "#ffffff",
  softBg: "#fafafa",
};

const S = {
  eyebrow: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: C.neutral500,
    marginBottom: "14px",
  },
  h1: {
    fontSize: "clamp(42px, 6vw, 80px)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    color: C.white,
    margin: 0,
  },
  h1Muted: {
    color: "#8eb8b4",
  },
  h2: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    color: C.neutral900,
    margin: 0,
  },
  h2White: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    color: C.white,
    margin: 0,
  },
  h3: {
    fontSize: "15px",
    fontWeight: 650,
    color: C.neutral900,
    margin: 0,
  },
  body: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: C.neutral700,
    margin: 0,
  },
  bodySmall: {
    fontSize: "15px",
    lineHeight: 1.75,
    color: C.neutral600,
    margin: 0,
  },
  heroBody: {
    fontSize: "19px",
    lineHeight: 1.85,
    color: "#bfd2cf",
    margin: 0,
  },
  section: {
    borderBottom: `1px solid ${C.neutral100}`,
  },
  card: {
    background: C.white,
    border: `1px solid ${C.neutral300}`,
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 1px 2px rgba(9, 9, 11, 0.03)",
  },
  cardGray: {
    background: "#fcfcfd",
    border: `1px solid ${C.neutral200}`,
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 1px 2px rgba(9, 9, 11, 0.03)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: `1px solid ${C.heroBorder}`,
    borderRadius: "999px",
    padding: "6px 16px",
    marginBottom: "32px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#6fb0a8",
    flexShrink: 0,
  },
  badgeText: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#bfd2cf",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.white,
    color: C.neutral900,
    borderRadius: "999px",
    padding: "14px 28px",
    fontSize: "14px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: C.white,
    borderRadius: "999px",
    padding: "14px 28px",
    fontSize: "14px",
    fontWeight: 600,
    border: `1px solid ${C.heroBorder}`,
    cursor: "pointer",
    textDecoration: "none",
  },
  btnFinalCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.white,
    color: C.neutral900,
    borderRadius: "999px",
    padding: "16px 36px",
    fontSize: "15px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  },
  featureDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: C.accent,
    flexShrink: 0,
    marginTop: "7px",
  },
  contactCard: {
    marginTop: "42px",
    background: "rgba(255, 255, 255, 0.04)",
    border: `1px solid ${C.heroBorder}`,
    borderRadius: "24px",
    padding: "clamp(24px, 4vw, 32px)",
    textAlign: "left" as const,
  },
  contactHeading: {
    fontSize: "clamp(24px, 3vw, 30px)",
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: C.white,
    margin: 0,
  },
  contactIntro: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#bfd2cf",
    margin: 0,
  },
  contactRow: {
    display: "grid",
    gap: "12px",
    padding: "16px 0",
  },
  contactMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  contactIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#d4e2df",
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: "13px",
    fontWeight: 650,
    letterSpacing: "0.01em",
    color: "#d4e2df",
    margin: 0,
  },
  contactActions: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "14px",
    paddingLeft: "46px",
  },
  contactValue: {
    fontSize: "15px",
    fontWeight: 600,
    color: C.white,
    textDecoration: "none",
  },
  contactSecondary: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#a9c7c4",
    textDecoration: "none",
  },
  contactLocation: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
    paddingTop: "18px",
    borderTop: `1px solid ${C.heroBorder}`,
    fontSize: "13px",
    color: "#a9c7c4",
  },
} as const;

export default function Landing() {
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    if (hasTrackedPageView.current) return;

    hasTrackedPageView.current = true;
    trackLandingPageView();
  }, []);

  const handleTrackedClick = (
    eventName: LandingClickEventName,
    params?: Record<string, string>,
  ) => {
    return () => {
      trackLandingEvent(eventName, params);
    };
  };

  return (
    <main
      style={{ minHeight: "100vh", background: C.white, color: C.neutral900 }}
    >
      <section style={{ background: C.hero }}>
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding:
              "clamp(48px, 6vw, 84px) clamp(24px, 5vw, 64px) clamp(56px, 7vw, 88px)",
          }}
        >
          <div style={S.badge}>
            <span style={S.badgeDot} />
            <span style={S.badgeText}>Mini Web Servicios</span>
          </div>

          <h1 style={S.h1}>
            Tu servicio merece
            <br />
            <span style={S.h1Muted}>mostrarse mejor.</span>
          </h1>

          <p style={{ ...S.heroBody, maxWidth: "640px", marginTop: "30px" }}>
            Una mini web para mostrar lo que hacés, recibir turnos online,
            cobrar directo y trabajar con más orden. Sin comisión por reserva.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "36px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#plan"
              style={S.btnPrimary}
              onClick={handleTrackedClick("cta_primary_click", {
                placement: "hero",
                href: "#plan",
              })}
            >
              Ver plan
            </a>
            <a
              href="/como-funciona"
              style={S.btnSecondary}
              onClick={handleTrackedClick("how_it_works_click", {
                placement: "hero",
                href: "/como-funciona",
              })}
            >
              Cómo funciona
            </a>
            <a
              href="https://wa.me/5493415634632?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Mini%20Web%20Servicios"
              style={S.btnSecondary}
              onClick={handleTrackedClick("whatsapp_click", {
                placement: "hero",
                href: "https://wa.me/5493415634632?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Mini%20Web%20Servicios",
              })}
            >
              Escribinos por WhatsApp
            </a>
            <a href="https://tienda-link.com/" style={S.btnSecondary}>
              Ir a Tienda Link
            </a>
          </div>
          <p
            style={{
              ...S.bodySmall,
              color: "#a9c7c4",
              marginTop: "14px",
            }}
          >
            Desde $30.000/mes · Lista en menos de 24 hs hábiles
          </p>
        </div>
      </section>

      <section style={S.section}>
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "64px clamp(24px, 5vw, 64px) 56px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "56px",
            alignItems: "start",
          }}
        >
          <div>
            <p style={S.eyebrow}>Qué resuelve</p>
            <h2 style={S.h2}>
              Menos mensajes repetidos. Más turnos confirmados.
            </h2>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <p style={S.body}>
              Si hoy explicás horarios, servicios, ubicación y cómo reservar una
              y otra vez, estás perdiendo tiempo en tareas que la página puede
              resolver por vos.
            </p>
            <p style={S.body}>
              Mini Web Servicios junta todo en un solo lugar: muestra lo que
              hacés, permite tomar turnos online y te deja cobrar directo, sin
              comisión por reserva.
            </p>
          </div>
        </div>
      </section>

      <section style={{ ...S.section, background: C.softBg }}>
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "60px clamp(24px, 5vw, 64px)",
          }}
        >
          <p style={S.eyebrow}>Beneficios</p>
          <h2 style={{ ...S.h2, maxWidth: "560px", marginBottom: "40px" }}>
            Lo justo para mostrar mejor tu servicio y trabajar con más claridad
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {benefits.map(({ title, body }) => (
              <div key={title} style={S.card}>
                <h3 style={{ ...S.h3, marginBottom: "10px" }}>{title}</h3>
                <p style={S.bodySmall}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="demos"
        style={{
          ...S.section,
          background: "linear-gradient(180deg, #ffffff 0%, #fafcfc 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "68px clamp(24px, 5vw, 64px)",
            fontFamily: DEMO_FONT,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "14px",
              maxWidth: "780px",
              marginBottom: "34px",
            }}
          >
            <p style={S.eyebrow}>Demos reales</p>
            <h2 style={{ ...S.h2, maxWidth: "760px" }}>
              Mirá ejemplos publicados con una presentación más visual y
              comercial
            </h2>
            <p style={{ ...S.bodySmall, maxWidth: "760px" }}>
              Cuatro demos principales con mayor presencia visual y dos ejemplos
              complementarios para mostrar distintos rubros, tonos y estilos de
              presentación.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: "18px",
            }}
          >
            {featuredDemos.map(({ category, title, body, href, image }) => (
              <article
                key={title}
                style={{
                  background: C.white,
                  border: `1px solid ${C.neutral200}`,
                  borderRadius: "24px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 18px 40px -34px rgba(9, 9, 11, 0.24)",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16 / 10",
                    overflow: "hidden",
                    background: C.accentSoft,
                    borderBottom: `1px solid ${C.neutral200}`,
                  }}
                >
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "24px",
                    display: "grid",
                    gap: "18px",
                    flex: 1,
                  }}
                >
                  <div style={{ display: "grid", gap: "12px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        width: "fit-content",
                        alignItems: "center",
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background: C.accentSoft,
                        color: C.hero,
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {category}
                    </span>

                    <h3
                      style={{
                        fontSize: "clamp(24px, 2.8vw, 30px)",
                        lineHeight: 1.1,
                        fontWeight: 750,
                        letterSpacing: "-0.025em",
                        color: C.neutral900,
                        margin: 0,
                      }}
                    >
                      {title}
                    </h3>

                    <p
                      style={{
                        ...S.bodySmall,
                        fontSize: "15px",
                        lineHeight: 1.72,
                        color: C.neutral600,
                      }}
                    >
                      {body}
                    </p>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleTrackedClick("demo_click", {
                        placement: "featured_demo",
                        demo_title: title,
                        href,
                      })}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 22px",
                        borderRadius: "999px",
                        border: `1px solid ${C.hero}`,
                        background: C.hero,
                        color: C.white,
                        fontSize: "14px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Ver demo
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginTop: "28px",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.neutral500,
                whiteSpace: "nowrap",
              }}
            >
              Más ejemplos
            </span>
            <span
              style={{ flex: 1, height: "1px", background: C.neutral200 }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "18px",
            }}
          >
            {secondaryDemos.map(({ category, title, body, href, image }) => (
              <article
                key={title}
                style={{
                  background: "#fcfcfd",
                  border: `1px solid ${C.neutral200}`,
                  borderRadius: "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    background: C.neutral100,
                    borderBottom: `1px solid ${C.neutral200}`,
                  }}
                >
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "20px",
                    display: "grid",
                    gap: "14px",
                    flex: 1,
                  }}
                >
                  <div style={{ display: "grid", gap: "10px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        width: "fit-content",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background: C.white,
                        color: C.neutral700,
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        border: `1px solid ${C.neutral200}`,
                      }}
                    >
                      {category}
                    </span>

                    <h3
                      style={{
                        fontSize: "22px",
                        lineHeight: 1.15,
                        fontWeight: 720,
                        letterSpacing: "-0.02em",
                        color: C.neutral900,
                        margin: 0,
                      }}
                    >
                      {title}
                    </h3>

                    <p
                      style={{
                        ...S.bodySmall,
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      {body}
                    </p>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleTrackedClick("demo_click", {
                        placement: "secondary_demo",
                        demo_title: title,
                        href,
                      })}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "11px 18px",
                        borderRadius: "999px",
                        border: `1px solid ${C.neutral300}`,
                        background: C.white,
                        color: C.neutral900,
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Ver demo
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "60px clamp(24px, 5vw, 64px)",
          }}
        >
          <p style={S.eyebrow}>Cómo es el proceso</p>
          <h2 style={{ ...S.h2, maxWidth: "620px", marginBottom: "18px" }}>
            Una activación clara para dejar tu servicio listo para reservar y cobrar.
          </h2>
          <p
            style={{ ...S.bodySmall, maxWidth: "720px", marginBottom: "36px" }}
          >
            Primero armamos una base inicial con tus servicios y datos
            principales. La revisás, la aprobás, abonás y queda activa para usar.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {processSteps.map(({ n, title, body }) => (
              <div key={n} style={{ ...S.cardGray, padding: "24px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: C.hero,
                    color: C.white,
                    fontSize: "14px",
                    fontWeight: 800,
                    marginBottom: "18px",
                  }}
                >
                  {n}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    lineHeight: 1.12,
                    fontWeight: 750,
                    letterSpacing: "-0.02em",
                    color: C.neutral900,
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
                <p style={{ ...S.bodySmall, marginTop: "14px" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...S.section, background: C.softBg }}>
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "60px clamp(24px, 5vw, 64px)",
          }}
        >
          <p style={S.eyebrow}>Qué incluye / Qué no incluye</p>
          <h2 style={{ ...S.h2, maxWidth: "720px", marginBottom: "18px" }}>
            Lo que viene listo y lo que no forma parte de Servicios.
          </h2>
          <p
            style={{ ...S.bodySmall, maxWidth: "720px", marginBottom: "36px" }}
          >
            Así queda claro qué recibís desde el inicio y qué queda fuera del
            alcance de esta página de servicios.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={S.card}>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 750,
                  letterSpacing: "-0.02em",
                  color: C.neutral900,
                  margin: 0,
                }}
              >
                Incluye
              </h3>
              <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
                {scopeIncludes.map(item => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <span style={S.featureDot} />
                    <p style={S.bodySmall}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...S.cardGray, background: C.accentSoft }}>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 750,
                  letterSpacing: "-0.02em",
                  color: C.neutral900,
                  margin: 0,
                }}
              >
                No incluye
              </h3>
              <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
                {scopeExcludes.map(item => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <span style={S.featureDot} />
                    <p style={S.bodySmall}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plan" style={S.section}>
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "60px clamp(24px, 5vw, 64px)",
          }}
        >
          <p style={S.eyebrow}>Plan y precio</p>
          <h2 style={{ ...S.h2, marginBottom: "12px" }}>
            Un solo plan para empezar a ordenar y cobrar mejor.
          </h2>
          <p
            style={{ ...S.bodySmall, maxWidth: "620px", marginBottom: "40px" }}
          >
            Todo lo necesario para mostrar tus servicios, tomar turnos online y
            cobrar directo sin perder margen.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "20px",
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                ...S.card,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: C.neutral500,
                    margin: 0,
                  }}
                >
                  Mini Web Servicios
                </p>

                <p
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: C.neutral900,
                    margin: "16px 0 0",
                  }}
                >
                  Una mini web para mostrar, reservar y cobrar sin desorden
                </p>

                <p
                  style={{
                    fontSize: "40px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    color: C.neutral900,
                    margin: "18px 0 0",
                  }}
                >
                  $30.000 / mes
                </p>

                <p style={{ ...S.bodySmall, marginTop: "18px" }}>
                  Armado inicial incluido, turnos online y cobro directo en tu
                  cuenta. Sin comisión por reserva.
                </p>

                <div
                  style={{ display: "grid", gap: "12px", marginTop: "22px" }}
                >
                  {planIncludes.map(item => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <span style={S.featureDot} />
                      <p style={S.bodySmall}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "28px" }}>
                <a
                  href={checkoutHref}
                  onClick={handleTrackedClick("payment_click", {
                    placement: "plan",
                    href: checkoutHref,
                  })}
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    background: C.hero,
                    color: C.white,
                    borderRadius: "12px",
                    padding: "14px 18px",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: `1px solid ${C.hero}`,
                    textDecoration: "none",
                    boxShadow: "0 1px 2px rgba(9, 9, 11, 0.08)",
                  }}
                >
                  Quiero mi página
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        style={{ background: C.hero, scrollMarginTop: "96px" }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "clamp(48px, 6vw, 72px) clamp(24px, 5vw, 64px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${C.heroBorder}`,
              borderRadius: "999px",
              padding: "8px 16px",
              marginBottom: "22px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#d4e2df",
                margin: 0,
              }}
            >
              Empezá hoy
            </p>
          </div>

          <h2 style={S.h2White}>
            Ordená tus turnos y cobrá mejor desde tu propia página.
          </h2>

          <p
            style={{ ...S.heroBody, maxWidth: "520px", margin: "18px auto 0" }}
          >
            Mostrá lo que hacés, recibí reservas online y dejá de perder tiempo
            en mensajes repetidos. Sin comisión por reserva.
          </p>

          <div
            style={{
              marginTop: "34px",
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <a
              href={checkoutHref}
              onClick={handleTrackedClick("payment_click", {
                placement: "final_cta",
                href: checkoutHref,
              })}
              style={S.btnFinalCta}
            >
              Quiero mi página de servicios
            </a>
          </div>

          <div style={S.contactCard}>
            <div
              style={{
                display: "grid",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <h3 style={S.contactHeading}>
                ¿Querés consultarnos antes de avanzar?
              </h3>
              <p style={S.contactIntro}>
                Escribinos por WhatsApp o encontranos en nuestras redes.
              </p>
            </div>

            <div>
              {contactLinks.map(
                (
                  {
                    label,
                    value,
                    href,
                    icon: Icon,
                    eventName,
                    external,
                    secondaryLabel,
                    secondaryHref,
                  },
                  index,
                ) => (
                  <div
                    key={label}
                    style={{
                      ...S.contactRow,
                      borderTop:
                        index === 0 ? "none" : `1px solid ${C.heroBorder}`,
                    }}
                  >
                    <div style={S.contactMeta}>
                      <span style={S.contactIcon}>
                        <Icon size={16} strokeWidth={2} />
                      </span>
                      <p style={S.contactLabel}>{label}</p>
                    </div>

                    <div style={S.contactActions}>
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        onClick={
                          eventName
                            ? handleTrackedClick(eventName, {
                                placement: "contact",
                                href,
                              })
                            : undefined
                        }
                        style={S.contactValue}
                      >
                        {value}
                      </a>

                      {secondaryHref ? (
                        <a href={secondaryHref} style={S.contactSecondary}>
                          {secondaryLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ),
              )}
            </div>

            <p style={S.contactLocation}>
              <MapPin size={15} strokeWidth={2} />
              Rosario, Santa Fe, Argentina
            </p>
          </div>
        </div>
      </section>

      <footer
        style={{ background: C.hero, borderTop: `1px solid ${C.heroBorder}` }}
      >
        <div
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "28px clamp(24px, 5vw, 64px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#c7d7d5",
              margin: 0,
            }}
          >
            Mini Web Servicios
          </p>
          <p style={{ fontSize: "14px", color: "#8eb8b4", margin: 0 }}>
            Página propia, turnos online y WhatsApp como apoyo real.
          </p>
        </div>
      </footer>
    </main>
  );
}
