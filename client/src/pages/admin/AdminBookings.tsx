import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
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
import { trpc } from "@/lib/trpc";

type VisitRequestStatus = "all" | "new" | "contacted" | "closed";

type VisitRequestItem = {
  id: string;
  reference: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  whatsapp: string;
  email: string | null;
  message: string;
  status: Exclude<VisitRequestStatus, "all">;
  createdAt: string;
  updatedAt: string;
};

const STATUS_CONFIG = {
  new: {
    label: "Nueva",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertCircle,
  },
  contacted: {
    label: "Contactada",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: MessageSquare,
  },
  closed: {
    label: "Cerrada",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
} as const;

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<VisitRequestStatus>("all");
  const [search, setSearch] = useState("");

  const { data: profile } = trpc.business.get.useQuery();
  const { data: requests = [], isLoading, refetch } = trpc.visitRequests.list.useQuery();
  const updateStatus = trpc.visitRequests.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo actualizar el estado");
    },
  });

  const requestItems = requests as VisitRequestItem[];

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requestItems.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        request.name.toLowerCase().includes(normalizedSearch) ||
        request.propertyTitle.toLowerCase().includes(normalizedSearch) ||
        request.reference.toLowerCase().includes(normalizedSearch) ||
        request.whatsapp.toLowerCase().includes(normalizedSearch) ||
        (request.email ?? "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [requestItems, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: requestItems.length,
      new: requestItems.filter((request) => request.status === "new").length,
      contacted: requestItems.filter((request) => request.status === "contacted").length,
      closed: requestItems.filter((request) => request.status === "closed").length,
    }),
    [requestItems],
  );

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Consultas
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {counts.new} nuevas · {counts.contacted} contactadas · {counts.closed} cerradas
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
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Seguimiento
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Consultas recibidas desde propiedades publicadas.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredRequests.length} resultado{filteredRequests.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "new", "contacted", "closed"] as VisitRequestStatus[]).map((status) => {
              const isSelected = statusFilter === status;
              const label =
                status === "all" ? "Todas" : STATUS_CONFIG[status].label;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? "border-transparent bg-black text-white"
                      : "border-black/15 text-black/55 hover:border-black/40 hover:text-black"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      isSelected ? "bg-white/15" : "bg-black/5 text-black/70"
                    }`}
                  >
                    {counts[status]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por propiedad, nombre, email, WhatsApp o referencia..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Clock className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium">No hay consultas</p>
            <p className="mt-1 text-sm">
              {search || statusFilter !== "all"
                ? "No se encontraron consultas con los filtros aplicados."
                : "Todavia no llegaron solicitudes de visita."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status];
              const StatusIcon = statusConfig.icon;
              const publicPropertyHref = profile?.slug
                ? `/${profile.slug}/propiedades/${request.propertyId}`
                : null;

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
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/45">
                          {request.reference}
                        </span>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Propiedad vinculada
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <p className="text-sm font-medium text-black">
                            {request.propertyTitle}
                          </p>
                          {publicPropertyHref ? (
                            <a
                              href={publicPropertyHref}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold uppercase tracking-[0.14em] text-black/55 hover:text-black"
                            >
                              Ver ficha
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Mensaje
                        </p>
                        <p className="text-sm leading-6 text-black/70">
                          {request.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Select
                        value={request.status}
                        onValueChange={(value) =>
                          updateStatus.mutate({
                            id: request.id,
                            status: value as "new" | "contacted" | "closed",
                          })
                        }
                      >
                        <SelectTrigger className="h-9 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nueva</SelectItem>
                          <SelectItem value="contacted">Contactada</SelectItem>
                          <SelectItem value="closed">Cerrada</SelectItem>
                        </SelectContent>
                      </Select>
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
