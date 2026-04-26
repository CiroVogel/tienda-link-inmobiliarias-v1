export const savedSearchOperationOptions = [
  { value: "buy", label: "Comprar" },
  { value: "rent", label: "Alquilar" },
  { value: "both", label: "Ambas" },
] as const;

export const savedSearchPropertyTypeOptions = [
  "Departamento",
  "Casa",
  "PH",
  "Local comercial",
  "Oficina",
  "Terreno",
  "Otro",
] as const;

export const savedSearchBedroomOptions = [
  { value: "studio", label: "Monoambiente" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4_plus", label: "4+" },
  { value: "any", label: "Indistinto" },
] as const;

export const SAVED_SEARCH_STATUS_OPTIONS = [
  { value: "new", label: "Nuevas" },
  { value: "searching", label: "En b\u00FAsqueda" },
  { value: "matched", label: "Encontradas" },
  { value: "contacted", label: "Contactadas" },
  { value: "closed", label: "Cerradas" },
  { value: "not_interested", label: "No interesadas" },
] as const;

export const SAVED_SEARCH_STATUS_CONFIG = {
  new: {
    label: "Nueva",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  searching: {
    label: "En b\u00FAsqueda",
    color: "border-sky-200 bg-sky-50 text-sky-700",
  },
  matched: {
    label: "Encontrada",
    color: "border-violet-200 bg-violet-50 text-violet-700",
  },
  contacted: {
    label: "Contactada",
    color: "border-amber-200 bg-amber-50 text-amber-700",
  },
  closed: {
    label: "Cerrada",
    color: "border-zinc-200 bg-zinc-100 text-zinc-700",
  },
  not_interested: {
    label: "No interesada",
    color: "border-rose-200 bg-rose-50 text-rose-700",
  },
} as const;

export type SavedSearchStatus = (typeof SAVED_SEARCH_STATUS_OPTIONS)[number]["value"];
export type SavedSearchOperation = (typeof savedSearchOperationOptions)[number]["value"];
export type SavedSearchBedrooms = (typeof savedSearchBedroomOptions)[number]["value"];

export type SavedSearchNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type SavedSearchItem = {
  id: string;
  slug: string;
  name: string;
  whatsapp: string;
  operationType: SavedSearchOperation;
  propertyType: string;
  zone: string;
  budget: string;
  bedrooms: SavedSearchBedrooms;
  comments: string | null;
  status: SavedSearchStatus;
  notes: SavedSearchNote[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getSavedSearchOperationLabel(value: SavedSearchOperation) {
  return (
    savedSearchOperationOptions.find((option) => option.value === value)?.label ??
    value
  );
}

export function getSavedSearchBedroomLabel(value: SavedSearchBedrooms) {
  return (
    savedSearchBedroomOptions.find((option) => option.value === value)?.label ??
    value
  );
}

export function getSavedSearchWhatsAppHref(whatsapp: string, message: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
