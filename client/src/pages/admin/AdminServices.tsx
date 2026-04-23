import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock, Loader2, DollarSign } from "lucide-react";

interface ServiceForm {
  name: string;
  description: string;
  price: string;
  duration: string;
}

const EMPTY_FORM: ServiceForm = { name: "", description: "", price: "", duration: "60" };

function formatPrice(price: string | number, currency = "ARS") {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `${currency} ${num.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function AdminServices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: services = [], refetch } = trpc.services.list.useQuery();
  const { data: profile } = trpc.business.get.useQuery();

  const createService = trpc.services.create.useMutation({
    onSuccess: () => { toast.success("Servicio creado"); refetch(); setDialogOpen(false); },
    onError: () => toast.error("Error al crear el servicio"),
  });

  const updateService = trpc.services.update.useMutation({
    onSuccess: () => { toast.success("Servicio actualizado"); refetch(); setDialogOpen(false); },
    onError: () => toast.error("Error al actualizar el servicio"),
  });

  const deleteService = trpc.services.delete.useMutation({
    onSuccess: () => { toast.success("Servicio eliminado"); refetch(); setDeleteConfirm(null); },
    onError: () => toast.error("Error al eliminar el servicio"),
  });

  const currency = profile?.currency ?? "ARS";

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (service: { id: number; name: string; description?: string | null; price: string; duration: number }) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? "",
      price: String(service.price),
      duration: String(service.duration),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) {
      toast.error("Completá todos los campos obligatorios");
      return;
    }
    const price = parseFloat(form.price);
    const duration = parseInt(form.duration, 10);
    if (isNaN(price) || price < 0) { toast.error("Precio inválido"); return; }
    if (isNaN(duration) || duration < 15) { toast.error("Duración mínima: 15 minutos"); return; }

    if (editingId) {
      await updateService.mutateAsync({
        id: editingId,
        name: form.name,
        description: form.description || undefined,
        price,
        duration,
      });
    } else {
      await createService.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        price,
        duration,
      });
    }
  };

  const isLoading = createService.isPending || updateService.isPending;

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-black text-black tracking-tight"
            >
              Servicios
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {services.length} servicio{services.length !== 1 ? "s" : ""} configurado{services.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="gap-2 font-semibold"
            style={{ background: "black", color: "white" }}
          >
            <Plus className="w-4 h-4" />
            Nuevo servicio
          </Button>
        </div>

        {/* List */}
        {services.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <DollarSign className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground">No hay servicios</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Agregá tu primer servicio para que los clientes puedan reservar.
            </p>
            <Button
              onClick={openCreate}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar servicio
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-sm">{service.name}</h3>
                    {!service.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(service.duration)}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(service.price, currency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(service)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(service.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle >
                {editingId ? "Editar servicio" : "Nuevo servicio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Masaje relajante"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Descripción</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del servicio..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Precio ({currency}) *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Duración (min) *
                  </Label>
                  <Input
                    type="number"
                    min={15}
                    max={480}
                    step={15}
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="60"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{ background: "black", color: "white" }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    "Guardar cambios"
                  ) : (
                    "Crear servicio"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>¿Eliminar servicio?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={deleteService.isPending}
                onClick={() => deleteConfirm && deleteService.mutate({ id: deleteConfirm })}
              >
                {deleteService.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
