import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  savedSearchBedroomOptions,
  savedSearchOperationOptions,
  savedSearchPropertyTypeOptions,
} from "@/lib/savedSearches";
import { trpc } from "@/lib/trpc";

export default function SavedSearchSection({
  slug,
  eyebrow = "Tu b\u00FAsqueda",
  className = "bg-zinc-50 py-14 md:py-18",
}: {
  slug: string;
  eyebrow?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<{
    operationType: "buy" | "rent" | "both";
    propertyType: string;
    zone: string;
    budget: string;
    bedrooms: "studio" | "1" | "2" | "3" | "4_plus" | "any";
    name: string;
    whatsapp: string;
    comments: string;
  }>({
    operationType: "buy",
    propertyType: savedSearchPropertyTypeOptions[0],
    zone: "",
    budget: "",
    bedrooms: "any",
    name: "",
    whatsapp: "",
    comments: "",
  });

  const createSavedSearch = trpc.savedSearches.create.useMutation({
    onSuccess: () => {
      setForm({
        operationType: "buy",
        propertyType: savedSearchPropertyTypeOptions[0],
        zone: "",
        budget: "",
        bedrooms: "any",
        name: "",
        whatsapp: "",
        comments: "",
      });
      setIsSubmitted(true);
      toast.success(
        "B\u00FAsqueda guardada. La inmobiliaria podr\u00E1 contactarte cuando tenga una propiedad que coincida con lo que necesit\u00E1s.",
      );
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos guardar la b\u00FAsqueda");
    },
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.zone.trim() || !form.budget.trim() || !form.name.trim() || !form.whatsapp.trim()) {
      toast.error("Complet\u00E1 zona, presupuesto, nombre y WhatsApp.");
      return;
    }

    await createSavedSearch.mutateAsync({
      slug,
      operationType: form.operationType,
      propertyType: form.propertyType,
      zone: form.zone.trim(),
      budget: form.budget.trim(),
      bedrooms: form.bedrooms,
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      comments: form.comments.trim() || undefined,
    });
  }

  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              {eyebrow}
            </p>
            <h2 className="text-4xl font-black tracking-tight text-zinc-950">
              {"\u00BFNo encontraste lo que busc\u00E1s?"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              {"Dejanos tu búsqueda y te avisamos cuando tengamos una propiedad que se ajuste a lo que necesitás."}
            </p>

            {!isOpen ? (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-6 inline-flex items-center gap-2 bg-zinc-950 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                {"Dejar mi búsqueda"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {isOpen ? (
            <div className="border border-zinc-200 bg-white p-6">
              {isSubmitted ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    {"Búsqueda guardada"}
                  </p>
                  <p className="text-sm leading-7 text-zinc-600">
                    {"La inmobiliaria podrá contactarte cuando tenga una propiedad que coincida con lo que necesitás."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex border border-zinc-200 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-700"
                  >
                    {"Cargar otra búsqueda"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    {"Operación"}
                    <select
                      value={form.operationType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          operationType: event.target.value as "buy" | "rent" | "both",
                        }))
                      }
                      className="h-12 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950"
                    >
                      {savedSearchOperationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Tipo de propiedad
                    <select
                      value={form.propertyType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          propertyType: event.target.value,
                        }))
                      }
                      className="h-12 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950"
                    >
                      {savedSearchPropertyTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Zona
                    <input
                      value={form.zone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, zone: event.target.value }))
                      }
                      placeholder="Ej: Centro, Fisherton, Abasto..."
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Presupuesto
                    <input
                      value={form.budget}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, budget: event.target.value }))
                      }
                      placeholder="Ej: Hasta USD 100.000 / $500.000 mensual"
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Dormitorios
                    <select
                      value={form.bedrooms}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bedrooms: event.target.value as
                            | "studio"
                            | "1"
                            | "2"
                            | "3"
                            | "4_plus"
                            | "any",
                        }))
                      }
                      className="h-12 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950"
                    >
                      {savedSearchBedroomOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Nombre
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    WhatsApp
                    <input
                      value={form.whatsapp}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, whatsapp: event.target.value }))
                      }
                      className="h-12 border border-zinc-200 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950"
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 md:col-span-2">
                    Comentarios
                    <textarea
                      value={form.comments}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, comments: event.target.value }))
                      }
                      rows={4}
                      className="resize-none border border-zinc-200 px-3 py-3 text-sm text-zinc-950 outline-none focus:border-zinc-950"
                    />
                  </label>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={createSavedSearch.isPending}
                      className="inline-flex items-center gap-2 bg-zinc-950 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {"Enviar búsqueda"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
