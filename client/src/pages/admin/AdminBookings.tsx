import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
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
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type BookingStatus = "all" | "pending" | "confirmed" | "cancelled" | "completed";
type BookingView = "active" | "archived";

type BookingItem = {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookingDate: string;
  bookingTime: string;
  status: Exclude<BookingStatus, "all">;
  totalAmount: string | number;
  depositAmount?: string | number | null;
  paymentType: "deposit" | "full";
  notes?: string | null;
  serviceName?: string;
  archivedAt?: string | null;
};

const STATUS_CONFIG = {
  pending: {
    label: "Nueva",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Contactada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Descartada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  completed: {
    label: "Cerrada",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle2,
  },
};

const VIEW_CONFIG: Record<BookingView, { title: string; description: string }> = {
  active: {
    title: "Abiertas",
    description: "Consultas visibles para el seguimiento diario.",
  },
  archived: {
    title: "Archivadas",
    description: "Consultas que sacaste del listado principal.",
  },
};

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<BookingView>("active");

  const { data: bookings = [], isLoading, refetch } = trpc.bookings.list.useQuery();
  const updateStatus = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado");
      refetch();
    },
    onError: () => toast.error("Error al actualizar el estado"),
  });

  const archiveBooking = trpc.bookings.archive.useMutation({
    onSuccess: () => {
      toast.success("Consulta archivada");
      refetch();
    },
    onError: (error) => toast.error(error.message || "No se pudo archivar la consulta"),
  });

  const restoreBooking = trpc.bookings.restore.useMutation({
    onSuccess: () => {
      toast.success("Consulta restaurada");
      refetch();
    },
    onError: () => toast.error("No se pudo restaurar la consulta"),
  });

  const bookingItems = bookings as BookingItem[];

  const activeBookings = useMemo(
    () => bookingItems.filter((booking) => !booking.archivedAt),
    [bookingItems]
  );
  const archivedBookings = useMemo(
    () => bookingItems.filter((booking) => !!booking.archivedAt),
    [bookingItems]
  );

  const visibleBookings = view === "active" ? activeBookings : archivedBookings;

  const filtered = useMemo(() => {
    return visibleBookings.filter((booking) => {
      const matchStatus = statusFilter === "all" || booking.status === statusFilter;
      const normalizedSearch = search.trim().toLowerCase();
      const matchSearch =
        !normalizedSearch ||
        booking.clientName.toLowerCase().includes(normalizedSearch) ||
        booking.clientEmail.toLowerCase().includes(normalizedSearch) ||
        booking.clientPhone.includes(normalizedSearch);

      return matchStatus && matchSearch;
    });
  }, [visibleBookings, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: visibleBookings.length,
      pending: visibleBookings.filter((booking) => booking.status === "pending").length,
      confirmed: visibleBookings.filter((booking) => booking.status === "confirmed").length,
      cancelled: visibleBookings.filter((booking) => booking.status === "cancelled").length,
      completed: visibleBookings.filter((booking) => booking.status === "completed").length,
    }),
    [visibleBookings]
  );

  const viewLabel = VIEW_CONFIG[view];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Consultas</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {activeBookings.length} en seguimiento · {archivedBookings.length} archivadas
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Vista actual
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{viewLabel.description}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {(["active", "archived"] as BookingView[]).map((viewOption) => {
              const isSelected = view === viewOption;
              const total = viewOption === "active" ? activeBookings.length : archivedBookings.length;
              const config = VIEW_CONFIG[viewOption];

              return (
                <button
                  key={viewOption}
                  type="button"
                  onClick={() => setView(viewOption)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                    isSelected
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-black/10 bg-white text-black hover:border-black/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{config.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isSelected ? "bg-white/15 text-white" : "bg-black/5 text-black/70"
                      }`}
                    >
                      {total}
                    </span>
                  </div>
                  <p className={`mt-1 text-xs ${isSelected ? "text-white/75" : "text-muted-foreground"}`}>
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Filtrar por estado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aplicado sobre <span className="font-medium text-black">{viewLabel.title.toLowerCase()}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((status) => {
              const isSelected = statusFilter === status;
              const label =
                status === "all"
                  ? "Todas"
                  : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label;

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
            placeholder="Buscar por nombre, email o WhatsApp..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium">No hay consultas</p>
            <p className="mt-1 text-sm">
              {search || statusFilter !== "all"
                ? "No se encontraron consultas con los filtros aplicados."
                : view === "active"
                  ? "No hay consultas visibles en el listado principal."
                  : "Todavia no archivaste consultas."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const canArchive =
                view === "active" &&
                (booking.status === "cancelled" || booking.status === "completed");

              return (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="truncate text-sm font-semibold">{booking.clientName}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                        {booking.archivedAt && (
                          <span className="inline-flex items-center rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/60">
                            Archivada
                          </span>
                        )}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(booking.bookingDate), "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.bookingTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {booking.clientEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {booking.clientPhone}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-medium text-foreground">{booking.serviceName ?? "Consulta recibida"}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">Seguimiento comercial</span>
                      </div>

                      {booking.notes && (
                        <p className="mt-2 text-xs italic text-muted-foreground">&quot;{booking.notes}&quot;</p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          updateStatus.mutate({
                            id: booking.id,
                            status: value as "pending" | "confirmed" | "cancelled" | "completed",
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Nueva</SelectItem>
                          <SelectItem value="confirmed">Contactada</SelectItem>
                          <SelectItem value="completed">Cerrada</SelectItem>
                          <SelectItem value="cancelled">Descartada</SelectItem>
                        </SelectContent>
                      </Select>

                      {canArchive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => archiveBooking.mutate({ id: booking.id })}
                          disabled={archiveBooking.isPending}
                        >
                          Archivar
                        </Button>
                      )}

                      {view === "archived" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => restoreBooking.mutate({ id: booking.id })}
                          disabled={restoreBooking.isPending}
                        >
                          Restaurar
                        </Button>
                      )}
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

