import { useMemo, useState } from "react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  UserRound,
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
  INTERESTED_STATUS_CONFIG,
  INTERESTED_STATUS_OPTIONS,
  getInterestedWhatsAppHref,
  type InterestedItem,
  type InterestedStatus,
} from "@/lib/interested";
import { trpc } from "@/lib/trpc";

type InterestedFilter = "all" | InterestedStatus;

export default function AdminInterested() {
  const [filter, setFilter] = useState<InterestedFilter>("all");
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data: requests = [], isLoading, refetch } = trpc.visitRequests.list.useQuery();
  const updateStatus = trpc.visitRequests.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Estado actualizado");
      await utils.visitRequests.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo actualizar el estado");
    },
  });

  const requestItems = requests as InterestedItem[];

  const counts = useMemo(() => {
    const base = {
      all: requestItems.length,
      new: 0,
      contacted: 0,
      visited: 0,
      negotiating: 0,
      closed: 0,
      not_interested: 0,
    };

    requestItems.forEach((request) => {
      base[request.status] += 1;
    });

    return base;
  }, [requestItems]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requestItems.filter((request) => {
      const matchesFilter = filter === "all" || request.status === filter;
      const matchesSearch =
        !normalizedSearch ||
        request.name.toLowerCase().includes(normalizedSearch) ||
        request.propertyTitle.toLowerCase().includes(normalizedSearch) ||
        request.reference.toLowerCase().includes(normalizedSearch) ||
        request.whatsapp.toLowerCase().includes(normalizedSearch) ||
        (request.email ?? "").toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, requestItems, search]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Interesados
            </h1>
            <p className="mt-1 text-sm text-black/55">
              Seguimiento de cada consulta con estado, notas e historial.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTERESTED_STATUS_OPTIONS.map((option) => (
              <span
                key={option.value}
                className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500"
              >
                {option.label}: {counts[option.value]}
              </span>
            ))}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
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
              Todos
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${filter === "all" ? "bg-white/15" : "bg-black/5 text-black/70"}`}>
                {counts.all}
              </span>
            </button>

            {INTERESTED_STATUS_OPTIONS.map((option) => {
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
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${isSelected ? "bg-white/15" : "bg-black/5 text-black/70"}`}>
                    {counts[option.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, WhatsApp, email, propiedad o referencia..."
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <UserRound className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-semibold text-zinc-700">No hay interesados para mostrar.</p>
            <p className="mt-1 text-sm text-zinc-500">
              {search || filter !== "all"
                ? "Prueba con otra búsqueda o cambia el filtro."
                : "Las nuevas consultas aparecerán acá para darles seguimiento."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const statusConfig = INTERESTED_STATUS_CONFIG[request.status];

              return (
                <article
                  key={request.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-base font-black text-zinc-950">
                          {request.name}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                          {request.reference}
                        </span>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>{format(parseISO(request.createdAt), "d 'de' MMMM yyyy · HH:mm", { locale: es })}</span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {request.whatsapp}
                        </span>
                        {request.email ? (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {request.email}
                          </span>
                        ) : null}
                      </div>

                      <div className="mb-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                          Propiedad vinculada
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-950">
                          {request.propertyTitle}
                        </p>
                      </div>

                      <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
                        {request.message}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 xl:w-52">
                      <Select
                        value={request.status}
                        onValueChange={(value) =>
                          updateStatus.mutate({
                            id: request.id,
                            status: value as InterestedStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
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

                      <Link href={`/admin/interesados/${request.id}`}>
                        <span className="inline-flex h-9 w-full items-center justify-center rounded-md border border-black/15 px-3 text-sm font-medium text-black hover:border-black/35 hover:bg-black/[0.02]">
                          Ver ficha
                        </span>
                      </Link>

                      <a
                        href={getInterestedWhatsAppHref(
                          request.whatsapp,
                          `Hola ${request.name}, te escribimos por tu consulta sobre ${request.propertyTitle}.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-black/15 px-3 text-sm font-medium text-black hover:border-black/35 hover:bg-black/[0.02]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
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
