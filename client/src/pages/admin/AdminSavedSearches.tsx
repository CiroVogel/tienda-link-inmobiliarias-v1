import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Archive,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Search,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSavedSearchBedroomLabel,
  getSavedSearchOperationLabel,
  getSavedSearchWhatsAppHref,
  SAVED_SEARCH_STATUS_CONFIG,
  SAVED_SEARCH_STATUS_OPTIONS,
  type SavedSearchItem,
  type SavedSearchStatus,
} from "@/lib/savedSearches";
import { trpc } from "@/lib/trpc";

type SavedSearchFilter = "all" | "archived" | SavedSearchStatus;

export default function AdminSavedSearches() {
  const [filter, setFilter] = useState<SavedSearchFilter>("all");
  const [search, setSearch] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();

  const { data: searches = [], isLoading, refetch } = trpc.savedSearches.list.useQuery();

  const invalidateList = async () => {
    await utils.savedSearches.list.invalidate();
  };

  const updateStatus = trpc.savedSearches.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Estado actualizado");
      await invalidateList();
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos actualizar la búsqueda");
    },
  });

  const setArchived = trpc.savedSearches.setArchived.useMutation({
    onSuccess: async (_, variables) => {
      toast.success(variables.isArchived ? "Búsqueda archivada" : "Búsqueda reactivada");
      await invalidateList();
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos actualizar el archivo de la búsqueda");
    },
  });

  const addNote = trpc.savedSearches.addNote.useMutation({
    onSuccess: async (_, variables) => {
      setNoteDrafts((current) => ({ ...current, [variables.id]: "" }));
      toast.success("Nota guardada");
      await invalidateList();
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos guardar la nota");
    },
  });

  const items = searches as SavedSearchItem[];

  const counts = useMemo(() => {
    const activeItems = items.filter((item) => !item.isArchived);
    const base: Record<SavedSearchFilter, number> = {
      all: activeItems.length,
      archived: items.filter((item) => item.isArchived).length,
      new: 0,
      searching: 0,
      matched: 0,
      contacted: 0,
      closed: 0,
      not_interested: 0,
    };

    activeItems.forEach((item) => {
      base[item.status] += 1;
    });

    return base;
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filter === "archived"
          ? item.isArchived
          : filter === "all"
            ? !item.isArchived
            : !item.isArchived && item.status === filter;

      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.whatsapp.toLowerCase().includes(normalizedSearch) ||
        item.propertyType.toLowerCase().includes(normalizedSearch) ||
        item.zone.toLowerCase().includes(normalizedSearch) ||
        item.budget.toLowerCase().includes(normalizedSearch) ||
        (item.comments ?? "").toLowerCase().includes(normalizedSearch) ||
        item.notes.some((note) => note.text.toLowerCase().includes(normalizedSearch));

      return matchesFilter && matchesSearch;
    });
  }, [filter, items, search]);

  const handleSaveNote = async (id: string) => {
    const noteText = noteDrafts[id]?.trim() ?? "";
    if (!noteText) {
      toast.error("Escribí una nota antes de guardarla");
      return;
    }

    await addNote.mutateAsync({
      id,
      text: noteText,
    });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Búsquedas recibidas
            </h1>
            <p className="mt-1 text-sm text-black/55">
              Necesidades cargadas por visitantes cuando todavía no encontraron una
              propiedad.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
              Activas: {counts.all}
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
              Archivadas: {counts.archived}
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {SAVED_SEARCH_STATUS_OPTIONS.map((option) => (
              <div
                key={`summary-${option.value}`}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  {option.label}
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
                  {counts[option.value]}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                filter === "all"
                  ? "border-transparent bg-black text-white"
                  : "border-black/15 text-black/55 hover:border-black/40 hover:text-black"
              }`}
            >
              Todas
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                  filter === "all" ? "bg-white/15" : "bg-black/5 text-black/70"
                }`}
              >
                {counts.all}
              </span>
            </button>

            {SAVED_SEARCH_STATUS_OPTIONS.map((option) => {
              const isSelected = filter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-transparent bg-black text-white"
                      : "border-black/15 text-black/55 hover:border-black/40 hover:text-black"
                  }`}
                >
                  {option.label}
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      isSelected ? "bg-white/15" : "bg-black/5 text-black/70"
                    }`}
                  >
                    {counts[option.value]}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setFilter("archived")}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                filter === "archived"
                  ? "border-transparent bg-black text-white"
                  : "border-black/15 text-black/55 hover:border-black/40 hover:text-black"
              }`}
            >
              Archivadas
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                  filter === "archived" ? "bg-white/15" : "bg-black/5 text-black/70"
                }`}
              >
                {counts.archived}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, WhatsApp, zona, tipo, presupuesto o notas..."
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-zinc-700">
              {filter === "archived"
                ? "No hay búsquedas archivadas para mostrar."
                : "No hay búsquedas recibidas para mostrar."}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {search || filter !== "all"
                ? "Probá con otro filtro o una búsqueda diferente."
                : "Las nuevas búsquedas aparecerán acá para seguimiento manual."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const statusConfig = SAVED_SEARCH_STATUS_CONFIG[item.status];
              const noteDraft = noteDrafts[item.id] ?? "";

              return (
                <article
                  key={item.id}
                  className={`rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm ${
                    item.isArchived ? "border-zinc-300 opacity-90" : "border-zinc-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-base font-black text-zinc-950">
                          {item.name}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                        {item.isArchived ? (
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                            Archivada
                          </span>
                        ) : null}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>
                          {format(parseISO(item.createdAt), "d 'de' MMMM yyyy · HH:mm", {
                            locale: es,
                          })}
                        </span>
                        <span>{item.whatsapp}</span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Búsqueda
                          </p>
                          <p className="mt-1 text-sm text-zinc-950">
                            {getSavedSearchOperationLabel(item.operationType)} · {item.propertyType}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {item.zone} · {getSavedSearchBedroomLabel(item.bedrooms)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Presupuesto
                          </p>
                          <p className="mt-1 text-sm text-zinc-950">{item.budget}</p>
                        </div>
                      </div>

                      {item.comments ? (
                        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Comentarios
                          </p>
                          <p className="mt-1 text-sm leading-6 text-zinc-600">{item.comments}</p>
                        </div>
                      ) : null}

                      <div className="mt-3 rounded-xl border border-zinc-200 bg-white px-4 py-4">
                        <div className="mb-3 flex items-center gap-2">
                          <StickyNote className="h-4 w-4 text-zinc-500" />
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                            Notas internas
                          </p>
                        </div>

                        {item.notes.length > 0 ? (
                          <div className="mb-3 space-y-2">
                            {item.notes.map((note) => (
                              <div
                                key={note.id}
                                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3"
                              >
                                <p className="text-sm leading-6 text-zinc-700">{note.text}</p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-zinc-400">
                                  {format(parseISO(note.createdAt), "d MMM yyyy · HH:mm", {
                                    locale: es,
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mb-3 text-sm text-zinc-500">
                            Todavía no hay notas internas para esta búsqueda.
                          </p>
                        )}

                        <div className="grid gap-2">
                          <textarea
                            value={noteDraft}
                            onChange={(event) =>
                              setNoteDrafts((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                            rows={3}
                            placeholder="Ej: Le ofrecí un departamento en Mendoza 1450. Espera respuesta."
                            className="resize-none rounded-lg border border-zinc-200 px-3 py-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
                          />
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveNote(item.id)}
                              disabled={addNote.isPending}
                            >
                              Guardar nota
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 xl:w-56">
                      <Select
                        value={item.status}
                        onValueChange={(value) =>
                          updateStatus.mutate({
                            id: item.id,
                            status: value as SavedSearchStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SAVED_SEARCH_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <a
                        href={getSavedSearchWhatsAppHref(
                          item.whatsapp,
                          "Hola, te escribimos por la búsqueda que dejaste en nuestra web.",
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-black/15 px-3 text-sm font-medium text-black hover:border-black/35 hover:bg-black/[0.02]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contactar por WhatsApp
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          setArchived.mutate({
                            id: item.id,
                            isArchived: !item.isArchived,
                          })
                        }
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-black/15 px-3 text-sm font-medium text-black hover:border-black/35 hover:bg-black/[0.02]"
                      >
                        {item.isArchived ? (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            Reactivar
                          </>
                        ) : (
                          <>
                            <Archive className="h-4 w-4" />
                            Archivar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
