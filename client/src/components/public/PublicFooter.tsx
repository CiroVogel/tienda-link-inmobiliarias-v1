import { Link } from "wouter";

type PublicFooterProps = {
  slug: string;
  businessName: string;
  description?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
};

export function PublicFooter({
  slug,
  businessName,
  description,
  whatsapp,
  phone,
  email,
  instagram,
  facebook,
  address,
}: PublicFooterProps) {
  return (
    <footer className="border-t border-[#1e3434] bg-[#071c1b] px-5 py-14 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">

          {/* Col 1 — Marca */}
          <div>
            <Link href={`/${slug}`}>
              <span className="text-lg font-black tracking-tight text-white">
                {businessName}
              </span>
            </Link>
            {description ? (
              <p className="mt-3 max-w-[220px] text-sm leading-6 text-white/55">
                {description}
              </p>
            ) : null}
          </div>

          {/* Col 2 — Explorar */}
          <nav aria-label="Navegación del pie">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Explorar
            </p>
            <ul className="space-y-3">
              <li>
                <Link href={`/${slug}`} className="text-sm font-semibold text-white/60 transition hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href={`/${slug}/propiedades`} className="text-sm font-semibold text-white/60 transition hover:text-white">
                  Propiedades
                </Link>
              </li>
              <li>
                <a href={`/${slug}#como-funciona`} className="text-sm font-semibold text-white/60 transition hover:text-white">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href={`/${slug}#contacto`} className="text-sm font-semibold text-white/60 transition hover:text-white">
                  Contacto
                </a>
              </li>
            </ul>
          </nav>

          {/* Col 3 — Contacto */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Contacto
            </p>
            <ul className="space-y-4">
              {whatsapp ? (
                <li>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    WhatsApp
                  </p>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, quiero consultar por propiedades de ${businessName}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-white/60 transition hover:text-white"
                  >
                    {whatsapp}
                  </a>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    Teléfono
                  </p>
                  <a
                    href={`tel:${phone}`}
                    className="text-sm font-semibold text-white/60 transition hover:text-white"
                  >
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm font-semibold text-white/60 transition hover:text-white"
                  >
                    {email}
                  </a>
                </li>
              ) : null}
              {instagram ? (
                <li>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    Instagram
                  </p>
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-white/60 transition hover:text-white"
                  >
                    Instagram
                  </a>
                </li>
              ) : null}
              {facebook ? (
                <li>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    Facebook
                  </p>
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-white/60 transition hover:text-white"
                  >
                    Facebook
                  </a>
                </li>
              ) : null}
              {address ? (
                <li>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    Dirección
                  </p>
                  <p className="text-sm font-semibold text-white/60">
                    {address}
                  </p>
                </li>
              ) : null}
            </ul>
          </div>

        </div>

        {/* Barra inferior */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs font-semibold text-white/30">
            © {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
