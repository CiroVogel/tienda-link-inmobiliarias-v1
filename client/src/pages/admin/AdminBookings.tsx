import { useMemo, useState } from "react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
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
  isInterestedResolved,
  type InterestedItem,
  type InterestedStatus,
} from "@/lib/interested";
import { trpc } from "@/lib/trpc";

type ConsultasFilter = "all" | "new" | "active" | "resolved";

export default function AdminBookings() {
  const [filter, setFilter] = useState<ConsultasFilter>("all");
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
    const active = requestItems.filter(
      (request) =>
        request.status === "contacted" ||
        request.status === "visited" ||
        request.status === "negotiating",
    ).length;

    const resolved = requestItems.filter((request) =>
      isInterestedResolved(request.status),
    ).length;

    return {
      all: requestItems.length,
      new: requestItems.filter((request) => request.status === "new").length,
      active,
      resolved,
    };
  }, [requestItems]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requestItems.filter((request) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "new" && request.status === "new") ||
        (filter === "active" &&
          ["contacted", "visited", "negotiating"].includes(request.status)) ||
        (filter === "resolved" && isInterestedResolved(request.status));

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
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Consultas
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600">
              {counts.new} nuevas · {counts.active} en seguimiento · {counts.resolved} resueltas
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-2">
            {([
              { value: "all", label: "Todas", count: counts.all },
              { value: "new", label: "Nuevas", count: counts.new },
              { value: "active", label: "En seguimiento", count: counts.active },
              { value: "resolved", label: "Resueltas", count: counts.resolved },
            ] as Array<{ value: ConsultasFilter; label: string; count: number }>).map(
              (item) => {
                const isSelected = filter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      isSelected
                        ? "border-transparent bg-black text-white"
                        : "border-black/15 text-black/65 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                        isSelected ? "bg-white/15" : "bg-black/5 text-black/70"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Buscar por nombre, email, WhatsApp, referencia o propiedad..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-zinc-600">
            <Clock className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium">No hay consultas para mostrar</p>
            <p className="mt-1 text-sm">
              {search || filter !== "all"
                ? "No encontramos consultas con esos filtros."
                : "Todavía no entraron consultas nuevas."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const statusConfig = INTERESTED_STATUS_CONFIG[request.status];

              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-sm font-semibold text-black">
                          {request.name}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/65">
                          {request.reference}
                        </span>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(request.createdAt), "d 'de' MMMM yyyy · HH:mm", {
                            locale: es,
                          })}
                        </span>
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

                      <div className="mb-3 rounded-xl border border-black/10 bg-black/[0.02] px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                          Propiedad vinculada
                        </p>
                        <p className="mt-1 text-sm font-medium text-black">
                          {request.propertyTitle}
                        </p>
                      </div>

                      <p className="text-sm leading-6 text-black/70">
                        {request.message}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:w-48">
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
                          Abrir ficha
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
