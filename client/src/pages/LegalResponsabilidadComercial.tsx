const paragraphs = [
  "La presente mini web corresponde a un espacio digital administrado por un cliente de Tienda Link, titular de la actividad comercial o profesional aqu\u00ed informada.",
  "La identificaci\u00f3n espec\u00edfica del titular de esta mini web, as\u00ed como sus datos de contacto, comerciales o profesionales, deber\u00e1n encontrarse informados en la propia p\u00e1gina, en la medida en que resulten aplicables.",
  "El titular de esta mini web es el \u00fanico responsable por los contenidos, datos, im\u00e1genes, productos, servicios, precios, promociones, condiciones comerciales, disponibilidad, informaci\u00f3n profesional, medios de contacto, reservas, se\u00f1as, medios de cobro y cualquier otra informaci\u00f3n o material publicado en este espacio.",
  "Asimismo, el titular de la mini web es el \u00fanico responsable por la relaci\u00f3n que mantenga con sus propios usuarios, compradores, clientes, pacientes, alumnos, consultantes o terceros.",
  "Tienda Link provee la infraestructura tecnol\u00f3gica general que permite el funcionamiento de esta mini web, pero no act\u00faa como vendedor, proveedor directo, intermediario comercial principal, garante de operaciones ni responsable por el cumplimiento de las obligaciones asumidas por el titular de esta p\u00e1gina frente a terceros.",
  "Toda informaci\u00f3n publicada en esta mini web, incluyendo productos, servicios, precios, promociones, condiciones de atenci\u00f3n, disponibilidad, cancelaciones, reprogramaciones, reservas o medios de pago, es definida y administrada por el titular de la mini web bajo su exclusiva responsabilidad.",
  "La permanencia de dicha informaci\u00f3n en la p\u00e1gina no implica validaci\u00f3n, auditor\u00eda ni garant\u00eda por parte de Tienda Link.",
  "Las consultas, contrataciones, pedidos, reservas, reclamos o gestiones vinculadas con los productos o servicios ofrecidos en esta mini web deber\u00e1n canalizarse con el titular de la misma a trav\u00e9s de los medios de contacto informados en la p\u00e1gina.",
  "El funcionamiento general de la infraestructura digital provista por Tienda Link se encuentra sujeto a los documentos legales generales del servicio, incluyendo sus T\u00e9rminos y Condiciones y su Pol\u00edtica de Privacidad, en todo lo que resulte aplicable.",
];

export default function LegalResponsabilidadComercial() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:py-16">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
          {"Aviso de Responsabilidad Comercial"}
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
