import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Mail,
  MessageCircle,
  MessageSquare,
  NotebookPen,
  Phone,
  RefreshCw,
  Save,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INTERESTED_STATUS_CONFIG,
  INTERESTED_STATUS_OPTIONS,
  getInterestedWhatsAppHref,
  type InterestedItem,
  type InterestedTimelineEntry,
  type InterestedStatus,
} from "@/lib/interested";
import { trpc } from "@/lib/trpc";

export default function AdminInterestedDetail() {
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId ?? "";
  const [noteText, setNoteText] = useState("");
  const utils = trpc.useUtils();

  const { data: profile } = trpc.business.get.useQuery();
  const {
    data: request,
    isLoading,
    refetch,
  } = trpc.visitRequests.get.useQuery(
    { id: requestId },
    { enabled: Boolean(requestId) },
  );

  const updateStatus = trpc.visitRequests.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Estado actualizado");
      await utils.visitRequests.list.invalidate();
      await utils.visitRequests.get.invalidate({ id: requestId });
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo actualizar el estado");
    },
  });

  const addNote = trpc.visitRequests.addNote.useMutation({
    onSuccess: async () => {
      toast.success("Nota agregada");
      setNoteText("");
      await utils.visitRequests.list.invalidate();
      await utils.visitRequests.get.invalidate({ id: requestId });
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo guardar la nota");
    },
  });

  const interested = request as InterestedItem | undefined;
  const statusConfig = interested
    ? INTERESTED_STATUS_CONFIG[interested.status]
    : null;

  const publicPropertyHref =
    profile?.slug && interested
      ? `/${profile.slug}/propiedades/${interested.propertyId}`
      : null;

  const timeline = useMemo(() => {
    if (!interested) return [];
    return [...interested.timeline].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }, [interested]);

  const notes = useMemo(() => {
    if (!interested) return [];
    return [...interested.notes].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }, [interested]);

  async function handleAddNote() {
    const trimmed = noteText.trim();
    if (!trimmed) {
      toast.error("Escribí una nota antes de guardarla.");
      return;
    }

    await addNote.mutateAsync({
      id: requestId,
      text: trimmed,
    });
  }

  function renderTimelineEntry(entry: InterestedTimelineEntry) {
    if (entry.type === "note_added") {
      return <NotebookPen className="h-4 w-4 text-[#465153]" />;
    }

    if (entry.type === "status_changed") {
      return <RefreshCw className="h-4 w-4 text-[#465153]" />;
    }

    return <MessageSquare className="h-4 w-4 text-[#465153]" />;
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/admin/interesados">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#465153] hover:text-[#172124]">
              <ArrowLeft className="h-4 w-4" />
              Volver a Interesados
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#12383d]" />
          </div>
        ) : !interested ? (
          <div className="rounded-xl border border-[#ded8cc] bg-white px-6 py-16 text-center">
            <UserRound className="mx-auto mb-3 h-10 w-10 text-[#c8c0b4]" />
            <p className="font-semibold text-[#465153]">No encontramos este interesado.</p>
            <p className="mt-1 text-sm text-[#465153]">
              Puede que haya sido eliminado o que la referencia ya no exista.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-[#ded8cc] bg-white p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h1 className="truncate text-2xl font-black tracking-tight text-[#172124]">
                      {interested.name}
                    </h1>
                    {statusConfig ? (
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    ) : null}
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#465153]">
                      {interested.reference}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="flex min-h-[104px] flex-col items-center justify-center rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase leading-relaxed tracking-widest text-black/60">
                        WhatsApp
                      </p>
                      <p className="mt-2 break-words text-sm font-medium leading-relaxed text-[#172124]">
                        {interested.whatsapp}
                      </p>
                    </div>

                    <div className="flex min-h-[104px] flex-col items-center justify-center rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase leading-relaxed tracking-widest text-black/60">
                        Email
                      </p>
                      <p className="mt-2 break-all text-sm font-medium leading-relaxed text-[#172124]">
                        {interested.email || "No informado"}
                      </p>
                    </div>

                    <div className="flex min-h-[104px] flex-col items-center justify-center rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase leading-relaxed tracking-widest text-black/60">
                        Fecha de consulta
                      </p>
                      <p className="mt-2 break-words text-sm font-medium leading-relaxed text-[#172124]">
                        {format(parseISO(interested.createdAt), "d 'de' MMMM yyyy · HH:mm", {
                          locale: es,
                        })}
                      </p>
                    </div>

                    <div className="flex min-h-[104px] flex-col items-center justify-center rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase leading-relaxed tracking-widest text-black/60">
                        Propiedad
                      </p>
                      <p className="mt-2 break-words text-sm font-medium leading-relaxed text-[#172124]">
                        {interested.propertyTitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 lg:w-60">
                  <Select
                    value={interested.status}
                    onValueChange={(value) =>
                      updateStatus.mutate({
                        id: interested.id,
                        status: value as InterestedStatus,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERESTED_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <a
                    href={getInterestedWhatsAppHref(
                      interested.whatsapp,
                      `Hola ${interested.name}, te escribimos por tu consulta sobre ${interested.propertyTitle}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#12383d] px-4 text-sm font-medium text-white hover:bg-[#0f646a]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>

                  {interested.email ? (
                    <a
                      href={`mailto:${interested.email}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ded8cc] bg-white px-4 text-sm font-medium text-[#172124] hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d]"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  ) : null}

                  {publicPropertyHref ? (
                    <a
                      href={publicPropertyHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ded8cc] bg-white px-4 text-sm font-medium text-[#172124] hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver propiedad
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#465153]">
                  Mensaje original
                </p>
                <p className="mt-2 text-sm leading-7 text-[#465153]">
                  {interested.message}
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-[#ded8cc] bg-white p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#172124]">Timeline</h2>
                    <p className="mt-1 text-sm text-[#465153]">
                      Consulta recibida, cambios de estado y notas agregadas.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex gap-3 rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-4"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                        {renderTimelineEntry(entry)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#172124]">
                            {entry.title}
                          </p>
                          <span className="text-xs text-[#465153]">
                            {format(parseISO(entry.createdAt), "d MMM yyyy · HH:mm", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        {entry.description ? (
                          <p className="mt-1 text-sm leading-6 text-[#465153]">
                            {entry.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#ded8cc] bg-white p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-black text-[#172124]">Notas</h2>
                  <p className="mt-1 text-sm text-[#465153]">
                    Anotá avances, acuerdos o contexto útil para el seguimiento.
                  </p>
                </div>

                <div className="rounded-xl border border-[#ded8cc] bg-[#f7f5ef] p-3">
                  <textarea
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    rows={4}
                    className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-[#465153] outline-none"
                    placeholder="Escribí una nota breve sobre este interesado..."
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={handleAddNote}
                      disabled={addNote.isPending}
                      className="gap-2 bg-[#12383d] text-white hover:bg-[#0f646a]"
                    >
                      <Save className="h-4 w-4" />
                      Guardar nota
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {notes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#ded8cc] px-4 py-8 text-center text-sm text-[#465153]">
                      Todavía no hay notas para este interesado.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-[#ded8cc] bg-[#f7f5ef] px-4 py-4"
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs text-[#465153]">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(note.createdAt), "d MMM yyyy · HH:mm", {
                            locale: es,
                          })}
                        </div>
                        <p className="text-sm leading-6 text-[#465153]">
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
