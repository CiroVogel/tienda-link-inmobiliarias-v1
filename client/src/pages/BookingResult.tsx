import { useSearch, Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type ResultType = "success" | "failure" | "pending";

function formatPrice(price: string | number, currency = "ARS") {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `${currency} ${num.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

const CONFIGS = {
  success: {
    Icon: CheckCircle2,
    title: "¡Pago confirmado!",
    subtitle: "Tu reserva fue confirmada exitosamente. Te esperamos.",
    badge: "Confirmada",
  },
  failure: {
    Icon: XCircle,
    title: "Pago rechazado",
    subtitle: "Hubo un problema con el pago. Por favor intentá de nuevo.",
    badge: "Rechazado",
  },
  pending: {
    Icon: Clock,
    title: "Pago en proceso",
    subtitle: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
    badge: "Pendiente",
  },
};

export default function BookingResult({ type }: { type: ResultType }) {
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = slug ?? "";
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const externalRef = searchParams.get("external_reference") ?? "";
  const bookingIdStr = externalRef.replace("booking-", "");
  const bookingId = parseInt(bookingIdStr, 10);

  const { data: booking } = trpc.bookings.getById.useQuery(
    { id: bookingId, slug: safeSlug },
    { enabled: !isNaN(bookingId) && safeSlug.length > 0 }
  );
  // Usar endpoint público por slug, no el endpoint admin
  const { data: profile } = trpc.business.getPublic.useQuery(
    { slug: safeSlug },
    { enabled: !!safeSlug }
  );

  const waLink = profile?.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`
    : null;

  const config = CONFIGS[type];
  const { Icon } = config;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black/10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center">
          <Link href={`/${safeSlug}`}>
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {profile?.businessName ?? "Volver"}
            </button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        {/* Status */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-black mb-3 tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm text-black/50 max-w-sm mx-auto leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Booking details */}
        {booking && (
          <div className="bg-[#f5f5f5] p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                Detalle de la reserva
              </p>
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-black text-white">
                {config.badge}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Referencia</span>
                <span className="font-bold text-black">#{booking.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Cliente</span>
                <span className="font-bold text-black">{booking.clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Fecha</span>
                <span className="font-bold text-black">
                  {format(parseISO(booking.bookingDate), "d 'de' MMMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Hora</span>
                <span className="font-bold text-black">{booking.bookingTime}</span>
              </div>
              <div className="border-t border-black/10 pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-black">
                  {booking.paymentType === "deposit" ? "Seña abonada" : "Total abonado"}
                </span>
                <span className="text-2xl font-black text-black">
                  {formatPrice(
                    booking.paymentType === "deposit"
                      ? booking.depositAmount ?? booking.totalAmount
                      : booking.totalAmount,
                    profile?.currency ?? "ARS"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {type === "failure" ? (
            <Link href={`/${safeSlug}/booking`}>
              <button className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </button>
            </Link>
          ) : (
            <Link href={`/${safeSlug}`}>
              <button className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
                Volver al inicio
              </button>
            </Link>
          )}

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 border border-black/20 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar por WhatsApp
            </a>
          )}

          {type === "failure" && (
            <Link href={`/${safeSlug}`}>
              <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors">
                Volver al inicio
              </button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
