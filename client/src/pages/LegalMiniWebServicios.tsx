const paragraphs = [
  "El presente aviso se aplica a las mini webs de servicios que utilicen funciones vinculadas con solicitudes de reserva, turnos, agenda, se\u00f1as, pagos u otras herramientas relacionadas con la contrataci\u00f3n o gesti\u00f3n de servicios por parte de los usuarios finales.",
  "El titular de esta mini web es el \u00fanico responsable por los servicios ofrecidos, por su descripci\u00f3n, disponibilidad, condiciones comerciales, precios, tiempos, modalidad de atenci\u00f3n, requisitos previos, cancelaciones, reprogramaciones, cumplimiento y relaci\u00f3n con sus propios clientes o usuarios.",
  "La utilizaci\u00f3n de una mini web dentro de Tienda Link no altera ni reemplaza la responsabilidad directa del prestador frente a quienes contraten, soliciten o reserven sus servicios.",
  "Las herramientas de solicitud de reserva, agenda o turnos que puedan encontrarse disponibles en la mini web tienen finalidad operativa y de organizaci\u00f3n.",
  "Tienda Link no garantiza disponibilidad efectiva, asignaci\u00f3n definitiva de turnos, asistencia del usuario final, cumplimiento del horario, confirmaci\u00f3n autom\u00e1tica ni inexistencia de errores derivados de configuraciones, carga de datos o funcionamiento de terceros.",
  "Toda definici\u00f3n concreta sobre d\u00edas, horarios, cupos, disponibilidad, aceptaci\u00f3n, confirmaci\u00f3n, reprogramaci\u00f3n o rechazo de reservas corresponde al titular de la mini web.",
  "Cuando la mini web permita visualizar, solicitar o gestionar pagos, se\u00f1as o cobros, ello podr\u00e1 depender de configuraciones propias del titular y de servicios o proveedores externos de pago.",
  "Tienda Link no act\u00faa como entidad financiera, procesador principal del pago, garante de cobro ni responsable por aprobaciones, rechazos, retenciones, contracargos, demoras o fallas derivadas de bancos, pasarelas, billeteras, cuentas del titular o servicios de terceros.",
  "Las condiciones econ\u00f3micas de la se\u00f1a, pago parcial o pago total son definidas por el titular de la mini web bajo su exclusiva responsabilidad.",
  "Las condiciones de cancelaci\u00f3n, reprogramaci\u00f3n, devoluci\u00f3n, ausencia, tolerancia, p\u00e9rdida de turno o cualquier otra situaci\u00f3n vinculada con la prestaci\u00f3n del servicio corresponden al titular de la mini web y deber\u00e1n ser definidas, informadas y gestionadas por \u00e9l.",
  "Tienda Link no garantiza la efectiva prestaci\u00f3n del servicio ofrecido, ni responde por incumplimientos, demoras, cambios de criterio, mala atenci\u00f3n, mala praxis, calidad del servicio, da\u00f1os o conflictos entre el prestador y el usuario final.",
  "Tienda Link provee la infraestructura digital general de la mini web, pero no presta el servicio final ofrecido al usuario, no representa al prestador y no asume responsabilidad por la relaci\u00f3n contractual, comercial o profesional existente entre el titular de la mini web y sus propios usuarios o clientes.",
];

export default function LegalMiniWebServicios() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:py-16">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
          {"Aviso Espec\u00edfico para Mini Web Servicios"}
        </h1>

        <div className="mt-10 space-y-6">
          {paragraphs.map(paragraph => (
            <p
              key={paragraph}
              className="text-base leading-relaxed text-black/70"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
