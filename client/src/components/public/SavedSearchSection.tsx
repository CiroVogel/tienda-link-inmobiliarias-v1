import { useEffect, useRef, useState } from "react";
import { ArrowRight, BellRing, X } from "lucide-react";
import { toast } from "sonner";
import {
  savedSearchBedroomOptions,
  savedSearchOperationOptions,
  savedSearchPropertyTypeOptions,
} from "@/lib/savedSearches";
import { trpc } from "@/lib/trpc";

export default function SavedSearchSection({
  slug,
  eyebrow = "Tu búsqueda",
  className = "bg-[#f7f5ef] py-14 md:py-18",
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

  const panelRef = useRef<HTMLDivElement>(null);

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
        "Búsqueda guardada. La inmobiliaria podrá contactarte cuando tenga una propiedad que coincida con lo que necesitás.",
      );
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos guardar la búsqueda");
    },
  });

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const top = panelRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.zone.trim() || !form.budget.trim() || !form.name.trim() || !form.whatsapp.trim()) {
      toast.error("Completá zona, presupuesto, nombre y WhatsApp.");
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

  const inputClass =
    "h-11 rounded-lg border border-[#ded8cc] bg-white px-3 text-sm text-[#3a3a3a] outline-none placeholder:text-[#6a716f] focus:border-[#0f646a]";
  const selectClass =
    "h-11 rounded-lg border border-[#ded8cc] bg-white px-3 text-sm font-medium text-[#3a3a3a] outline-none focus:border-[#0f646a]";
  const labelClass = "grid gap-1.5 text-sm font-semibold text-[#6a716f]";

  return (
    <section className={className}>
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        {!isOpen ? (
          /* Estado cerrado */
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-[#ded8cc] bg-white p-8 shadow-[0_10px_30px_rgba(23,23,23,0.04)]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4f2]">
                <BellRing className="h-5 w-5 text-[#0f646a]" />
              </div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
                {eyebrow}
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#182125] md:text-4xl">
                {"¿No encontraste lo que buscás?"}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#6a716f]">
                {"Dejanos tu búsqueda y te avisamos cuando tengamos una propiedad que se ajuste a lo que necesitás."}
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12383d] px-8 text-sm font-semibold text-white transition hover:bg-[#0f646a]"
              >
                {"Dejar mi búsqueda"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Estado abierto — panel único */
          <div
            ref={panelRef}
            className="rounded-2xl border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(23,23,23,0.04)]"
          >
            {/* Barra superior: eyebrow + botón Cerrar */}
            <div className="flex items-center justify-between border-b border-[#ece6dd] px-6 py-4 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a716f]">
                {eyebrow}
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 rounded-full border border-[#ded8cc] px-3 py-1.5 text-xs font-semibold text-[#6a716f] transition hover:border-[#0f646a] hover:text-[#12383d]"
              >
                <X className="h-3.5 w-3.5" />
                Cerrar
              </button>
            </div>

            {/* Cuerpo: grid intro + contenido */}
            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.7fr] md:gap-10">
              {/* Columna izquierda: intro */}
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#182125] md:text-3xl">
                  {"¿No encontraste lo que buscás?"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#6a716f]">
                  {"Dejanos tu búsqueda y te avisamos cuando tengamos una propiedad que se ajuste a lo que necesitás."}
                </p>
              </div>

              {/* Columna derecha: formulario o confirmación */}
              <div>
                {isSubmitted ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6a716f]">
                      {"Búsqueda guardada"}
                    </p>
                    <p className="text-sm leading-7 text-[#3a3a3a]">
                      {"La inmobiliaria podrá contactarte cuando tenga una propiedad que coincida con lo que necesitás."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="inline-flex items-center rounded-lg border border-[#ded8cc] px-4 py-2.5 text-sm font-semibold text-[#12383d] transition hover:border-[#0f646a]"
                      >
                        {"Cargar otra búsqueda"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-1.5 rounded-full border border-[#ded8cc] px-3 py-1.5 text-xs font-semibold text-[#6a716f] transition hover:border-[#0f646a] hover:text-[#12383d]"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>
                      {"Operación"}
                      <select
                        value={form.operationType}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            operationType: event.target.value as "buy" | "rent" | "both",
                          }))
                        }
                        className={selectClass}
                      >
                        {savedSearchOperationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Tipo de propiedad
                      <select
                        value={form.propertyType}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            propertyType: event.target.value,
                          }))
                        }
                        className={selectClass}
                      >
                        {savedSearchPropertyTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Zona
                      <input
                        value={form.zone}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, zone: event.target.value }))
                        }
                        placeholder="Ej: Centro, Fisherton, Abasto..."
                        className={inputClass}
                      />
                    </label>

                    <label className={labelClass}>
                      Presupuesto
                      <input
                        value={form.budget}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, budget: event.target.value }))
                        }
                        placeholder="Ej: Hasta USD 100.000 / $500.000 mensual"
                        className={inputClass}
                      />
                    </label>

                    <label className={labelClass}>
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
                        className={selectClass}
                      >
                        {savedSearchBedroomOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Nombre
                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, name: event.target.value }))
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className={labelClass}>
                      WhatsApp
                      <input
                        value={form.whatsapp}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, whatsapp: event.target.value }))
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Comentarios
                      <textarea
                        value={form.comments}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, comments: event.target.value }))
                        }
                        rows={4}
                        className="resize-none rounded-lg border border-[#ded8cc] bg-white px-3 py-3 text-sm text-[#3a3a3a] outline-none focus:border-[#0f646a]"
                      />
                    </label>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={createSavedSearch.isPending}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#12383d] px-8 text-sm font-semibold text-white transition hover:bg-[#0f646a] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {"Enviar búsqueda"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
