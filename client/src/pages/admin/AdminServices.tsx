import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Download,
  Eye,
  EyeOff,
  Home,
  Images,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
} from "lucide-react";
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
import { generatePropertyPdf } from "@/lib/propertyPdf";
import {
  detailedPropertyFeatureGroups,
  getOperationLabel,
  getStatusLabel,
  propertyDispositionOptions,
  propertyOrientationOptions,
  type PropertyDisposition,
  type PropertyOperation,
  type PropertyOrientation,
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
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  ageYears: number | null;
  expenses: string | null;
  coveredAreaM2: number | null;
  uncoveredAreaM2: number | null;
  areaM2: number | null;
  disposition: PropertyDisposition | null;
  orientation: PropertyOrientation | null;
  detailedFeatures: string[];
  features: string[];
  description: string;
  featured: boolean;
  images: Array<{ id: string; url: string }>;
  createdAt: string;
  updatedAt: string;
};

type PropertyForm = {
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  garages: string;
  ageYears: string;
  expenses: string;
  coveredAreaM2: string;
  uncoveredAreaM2: string;
  areaM2: string;
  disposition: PropertyDisposition | "";
  orientation: PropertyOrientation | "";
  detailedFeatures: string[];
  description: string;
  featuresText: string;
  featured: boolean;
};

type OperationFilter = "all" | PropertyOperation;
type StatusFilter = "all" | PropertyStatus;
type FeaturedFilter = "all" | "featured" | "regular";
type VisibilityFilter = "all" | "visible" | "hidden";
type SortOrder = "recent" | "oldest";

const EMPTY_FORM: PropertyForm = {
  title: "",
  operation: "sale",
  status: "available",
  price: "",
  location: "",
  address: "",
  propertyType: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  garages: "",
  ageYears: "",
  expenses: "",
  coveredAreaM2: "",
  uncoveredAreaM2: "",
  areaM2: "",
  disposition: "",
  orientation: "",
  detailedFeatures: [],
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
    rooms: property.rooms != null ? String(property.rooms) : "",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    garages: property.garages != null ? String(property.garages) : "",
    ageYears: property.ageYears != null ? String(property.ageYears) : "",
    expenses: property.expenses ?? "",
    coveredAreaM2: property.coveredAreaM2 != null ? String(property.coveredAreaM2) : "",
    uncoveredAreaM2: property.uncoveredAreaM2 != null ? String(property.uncoveredAreaM2) : "",
    areaM2: property.areaM2 != null ? String(property.areaM2) : "",
    disposition: property.disposition ?? "",
    orientation: property.orientation ?? "",
    detailedFeatures: property.detailedFeatures ?? [],
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
    rooms: parseOptionalInt(form.rooms),
    bedrooms: parseOptionalInt(form.bedrooms),
    bathrooms: parseOptionalInt(form.bathrooms),
    garages: parseOptionalInt(form.garages),
    ageYears: parseOptionalInt(form.ageYears),
    expenses: form.expenses.trim() || null,
    coveredAreaM2: parseOptionalInt(form.coveredAreaM2),
    uncoveredAreaM2: parseOptionalInt(form.uncoveredAreaM2),
    areaM2: parseOptionalInt(form.areaM2),
    disposition: form.disposition || null,
    orientation: form.orientation || null,
    detailedFeatures: form.detailedFeatures,
    description: form.description.trim(),
    features: toFeatureList(form.featuresText),
    featured: form.featured,
  };
}

function toSearchableText(property: AdminProperty) {
  return [
    property.title,
    property.location,
    property.address,
    property.propertyType,
  ]
    .join(" ")
    .toLowerCase();
}

function parseCreatedAt(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function AdminServices() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [operationFilter, setOperationFilter] = useState<OperationFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [quickActionId, setQuickActionId] = useState<string | null>(null);
  const [pdfPropertyId, setPdfPropertyId] = useState<string | null>(null);

  const { data: properties = [] } = trpc.properties.list.useQuery();
  const { data: profile } = trpc.business.get.useQuery();

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
      await utils.properties.list.invalidate();
      setDialogOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("No pudimos actualizar la propiedad"),
  });

  const isSaving = createProperty.isPending || updateProperty.isPending;

  const filteredProperties = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...properties]
      .filter((property) => {
        if (normalizedSearch && !toSearchableText(property).includes(normalizedSearch)) {
          return false;
        }

        if (operationFilter !== "all" && property.operation !== operationFilter) {
          return false;
        }

        if (statusFilter !== "all" && property.status !== statusFilter) {
          return false;
        }

        if (featuredFilter === "featured" && !property.featured) {
          return false;
        }

        if (featuredFilter === "regular" && property.featured) {
          return false;
        }

        if (visibilityFilter === "visible" && property.status === "hidden") {
          return false;
        }

        if (visibilityFilter === "hidden" && property.status !== "hidden") {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const diff = parseCreatedAt(left.createdAt) - parseCreatedAt(right.createdAt);
        if (diff !== 0) {
          return sortOrder === "oldest" ? diff : -diff;
        }

        return left.title.localeCompare(right.title, "es");
      });
  }, [
    featuredFilter,
    operationFilter,
    properties,
    search,
    sortOrder,
    statusFilter,
    visibilityFilter,
  ]);

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

  function toggleDetailedFeature(feature: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      detailedFeatures: checked
        ? Array.from(new Set([...current.detailedFeatures, feature]))
        : current.detailedFeatures.filter((item) => item !== feature),
    }));
  }

  async function runQuickUpdate(
    property: AdminProperty,
    changes: Partial<ReturnType<typeof toPayload>>,
    successMessage: string,
  ) {
    setQuickActionId(property.id);

    try {
      await updateProperty.mutateAsync({
        id: property.id,
        ...toPayload(toForm(property)),
        ...changes,
      });
      toast.success(successMessage);
    } finally {
      setQuickActionId(null);
    }
  }

  async function quickToggleVisibility(property: AdminProperty) {
    await runQuickUpdate(
      property,
      { status: property.status === "hidden" ? "available" : "hidden" },
      property.status === "hidden"
        ? "Propiedad visible otra vez"
        : "Propiedad oculta del sitio publico",
    );
  }

  async function quickToggleFeatured(property: AdminProperty) {
    await runQuickUpdate(
      property,
      { featured: !property.featured },
      property.featured ? "Quitamos la propiedad de destacadas" : "Propiedad destacada en home",
    );
  }

  async function handleDownloadPdf(property: AdminProperty) {
    if (!profile) {
      toast.error("Necesitamos el perfil de la inmobiliaria para generar el PDF.");
      return;
    }

    setPdfPropertyId(property.id);

    try {
      await generatePropertyPdf({
        property: {
          ...property,
          images: property.images.map((image) => image.url),
        },
        profile,
      });
      toast.success("PDF generado");
    } catch (error) {
      console.error(error);
      toast.error("No pudimos generar el PDF.");
    } finally {
      setPdfPropertyId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim() || !form.price.trim() || !form.location.trim() || !form.propertyType.trim()) {
      toast.error("Completa título, precio, ubicación y tipo de propiedad.");
      return;
    }

    const payload = toPayload(form);

    if (editingId) {
      await updateProperty.mutateAsync({
        id: editingId,
        ...payload,
      });
      toast.success("Propiedad actualizada");
      return;
    }

    await createProperty.mutateAsync(payload);
  }

  const totalProperties = properties.length;
  const visibleProperties = properties.filter((property) => property.status !== "hidden").length;
  const hiddenProperties = totalProperties - visibleProperties;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Propiedades</h1>
            <p className="mt-1 text-sm text-slate-500">
              {totalProperties} propiedad{totalProperties !== 1 ? "es" : ""} en gestión
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#172124]">
            <span className="rounded-full border border-[#ded8cc] bg-white px-3 py-2">
              {visibleProperties} visibles
            </span>
            <span className="rounded-full border border-[#ded8cc] bg-white px-3 py-2">
              {hiddenProperties} ocultas
            </span>
            <span className="rounded-full border border-[#ded8cc] bg-white px-3 py-2">
              {properties.filter((property) => property.featured).length} destacadas
            </span>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-[#ded8cc] bg-white p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_180px_170px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#465153]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, ubicación, dirección o tipo"
                className="pl-9"
              />
            </div>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              className="h-10 rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
            >
              <option value="recent">Mas recientes</option>
              <option value="oldest">Mas antiguas</option>
            </select>

            <Button onClick={openCreate} className="gap-2 bg-[#12383d] text-white hover:bg-[#0f646a]">
              <Plus className="h-4 w-4" />
              Nueva propiedad
            </Button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={operationFilter}
              onChange={(event) => setOperationFilter(event.target.value as OperationFilter)}
              className="h-10 rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
            >
              <option value="all">Todas las operaciones</option>
              <option value="sale">Venta</option>
              <option value="rent">Alquiler</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-10 rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="reserved">Reservada</option>
              <option value="sold">Vendida</option>
              <option value="rented">Alquilada</option>
              <option value="hidden">Oculta</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(event) => setFeaturedFilter(event.target.value as FeaturedFilter)}
              className="h-10 rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
            >
              <option value="all">Todas las destacadas</option>
              <option value="featured">Solo destacadas</option>
              <option value="regular">No destacadas</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
              className="h-10 rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
            >
              <option value="all">Visibles y ocultas</option>
              <option value="visible">Solo visibles</option>
              <option value="hidden">Solo ocultas</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Mostrando <span className="font-semibold text-[#172124]">{filteredProperties.length}</span> de{" "}
              <span className="font-semibold text-[#172124]">{totalProperties}</span> propiedades
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setOperationFilter("all");
                setStatusFilter("all");
                setFeaturedFilter("all");
                setVisibilityFilter("all");
                setSortOrder("recent");
              }}
              className="text-xs font-bold uppercase tracking-[0.14em] text-[#172124] hover:text-[#172124]"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {totalProperties === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#ded8cc] bg-white px-6 py-16 text-center">
            <Home className="mx-auto mb-3 h-10 w-10 text-[#c8c0b4]" />
            <p className="font-semibold text-[#172124]">Todavía no cargaste propiedades.</p>
            <p className="mt-1 text-sm text-slate-500">
              Crea la primera propiedad para empezar a publicar desde el admin.
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-xl border border-[#ded8cc] bg-white px-6 py-16 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-[#c8c0b4]" />
            <p className="font-semibold text-[#172124]">No encontramos propiedades con esos filtros.</p>
            <p className="mt-1 text-sm text-slate-500">
              Prueba otra búsqueda o limpia los filtros para volver al listado completo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((property) => {
              const isQuickUpdating = quickActionId === property.id && updateProperty.isPending;
              const isGeneratingPdf = pdfPropertyId === property.id;

              return (
                <article
                  key={property.id}
                  className="rounded-xl border border-[#ded8cc] bg-white p-5"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#12383d] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                        {getOperationLabel(property.operation)}
                      </span>
                      <span className="bg-[#f0ede6] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#465153]">
                        {getStatusLabel(property.status)}
                      </span>
                      {property.featured ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                          <Star className="h-3 w-3 fill-current" />
                          Destacada
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-lg font-black text-[#172124]">{property.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {property.location} | {property.propertyType}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#172124]">{property.price}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#465153]">
                      <span>{property.address}</span>
                      <span>{property.images.length} foto{property.images.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#ded8cc] pt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(property)}
                      className="inline-flex items-center gap-2 h-9 rounded-[7px] whitespace-nowrap px-3 text-sm font-medium bg-[#12383d] text-white hover:bg-[#0f646a] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>

                    <Link href={`/admin/gallery?propertyId=${property.id}`}>
                      <span className="inline-flex items-center gap-2 h-9 rounded-[7px] whitespace-nowrap px-3 text-sm font-medium border border-[#ded8cc] bg-white text-[#172124] hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d] transition-colors cursor-pointer">
                        <Images className="h-4 w-4" />
                        Fotos
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleDownloadPdf(property)}
                      disabled={isGeneratingPdf}
                      className="inline-flex items-center gap-2 h-9 rounded-[7px] whitespace-nowrap px-3 text-sm font-medium border border-[#ded8cc] bg-white text-[#172124] hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => void quickToggleFeatured(property)}
                      disabled={isQuickUpdating}
                      className="inline-flex items-center gap-2 h-9 rounded-[7px] whitespace-nowrap px-3 text-sm font-medium border border-[#ded8cc] bg-white text-[#172124] hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isQuickUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className={`h-4 w-4 ${property.featured ? "fill-current" : ""}`} />
                      )}
                      {property.featured ? "Quitar destacada" : "Destacar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void quickToggleVisibility(property)}
                      disabled={isQuickUpdating}
                      title={property.status === "hidden" ? "Mostrar" : "Ocultar"}
                      className="inline-flex items-center gap-2 h-9 rounded-[7px] whitespace-nowrap px-3 text-sm font-medium border border-[#ded8cc] bg-white text-[#172124] hover:border-[#12383d] hover:bg-[#eef4f2] hover:text-[#12383d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isQuickUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : property.status === "hidden" ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      {property.status === "hidden" ? "Mostrar" : "Ocultar"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
            <DialogHeader className="sticky top-0 z-10 border-b border-[#ded8cc] bg-white px-6 py-5 pr-12">
              <DialogTitle>{editingId ? "Editar propiedad" : "Nueva propiedad"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="mb-1.5 block">Título</Label>
                  <Input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ej: Departamento 2 dormitorios en Centro"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Operación</Label>
                  <select
                    value={form.operation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        operation: event.target.value as PropertyOperation,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
                  >
                    <option value="sale">Venta</option>
                    <option value="rent">Alquiler</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-1.5 block">Estado público</Label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as PropertyStatus,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
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
                  <Label className="mb-1.5 block">Ubicación</Label>
                  <Input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, location: event.target.value }))
                    }
                    placeholder="Centro, Rosario"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Dirección</Label>
                  <Input
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                    placeholder="Entre Ríos al 900"
                  />
                </div>

                <section className="md:col-span-2 rounded-md border border-[#ded8cc] bg-[#f7f5ef] p-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#172124]">
                    Características detalladas
                  </h3>

                  <div className="mt-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Datos principales
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label className="mb-1.5 block">Ambientes</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.rooms}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, rooms: event.target.value }))
                          }
                          placeholder="3"
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
                        <Label className="mb-1.5 block">Baños</Label>
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
                        <Label className="mb-1.5 block">Cocheras</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.garages}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, garages: event.target.value }))
                          }
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <Label className="mb-1.5 block">Antigüedad (años)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.ageYears}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, ageYears: event.target.value }))
                          }
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <Label className="mb-1.5 block">Expensas</Label>
                        <Input
                          value={form.expenses}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, expenses: event.target.value }))
                          }
                          placeholder="$ 35.000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Superficies
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label className="mb-1.5 block">Superficie cubierta</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.coveredAreaM2}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              coveredAreaM2: event.target.value,
                            }))
                          }
                          placeholder="60"
                        />
                      </div>

                      <div>
                        <Label className="mb-1.5 block">Superficie descubierta</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.uncoveredAreaM2}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              uncoveredAreaM2: event.target.value,
                            }))
                          }
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <Label className="mb-1.5 block">Superficie total</Label>
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
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Ubicación / disposición
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 block">Disposición</Label>
                        <select
                          value={form.disposition}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              disposition: event.target.value as PropertyDisposition | "",
                            }))
                          }
                          className="h-10 w-full rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
                        >
                          <option value="">Sin especificar</option>
                          {propertyDispositionOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="mb-1.5 block">Orientación</Label>
                        <select
                          value={form.orientation}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              orientation: event.target.value as PropertyOrientation | "",
                            }))
                          }
                          className="h-10 w-full rounded-md border border-[#ded8cc] bg-white px-3 text-sm"
                        >
                          <option value="">Sin especificar</option>
                          {propertyOrientationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5">
                    {detailedPropertyFeatureGroups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                          {group.title}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {group.options.map((feature) => (
                            <label
                              key={feature}
                              className="flex min-h-10 items-center gap-2 rounded-md border border-[#ded8cc] bg-white px-3 py-2 text-sm font-medium text-[#172124]"
                            >
                              <input
                                type="checkbox"
                                checked={form.detailedFeatures.includes(feature)}
                                onChange={(event) =>
                                  toggleDetailedFeature(feature, event.target.checked)
                                }
                              />
                              {feature}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#172124]">
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
                  <Label className="mb-1.5 block">Descripción</Label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={4}
                    className="w-full resize-none rounded-md border border-[#ded8cc] bg-white px-3 py-2 text-sm"
                    placeholder="Descripción breve de la propiedad"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-1.5 block">Características</Label>
                  <textarea
                    value={form.featuresText}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, featuresText: event.target.value }))
                    }
                    rows={4}
                    className="w-full resize-none rounded-md border border-[#ded8cc] bg-white px-3 py-2 text-sm"
                    placeholder={"Una por línea\nBalcón al frente\nCocina separada"}
                  />
                </div>
              </div>
              </div>

              <DialogFooter className="sticky bottom-0 border-t border-[#ded8cc] bg-white px-6 py-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-[#12383d] text-white hover:bg-[#0f646a]">
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




