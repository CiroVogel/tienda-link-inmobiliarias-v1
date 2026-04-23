import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, MessageCircle, Phone, User } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  getPropertyById,
  getStatusLabel,
  isPropertyRequestable,
  realEstateProfile,
} from "@/lib/realEstateDemo";

function whatsappHref(propertyTitle: string) {
  return `https://wa.me/${realEstateProfile.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, quiero consultar por la propiedad: ${propertyTitle}`,
  )}`;
}

const defaultMessage =
  "Hola, me interesa esta propiedad y quisiera recibir más información o coordinar una visita.";

export default function Booking() {
  const { slug, propertyId } = useParams<{ slug: string; propertyId: string }>();
  const safeSlug = slug ?? realEstateProfile.slug;
  const property = getPropertyById(propertyId);
  const createVisitRequest = trpc.visitRequests.create.useMutation();

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    message: defaultMessage,
  });
  const [reference, setReference] = useState("");

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-sm text-center">
          <h1 className="mb-5 text-4xl font-black text-zinc-950">
            Propiedad no encontrada.
          </h1>
          <Link href={`/${safeSlug}/propiedades`}>
            <span className="inline-flex bg-zinc-950 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white">
              Volver al listado
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const requestable = isPropertyRequestable(property);
  const currentProperty = property;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!requestable) {
      toast.error("Esta propiedad no esta disponible para solicitar visita.");
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
        propertyTitle: currentProperty.title,
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim() || undefined,
        message: form.message.trim(),
      });

      setReference(result.reference);
      toast.success("Solicitud de visita enviada.");
    } catch {
      toast.error("No pudimos enviar la solicitud. Intenta nuevamente.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link href={`/${safeSlug}/propiedades/${property.id}`}>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              <ArrowLeft className="h-4 w-4" />
              Ficha
            </span>
          </Link>
          <span className="text-sm font-black uppercase tracking-[0.18em] text-zinc-950">
            Solicitar visita
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-6 px-5 py-6 md:grid-cols-[0.9fr_1.1fr] md:py-8">
        <aside className="bg-white">
          <img
            src={property.images[0]}
            alt={property.title}
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="border border-t-0 border-zinc-200 p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              {getStatusLabel(property.status)}
            </p>
            <h1 className="text-2xl font-black leading-tight text-zinc-950">
              {property.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">{property.location}</p>
            <p className="mt-4 text-xl font-black text-zinc-950">{property.price}</p>
          </div>
        </aside>

        <section className="border border-zinc-200 bg-white p-5 md:p-7">
          {reference ? (
            <div className="flex min-h-[420px] flex-col justify-center">
              <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-600" />
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                Solicitud recibida
              </p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                Ya tenemos tu solicitud de visita.
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-500">
                La inmobiliaria revisara tu consulta y te contactara por
                WhatsApp. Referencia: <strong className="text-zinc-950">{reference}</strong>
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${safeSlug}`}>
                  <span className="inline-flex justify-center bg-zinc-950 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white">
                    Volver al inicio
                  </span>
                </Link>
                <a
                  href={whatsappHref(property.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-300 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-950"
                >
                  WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                Datos de contacto
              </p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                Consultá por esta propiedad
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Dejanos tus datos y te contactamos para brindarte más información
                o coordinar una visita.
              </p>

              {!requestable ? (
                <div className="mt-6 border border-zinc-200 bg-zinc-100 p-4 text-sm text-zinc-600">
                  Esta propiedad esta {getStatusLabel(property.status).toLowerCase()} y no
                  permite solicitud de visita.
                </div>
              ) : null}

              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                    Nombre y apellido
                  </span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="h-12 w-full border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-zinc-950"
                      placeholder="Tu nombre y apellido"
                      disabled={!requestable}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                    WhatsApp
                  </span>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={form.whatsapp}
                      onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
                      className="h-12 w-full border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-zinc-950"
                      placeholder="+54 9 341 000 0000"
                      disabled={!requestable}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                    Email (opcional)
                  </span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="h-12 w-full border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-zinc-950"
                      placeholder="tu@email.com"
                      disabled={!requestable}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                    Mensaje
                  </span>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    className="min-h-28 w-full resize-none border border-zinc-300 bg-white px-3 py-3 text-sm outline-none focus:border-zinc-950"
                    disabled={!requestable}
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={!requestable || createVisitRequest.isPending}
                  className="inline-flex flex-1 justify-center bg-zinc-950 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {createVisitRequest.isPending ? "Enviando..." : "Enviar solicitud"}
                </button>

                <a
                  href={whatsappHref(property.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-300 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-950"
                >
                  WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
