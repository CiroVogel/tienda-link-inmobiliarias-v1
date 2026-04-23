const checkoutHref =
  "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=40e2076459bb4a7b9a014282340aea3a";

const steps = [
  {
    step: "01",
    title: "Activás el plan",
    body:
      "Confirmás el alta y compartís la información base necesaria para arrancar sin vueltas ni procesos largos.",
  },
  {
    step: "02",
    title: "Queda una base inicial lista",
    body:
      "Publicamos una primera versión clara con tus datos principales para que tu mini web empiece a funcionar rápido.",
  },
  {
    step: "03",
    title: "Gestionás tu contenido de forma simple",
    body:
      "Después podés ajustar servicios, fotos, textos, horarios y datos desde un panel pensado para autogestión.",
  },
  {
    step: "04",
    title: "Recibís reservas y cobrás directo",
    body:
      "Tus clientes reservan online, vos recibís avisos automáticos y el cobro entra directo en tu cuenta.",
  },
];

const includes = [
  "página única y profesional",
  "reservas online",
  "cobro directo en tu cuenta",
  "sin comisión por reserva",
  "avisos automáticos cuando entra una reserva",
  "recordatorios automáticos",
  "base inicial clara para empezar",
  "panel simple para autogestionar servicios, fotos y datos",
];

const notIncluded = [
  "desarrollo artesanal distinto para cada cliente",
  "carga manual completa y permanente de todo tu contenido",
  "gestión uno a uno de cada cambio cotidiano",
  "intermediación en tus cobros",
  "comisión por cada reserva",
];

const keyFacts = [
  {
    title: "Tiempo de activación",
    body:
      "Menos de 24 hs hábiles desde que el alta está confirmada y contamos con la información base necesaria.",
  },
  {
    title: "Forma de pago",
    body:
      "Plan mensual de $30.000. Cobrás directo en tu cuenta y no pagás comisión por reserva.",
  },
  {
    title: "Para quién sirve",
    body:
      "Profesionales y negocios de servicios que necesitan mostrar lo que hacen, tomar reservas y cobrar con más orden.",
  },
];

const benefits = [
  {
    title: "Una sola página, más claridad",
    body:
      "Servicios, precios, datos y forma de reserva ordenados en un único lugar.",
  },
  {
    title: "Reservas online reales",
    body:
      "Tus clientes reservan sin depender de mensajes cruzados para cada turno.",
  },
  {
    title: "Cobro directo, sin comisión",
    body: "El dinero entra en tu cuenta y mantenés tu margen completo.",
  },
  {
    title: "Avisos automáticos",
    body:
      "Recibís notificaciones y recordatorios sin tener que estar persiguiendo cada reserva.",
  },
  {
    title: "Base inicial lista",
    body:
      "Empezás rápido con una estructura clara en lugar de arrancar desde cero.",
  },
  {
    title: "Autogestión simple",
    body:
      "Después podés mantener tu mini web al día sin convertir cada cambio en un pedido manual.",
  },
];

const quickSummary = [
  "página profesional",
  "reservas online",
  "cobro directo",
  "sin comisión por reserva",
  "avisos automáticos",
  "autogestión simple",
];

const C = {
  background: "#f6f5f2",
  panel: "#ffffff",
  panelMuted: "#f1efea",
  line: "#dedbd2",
  ink: "#121212",
  text: "#3b3b38",
  muted: "#70706c",
};

const S = {
  page: {
    minHeight: "100vh",
    background: C.background,
    color: C.ink,
  },
  section: {
    borderBottom: `1px solid ${C.line}`,
  },
  shell: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "0 clamp(24px, 5vw, 64px)",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: C.muted,
    margin: 0,
  },
  h1: {
    fontSize: "clamp(2.3rem, 5vw, 4.2rem)",
    fontWeight: 400,
    lineHeight: 1.02,
    letterSpacing: "-0.04em",
    color: C.ink,
    margin: 0,
    maxWidth: "860px",
  },
  h2: {
    fontSize: "clamp(28px, 4vw, 46px)",
    fontWeight: 750,
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    color: C.ink,
    margin: 0,
  },
  h3: {
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: 1.15,
    color: C.ink,
    margin: 0,
  },
  body: {
    fontSize: "17px",
    lineHeight: 1.82,
    color: C.text,
    margin: 0,
  },
  bodySmall: {
    fontSize: "15px",
    lineHeight: 1.72,
    color: C.text,
    margin: 0,
  },
  card: {
    background: C.panel,
    border: `1px solid ${C.line}`,
    borderRadius: "8px",
    padding: "28px",
  },
  cardMuted: {
    background: C.panelMuted,
    border: `1px solid ${C.line}`,
    borderRadius: "8px",
    padding: "28px",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.ink,
    color: C.panel,
    borderRadius: "999px",
    padding: "15px 28px",
    fontSize: "14px",
    fontWeight: 700,
    border: `1px solid ${C.ink}`,
    textDecoration: "none",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: C.ink,
    borderRadius: "999px",
    padding: "15px 28px",
    fontSize: "14px",
    fontWeight: 700,
    border: `1px solid ${C.line}`,
    textDecoration: "none",
  },
  itemDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: C.ink,
    flexShrink: 0,
    marginTop: "9px",
  },
};

export default function ComoFunciona() {
  return (
    <main style={S.page}>
      <section style={S.section}>
        <div style={{ ...S.shell, paddingTop: "30px", paddingBottom: "40px" }}>
          <a
            href="/"
            style={{
              ...S.eyebrow,
              display: "inline-flex",
              textDecoration: "none",
              marginBottom: "34px",
            }}
          >
            Mini Web Servicios
          </a>

          <div style={{ maxWidth: "860px" }}>
            <p style={{ ...S.eyebrow, marginBottom: "18px" }}>Cómo funciona</p>

            <h1 style={S.h1}>
              Una forma clara de mostrar tu servicio, tomar reservas y cobrar
              mejor.
            </h1>

            <p style={{ ...S.body, maxWidth: "720px", marginTop: "28px" }}>
              Mini Web Servicios te da una base inicial lista para empezar
              rápido y un panel simple para autogestionar lo que necesites
              después. No es un servicio artesanal de carga completa
              permanente.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "34px",
                flexWrap: "wrap",
              }}
            >
              <a href={checkoutHref} style={S.btnPrimary}>
                Quiero mi página
              </a>
              <a href="/#plan" style={S.btnSecondary}>
                Ver plan
              </a>
            </div>
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div style={{ ...S.shell, paddingTop: "22px", paddingBottom: "28px" }}>
          <div
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
            style={{ alignItems: "stretch" }}
          >
            {quickSummary.map((item) => (
              <div
                key={item}
                style={{
                  padding: "16px 0",
                  borderBottom: `1px solid ${C.line}`,
                }}
              >
                <p
                  style={{
                    ...S.eyebrow,
                    color: C.ink,
                    letterSpacing: "0.08em",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div
          className="grid gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          style={{ ...S.shell, paddingTop: "72px", paddingBottom: "72px" }}
        >
          <div>
            <p style={{ ...S.eyebrow, marginBottom: "16px" }}>Qué resuelve</p>
            <h2 style={S.h2}>
              Ordena la información, la reserva y el cobro en un solo lugar.
            </h2>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            <p style={S.body}>
              Si hoy explicás por mensaje qué hacés, cuánto sale, cómo reservar
              y cómo cobrar, terminás usando tiempo en tareas repetidas que una
              mini web puede resolver mejor.
            </p>
            <p style={S.body}>
              Mini Web Servicios deja una base inicial clara para empezar
              rápido. Desde ahí, podés gestionar servicios, textos, fotos y
              disponibilidad desde un panel simple, sin depender de una carga
              manual permanente de nuestro lado.
            </p>
            <p style={S.body}>
              El resultado es una página profesional, reservas online, cobro
              directo y avisos automáticos, sin comisión por reserva.
            </p>
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div style={{ ...S.shell, paddingTop: "72px", paddingBottom: "72px" }}>
          <div style={{ maxWidth: "760px", marginBottom: "34px" }}>
            <p style={{ ...S.eyebrow, marginBottom: "16px" }}>Paso a paso</p>
            <h2 style={S.h2}>
              Una activación simple, pensada para empezar rápido.
            </h2>
            <p style={{ ...S.body, marginTop: "18px" }}>
              La idea no es sumar un proceso largo ni artesanal. Es darte una
              base profesional, dejarla operativa y que luego puedas seguir con
              autogestión simple.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {steps.map(({ step, title, body }) => (
              <div key={step} style={S.card}>
                <p style={{ ...S.eyebrow, color: C.ink, marginBottom: "18px" }}>
                  {step}
                </p>
                <h3 style={{ ...S.h3, marginBottom: "10px" }}>{title}</h3>
                <p style={S.bodySmall}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div style={{ ...S.shell, paddingTop: "72px", paddingBottom: "72px" }}>
          <div style={{ maxWidth: "760px", marginBottom: "34px" }}>
            <p style={{ ...S.eyebrow, marginBottom: "16px" }}>Qué incluye</p>
            <h2 style={S.h2}>
              Lo que viene listo y lo que no forma parte del producto.
            </h2>
            <p style={{ ...S.body, marginTop: "18px" }}>
              Así queda claro desde el principio qué resuelve Mini Web
              Servicios y qué no promete.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div style={S.card}>
              <h3 style={{ ...S.h3, marginBottom: "18px" }}>Incluye</h3>
              <div style={{ display: "grid", gap: "14px" }}>
                {includes.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={S.itemDot} />
                    <p style={S.bodySmall}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.cardMuted}>
              <h3 style={{ ...S.h3, marginBottom: "18px" }}>No incluye</h3>
              <div style={{ display: "grid", gap: "14px" }}>
                {notIncluded.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={S.itemDot} />
                    <p style={S.bodySmall}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...S.cardMuted, marginTop: "16px" }}>
            <p style={{ ...S.bodySmall, color: C.ink, fontWeight: 600 }}>
              No es un servicio de carga completa permanente por cada cliente.
              Es una activación rápida con base inicial clara y una
              administración simple para que luego puedas seguir gestionando tu
              contenido sin fricción.
            </p>
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div style={{ ...S.shell, paddingTop: "72px", paddingBottom: "72px" }}>
          <div style={{ maxWidth: "760px", marginBottom: "34px" }}>
            <p style={{ ...S.eyebrow, marginBottom: "16px" }}>Datos clave</p>
            <h2 style={S.h2}>
              Activación, pago y encaje del producto, sin vueltas.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {keyFacts.map(({ title, body }) => (
              <div key={title} style={S.card}>
                <h3 style={{ ...S.h3, marginBottom: "12px" }}>{title}</h3>
                <p style={S.bodySmall}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div style={{ ...S.shell, paddingTop: "72px", paddingBottom: "72px" }}>
          <div style={{ maxWidth: "760px", marginBottom: "34px" }}>
            <p style={{ ...S.eyebrow, marginBottom: "16px" }}>
              Beneficios claros
            </p>
            <h2 style={S.h2}>
              Una herramienta simple para mostrar mejor tu servicio y trabajar
              con más orden.
            </h2>
            <p style={{ ...S.body, marginTop: "18px" }}>
              La propuesta es concreta: presencia profesional, reservas online,
              cobro directo y una forma liviana de mantener tu página al día.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map(({ title, body }) => (
              <div key={title} style={S.card}>
                <h3 style={{ ...S.h3, marginBottom: "10px" }}>{title}</h3>
                <p style={S.bodySmall}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={S.section}>
        <div
          style={{
            ...S.shell,
            paddingTop: "72px",
            paddingBottom: "80px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ ...S.eyebrow, marginBottom: "16px" }}>Empezá hoy</p>
            <h2 style={S.h2}>
              Activá una página clara para mostrar, reservar y cobrar mejor.
            </h2>
            <p style={{ ...S.body, marginTop: "18px" }}>
              Base inicial lista, autogestión simple y una operación más
              ordenada desde tu propia mini web.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "32px",
                flexWrap: "wrap",
              }}
            >
              <a href={checkoutHref} style={S.btnPrimary}>
                Quiero mi página de servicios
              </a>
              <a href="/" style={S.btnSecondary}>
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ ...S.shell, paddingTop: "20px", paddingBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <p style={{ ...S.bodySmall, color: C.ink, fontWeight: 600 }}>
            Mini Web Servicios
          </p>
          <p style={{ ...S.bodySmall, color: C.muted }}>
            Página propia, reservas online y cobro directo sin comisión.
          </p>
        </div>
      </footer>
    </main>
  );
}
