export type InterestedStatus =
  | "new"
  | "contacted"
  | "visited"
  | "negotiating"
  | "closed"
  | "not_interested";

export type InterestedNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type InterestedTimelineEntry = {
  id: string;
  type: "created" | "status_changed" | "note_added";
  title: string;
  description?: string;
  status?: InterestedStatus;
  noteId?: string;
  createdAt: string;
};

export type InterestedItem = {
  id: string;
  reference: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  whatsapp: string;
  email: string | null;
  message: string;
  status: InterestedStatus;
  notes: InterestedNote[];
  timeline: InterestedTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export const INTERESTED_STATUS_CONFIG: Record<
  InterestedStatus,
  { label: string; color: string }
> = {
  new: {
    label: "Nuevo",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  contacted: {
    label: "Contactado",
    color: "bg-sky-100 text-sky-800 border-sky-200",
  },
  visited: {
    label: "Visitó",
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
  negotiating: {
    label: "En negociación",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  closed: {
    label: "Cerrado",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  not_interested: {
    label: "No interesado",
    color: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
};

export const INTERESTED_STATUS_OPTIONS: Array<{
  value: InterestedStatus;
  label: string;
}> = Object.entries(INTERESTED_STATUS_CONFIG).map(([value, config]) => ({
  value: value as InterestedStatus,
  label: config.label,
}));

export function getInterestedWhatsAppHref(whatsapp: string, message: string) {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function isInterestedResolved(status: InterestedStatus) {
  return status === "closed" || status === "not_interested";
}
