import { useState } from "react";
import { CheckCircle2, Mail, MessageCircle, Phone, User } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { usePublicProperty } from "@/lib/propertyData";
import {
  getPropertyCoverImage,
  getStatusLabel,
  isPropertyRequestable,
  realEstateProfile,
} from "@/lib/realEstateDemo";
import { usePageMeta } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

function whatsappHref(whatsapp: string, propertyTitle: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, quiero consultar por la propiedad: ${propertyTitle}`,
  )}`;
}

const defaultMessage =
  "Hola, me interesa esta propiedad y quisiera recibir más información o coordinar una visita.";

export default function Booking() {
  const { slug, propertyId } = useParams<{ slug: string; propertyId: string }>();
  const safeSlug = slug ?? realEstateProfile.slug;
  const { property, isLoading } = usePublicProperty(safeSlug, propertyId);
  const createVisitRequest = trpc.visitRequests.create.useMutation();
  const { data: publicProfile } = trpc.business.getPublic.useQuery(
    { slug: safeSlug },
    { enabled: Boolean(safeSlug) },
  );

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    message: defaultMessage,
  });
  const [reference, setReference] = useState("");
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
  const description = publicProfile?.description?.trim() || realEstateProfile.description;
  const phone = publicProfile?.phone?.trim() || realEstateProfile.phone;
  const email = publicProfile?.email?.trim() || realEstateProfile.email;
  const address = publicProfile?.address?.trim() || realEstateProfile.address;
  const instagram = publicProfile?.instagram?.trim() || realEstateProfile.instagram;
  const facebook = publicProfile?.facebook?.trim() || "";

  usePageMeta(
    `Solicitar visita | ${businessName}`,
    `Enviá una consulta o solicitud de visita directamente a ${businessName}.`,
  );

  if (isLoading && !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <p className="text-sm font-medium text-[#6a716f]">Cargando propiedad...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5">
        <div className="max-w-sm text-center">
          <h1 className="mb-5 text-4xl font-black text-zinc-950">
            Propiedad no encontrada.
          </h1>
          <Link href={`/${safeSlug}/propiedades`}>
            <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12383d] px-8 text-sm font-semibold text-white transition hover:bg-[#0f646a]">
              Volver al listado
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const requestable = isPropertyRequestable(property);
  const currentProperty = property;
  const coverImage = getPropertyCoverImage(property);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!requestable) {
      toast.error("Esta propiedad no está disponible para solicitar visita.");
      return;
    }

    if (!form.name.trim() || !form.whatsapp.trim() || !form.message.trim()) {
      toast.error("Dejanos nombre y apellido, WhatsApp y un mensaje.");
      return;
    }

    try {
      const result = await createVisitRequest.mutateAsync({
        slug: safeSlug,
        propertyId: currentProperty.id,
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim() || undefined,
        message: form.message.trim(),
      });

      setReference(result.reference);
      toast.success("Solicitud de visita enviada.");
    } catch {
      toast.error("No pudimos enviar la solicitud. Intentá nuevamente.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <PublicHeader
        slug={safeSlug}
        businessName={businessName}
        brandImageUrl={brandImageUrl}
        backHref={`/${safeSlug}/propiedades/${property.id}`}
        backLabel="Ficha"
      />

      <main className="mx-auto grid max-w-4xl gap-6 px-5 py-6 md:grid-cols-[0.9fr_1.1fr] md:py-8">
        <aside className="self-start bg-white">
          <img
            src={coverImage}
            alt={property.title}
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="border border-t-0 border-[#ded8cc] p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6a716f]">
              {getStatusLabel(property.status)}
            </p>
            <h1 className="text-2xl font-black leading-tight text-zinc-950">
              {property.title}
            </h1>
            <p className="mt-2 text-sm text-[#6a716f]">{property.location}</p>
            <p className="mt-4 text-xl font-black text-zinc-950">{property.price}</p>
          </div>
        </aside>

        <section className="border border-[#ded8cc] bg-white p-5 md:p-7">
          {reference ? (
            <div className="flex min-h-[420px] flex-col justify-center">
              <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-600" />
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
                Solicitud recibida
              </p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                Ya tenemos tu solicitud de visita.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#6a716f]">
                {businessName} revisará tu consulta y te contactará por
                WhatsApp. Referencia: <strong className="text-zinc-950">{reference}</strong>
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${safeSlug}`}>
                  <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12383d] px-8 text-sm font-semibold text-white transition hover:bg-[#0f646a]">
                    Volver al inicio
                  </span>
                </Link>
                {profileWhatsapp ? (
                  <a
                    href={whatsappHref(profileWhatsapp, property.title)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#cfc7b8] px-8 text-sm font-semibold text-[#12383d] transition hover:border-[#0f646a]"
                  >
                    WhatsApp
                    <MessageCircle className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
                Datos de contacto
              </p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                Consultá por esta propiedad
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6a716f]">
                Dejanos tus datos y {businessName} te contactará para brindarte más información
                o coordinar una visita.
              </p>

              {!requestable ? (
                <div className="mt-6 border border-[#ded8cc] bg-[#fffdf8] p-4 text-sm text-[#6a716f]">
                  Esta propiedad está {getStatusLabel(property.status).toLowerCase()} y no
                  permite solicitud de visita.
                </div>
              ) : null}

              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6a716f]">
                    Nombre y apellido
                  </span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a716f]" />
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="h-12 w-full border border-[#ded8cc] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0f646a]"
                      placeholder="Tu nombre y apellido"
                      disabled={!requestable}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6a716f]">
                    WhatsApp
                  </span>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a716f]" />
                    <input
                      value={form.whatsapp}
                      onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
                      className="h-12 w-full border border-[#ded8cc] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0f646a]"
                      placeholder="+54 9 341 000 0000"
                      disabled={!requestable}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6a716f]">
                    Email (opcional)
                  </span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a716f]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="h-12 w-full border border-[#ded8cc] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0f646a]"
                      placeholder="tu@email.com"
                      disabled={!requestable}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#6a716f]">
                    Mensaje
                  </span>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    className="min-h-28 w-full resize-none border border-[#ded8cc] bg-white px-3 py-3 text-sm outline-none focus:border-[#0f646a]"
                    disabled={!requestable}
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={!requestable || createVisitRequest.isPending}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#12383d] px-8 text-sm font-semibold text-white transition hover:bg-[#0f646a] disabled:cursor-not-allowed disabled:bg-[#ded8cc]"
                >
                  {createVisitRequest.isPending ? "Enviando..." : "Enviar solicitud"}
                </button>

                {profileWhatsapp ? (
                  <a
                    href={whatsappHref(profileWhatsapp, property.title)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#cfc7b8] px-8 text-sm font-semibold text-[#12383d] transition hover:border-[#0f646a]"
                  >
                    WhatsApp
                    <MessageCircle className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </form>
          )}
        </section>
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
