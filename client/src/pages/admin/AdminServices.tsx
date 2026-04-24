import { useMemo, useState } from "react";
import { Eye, EyeOff, Home, Loader2, Pencil, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  getOperationLabel,
  getStatusLabel,
  type PropertyOperation,
  type PropertyStatus,
} from "@/lib/realEstateDemo";

type AdminProperty = {
  id: string;
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  features: string[];
  description: string;
  featured: boolean;
  images: Array<{ id: string; url: string }>;
};

type PropertyForm = {
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: string;
  description: string;
  featuresText: string;
  featured: boolean;
};

const EMPTY_FORM: PropertyForm = {
  title: "",
  operation: "sale",
  status: "available",
  price: "",
  location: "",
  address: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  areaM2: "",
  description: "",
  featuresText: "",
  featured: false,
};

function parseOptionalInt(value: string) {
  if (!value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toFeatureList(value: string) {
  return value
    .split(/\n|,/)
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function toForm(property: AdminProperty): PropertyForm {
  return {
    title: property.title,
    operation: property.operation,
    status: property.status,
    price: property.price,
    location: property.location,
    address: property.address,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    areaM2: property.areaM2 != null ? String(property.areaM2) : "",
    description: property.description,
    featuresText: property.features.join("\n"),
    featured: property.featured,
  };
}

function toPayload(form: PropertyForm) {
  return {
    title: form.title.trim(),
    operation: form.operation,
    status: form.status,
    price: form.price.trim(),
    location: form.location.trim(),
    address: form.address.trim(),
    propertyType: form.propertyType.trim(),
    bedrooms: parseOptionalInt(form.bedrooms),
    bathrooms: parseOptionalInt(form.bathrooms),
    areaM2: parseOptionalInt(form.areaM2),
    description: form.description.trim(),
    features: toFeatureList(form.featuresText),
    featured: form.featured,
  };
}

export default function AdminServices() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM);

  const { data: properties = [] } = trpc.properties.list.useQuery();

  const createProperty = trpc.properties.create.useMutation({
    onSuccess: async () => {
      toast.success("Propiedad creada");
      await utils.properties.list.invalidate();
      setDialogOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("No pudimos crear la propiedad"),
  });

  const updateProperty = trpc.properties.update.useMutation({
    onSuccess: async () => {
      toast.success("Propiedad actualizada");
      await utils.properties.list.invalidate();
      setDialogOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("No pudimos actualizar la propiedad"),
  });

  const isSaving = createProperty.isPending || updateProperty.isPending;

  const sortedProperties = useMemo(
    () =>
      [...properties].sort((left, right) => {
        if (left.featured !== right.featured) {
          return left.featured ? -1 : 1;
        }

        return left.title.localeCompare(right.title, "es");
      }),
    [properties],
  );

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(property: AdminProperty) {
    setEditingId(property.id);
    setForm(toForm(property));
    setDialogOpen(true);
  }

  async function quickToggleVisibility(property: AdminProperty) {
    await updateProperty.mutateAsync({
      id: property.id,
      ...toPayload(toForm(property)),
      status: property.status === "hidden" ? "available" : "hidden",
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim() || !form.price.trim() || !form.location.trim() || !form.propertyType.trim()) {
      toast.error("Completa titulo, precio, ubicacion y tipo de propiedad.");
      return;
    }

    const payload = toPayload(form);

    if (editingId) {
      await updateProperty.mutateAsync({
        id: editingId,
        ...payload,
      });
      return;
    }

    await createProperty.mutateAsync(payload);
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Propiedades</h1>
            <p className="mt-1 text-sm text-black/50">
              {properties.length} propiedad{properties.length !== 1 ? "es" : ""} en gestion
            </p>
          </div>

          <Button onClick={openCreate} className="gap-2 bg-black text-white hover:bg-black/85">
            <Plus className="h-4 w-4" />
            Nueva propiedad
          </Button>
        </div>

        {sortedProperties.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
            <Home className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="font-semibold text-zinc-700">Todavia no cargaste propiedades.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Crea la primera propiedad para empezar a publicar desde el admin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProperties.map((property) => (
              <article
                key={property.id}
                className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 md:flex-row md:items-start md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="bg-zinc-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                      {getOperationLabel(property.operation)}
                    </span>
                    <span className="bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-600">
                      {getStatusLabel(property.status)}
                    </span>
                    {property.featured ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                        <Star className="h-3 w-3 fill-current" />
                        Destacada
                      </span>
                    ) : null}
                  </div>

                  <h2 className="text-lg font-black text-zinc-950">{property.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {property.location} | {property.propertyType}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-900">{property.price}</span>
                    <span>{property.address}</span>
                    <span>{property.images.length} foto{property.images.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(property)}
                    className="h-9 w-9 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickToggleVisibility(property)}
                    disabled={updateProperty.isPending}
                    className="h-9 w-9 p-0"
                    title={property.status === "hidden" ? "Mostrar" : "Ocultar"}
                  >
                    {property.status === "hidden" ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar propiedad" : "Nueva propiedad"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="mb-1.5 block">Titulo</Label>
                  <Input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ej: Departamento 2 dormitorios en Centro"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Operacion</Label>
                  <select
                    value={form.operation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        operation: event.target.value as PropertyOperation,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="sale">Venta</option>
                    <option value="rent">Alquiler</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-1.5 block">Estado publico</Label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as PropertyStatus,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="available">Disponible</option>
                    <option value="reserved">Reservada</option>
                    <option value="sold">Vendida</option>
                    <option value="rented">Alquilada</option>
                    <option value="hidden">Oculta</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-1.5 block">Precio</Label>
                  <Input
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="USD 118.000"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Tipo de propiedad</Label>
                  <Input
                    value={form.propertyType}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, propertyType: event.target.value }))
                    }
                    placeholder="Departamento"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Ubicacion</Label>
                  <Input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, location: event.target.value }))
                    }
                    placeholder="Centro, Rosario"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Direccion</Label>
                  <Input
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                    placeholder="Entre Rios al 900"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Dormitorios</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.bedrooms}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, bedrooms: event.target.value }))
                    }
                    placeholder="2"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Banos</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.bathrooms}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, bathrooms: event.target.value }))
                    }
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Superficie m2</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.areaM2}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, areaM2: event.target.value }))
                    }
                    placeholder="72"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, featured: event.target.checked }))
                      }
                    />
                    Destacar en home
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-1.5 block">Descripcion</Label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={4}
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Descripcion breve de la propiedad"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-1.5 block">Caracteristicas</Label>
                  <textarea
                    value={form.featuresText}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, featuresText: event.target.value }))
                    }
                    rows={4}
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={"Una por linea\nBalcon al frente\nCocina separada"}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-black text-white hover:bg-black/85">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Guardar cambios"
                  ) : (
                    "Crear propiedad"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
