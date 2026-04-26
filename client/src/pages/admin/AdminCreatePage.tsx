import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Archive,
  Building2,
  ExternalLink,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  PlusSquare,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { realEstateProfile } from "@/lib/realEstateDemo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

type FormState = {
  businessName: string;
  slug: string;
  city: string;
  whatsapp: string;
  email: string;
  address: string;
  description: string;
  adminEmail: string;
  adminPassword: string;
};

const initialForm: FormState = {
  businessName: "",
  slug: "",
  city: "",
  whatsapp: "",
  email: "",
  address: "",
  description: "",
  adminEmail: "",
  adminPassword: "",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCreatePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [created, setCreated] = useState<null | {
    slug: string;
    businessName: string;
    adminEmail: string;
    publicPath: string;
    adminLoginPath: string;
  }>(null);
  const { data: businesses, refetch: refetchBusinesses } = trpc.business.listAll.useQuery();

  const createPageMutation = trpc.business.createPage.useMutation({
    onSuccess: (data) => {
      setCreated({
        slug: data.slug,
        businessName: data.businessName,
        adminEmail: data.adminEmail,
        publicPath: data.publicPath,
        adminLoginPath: data.adminLoginPath,
      });
      setForm(initialForm);
      refetchBusinesses();
      toast.success("Inmobiliaria creada");
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo crear la inmobiliaria");
    },
  });

  const setPageArchivedMutation = trpc.business.setPageArchived.useMutation({
    onSuccess: (data) => {
      refetchBusinesses();
      if (created?.slug === data.slug && data.isArchived) {
        setCreated(null);
      }
      toast.success(data.isArchived ? "Inmobiliaria archivada" : "Inmobiliaria reactivada");
    },
    onError: (error) => {
      toast.error(error.message || "No pudimos actualizar esta inmobiliaria");
    },
  });

  const publicUrl = useMemo(() => {
    if (!created || typeof window === "undefined") return "";
    return `${window.location.origin}${created.publicPath}`;
  }, [created]);

  const adminUrl = useMemo(() => {
    if (!created || typeof window === "undefined") return "";
    return `${window.location.origin}${created.adminLoginPath}`;
  }, [created]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBusinessNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      businessName: value,
      slug: prev.slug.trim() ? prev.slug : slugify(value),
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setCreated(null);

    await createPageMutation.mutateAsync({
      businessName: form.businessName.trim(),
      slug: slugify(form.slug),
      city: form.city.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      description: form.description.trim() || undefined,
      adminEmail: form.adminEmail.trim(),
      adminPassword: form.adminPassword,
    });
  }

  async function handleArchiveToggle(business: {
    slug: string;
    businessName: string;
    isArchived?: boolean;
  }) {
    const nextArchived = !business.isArchived;
    const confirmed = window.confirm(
      nextArchived
        ? `Vas a archivar "${business.businessName}". La página dejará de verse públicamente, pero sus datos quedarán guardados.`
        : `Vas a reactivar "${business.businessName}". La página volverá a verse públicamente.`,
    );

    if (!confirmed) return;

    await setPageArchivedMutation.mutateAsync({
      slug: business.slug,
      archived: nextArchived,
    });
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-white">
            <PlusSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Crear inmobiliaria
            </h1>
            <p className="mt-1 text-sm text-black/45">
              Da de alta una nueva página con el perfil mínimo necesario para que exista
              públicamente y después puedas completarla desde administración.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white p-6">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-black/40">
              Datos iniciales
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/50">
                  Nombre de la inmobiliaria *
                </Label>
                <Input
                  value={form.businessName}
                  onChange={(event) => handleBusinessNameChange(event.target.value)}
                  placeholder="Ej: Clave Urbana Propiedades"
                />
              </div>

              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/50">
                  Slug *
                </Label>
                <Input
                  value={form.slug}
                  onChange={(event) => updateField("slug", slugify(event.target.value))}
                  placeholder="clave-urbana-propiedades"
                />
                <p className="mt-1 text-xs text-black/30">
                  Solo minúsculas, números y guiones.
                </p>
              </div>

              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/50">
                  Ciudad o zona principal *
                </Label>
                <Input
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Rosario, Santa Fe"
                />
              </div>

              <div>
                <Label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black/50">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </Label>
                <Input
                  value={form.whatsapp}
                  onChange={(event) => updateField("whatsapp", event.target.value)}
                  placeholder="+54 341 000 0000"
                />
              </div>

              <div>
                <Label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black/50">
                  <Mail className="h-3.5 w-3.5" />
                  Email público
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="contacto@claveurbana.com"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black/50">
                  <MapPin className="h-3.5 w-3.5" />
                  Dirección comercial u oficina
                </Label>
                <Input
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="Corrientes 842, Rosario"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/50">
                  Descripción breve
                </Label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Presentación corta de la inmobiliaria..."
                  rows={4}
                  className="w-full resize-none border border-black/20 bg-white px-3 py-2.5 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-black/40">
              Acceso admin inicial
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black/50">
                  <Mail className="h-3.5 w-3.5" />
                  Email admin *
                </Label>
                <Input
                  type="email"
                  value={form.adminEmail}
                  onChange={(event) => updateField("adminEmail", event.target.value)}
                  placeholder="admin@claveurbana.com"
                />
              </div>

              <div>
                <Label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black/50">
                  <KeyRound className="h-3.5 w-3.5" />
                  Contraseña inicial *
                </Label>
                <Input
                  type="text"
                  value={form.adminPassword}
                  onChange={(event) => updateField("adminPassword", event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
          </section>

          {createPageMutation.error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createPageMutation.error.message}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={createPageMutation.isPending}
              className="inline-flex items-center gap-2 bg-black px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createPageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Crear inmobiliaria
            </button>

            <Link href="/admin/profile">
              <span className="inline-flex cursor-pointer items-center gap-2 border border-black/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-black/60 transition-colors hover:border-black/40 hover:text-black">
                Volver al perfil
              </span>
            </Link>
          </div>
        </form>

        {created ? (
          <section className="mt-6 bg-white p-6">
            <h2 className="mb-4 text-lg font-black tracking-tight text-black">
              Inmobiliaria creada
            </h2>

            <div className="grid gap-3 text-sm text-black/65">
              <p>
                <strong className="text-black">Nombre:</strong> {created.businessName}
              </p>
              <p>
                <strong className="text-black">Slug:</strong> {created.slug}
              </p>
              <p>
                <strong className="text-black">Email admin:</strong> {created.adminEmail}
              </p>
              <p>
                <strong className="text-black">URL pública:</strong> {publicUrl}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-black px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/80"
              >
                <ExternalLink className="h-4 w-4" />
                Ver página pública
              </a>

              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-black/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-black/70 transition-colors hover:border-black/40 hover:text-black"
              >
                <Building2 className="h-4 w-4" />
                Ir a administración
              </a>
            </div>
          </section>
        ) : null}

        <section className="mt-6 bg-white p-6">
          <h2 className="mb-4 text-lg font-black tracking-tight text-black">
            Inmobiliarias creadas
          </h2>
          <p className="mb-5 text-sm leading-7 text-black/45">
            Archivar baja la página pública sin borrar datos. Después puedes reactivarla desde
            esta misma lista.
          </p>

          {businesses && businesses.length > 0 ? (
            <div className="space-y-3">
              {businesses.map((business) => {
                const publicHref =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/${business.slug}`
                    : `/${business.slug}`;

                return (
                  <div
                    key={business.slug}
                    className="flex flex-col gap-3 border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-black">{business.businessName}</p>
                        {business.isArchived ? (
                          <span className="border border-black/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black/55">
                            Archivada
                          </span>
                        ) : null}
                        {business.slug === realEstateProfile.slug ? (
                          <span className="border border-black/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black/55">
                            Demo principal
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-black/45">{business.slug}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={publicHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-black/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/70 transition-colors hover:border-black/35 hover:text-black"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver página pública
                      </a>

                      <a
                        href="/admin-login"
                        className="inline-flex items-center gap-2 bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/80"
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        Ir al login admin
                      </a>

                      {business.slug !== realEstateProfile.slug ? (
                        <button
                          type="button"
                          onClick={() => void handleArchiveToggle(business)}
                          disabled={
                            setPageArchivedMutation.isPending &&
                            setPageArchivedMutation.variables?.slug === business.slug
                          }
                          className="inline-flex items-center gap-2 border border-black/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/70 transition-colors hover:border-black/35 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {setPageArchivedMutation.isPending &&
                          setPageArchivedMutation.variables?.slug === business.slug ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : business.isArchived ? (
                            <RotateCcw className="h-3.5 w-3.5" />
                          ) : (
                            <Archive className="h-3.5 w-3.5" />
                          )}
                          {business.isArchived ? "Reactivar" : "Archivar"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm leading-7 text-black/45">
              Todavía no hay inmobiliarias creadas fuera de la demo inicial.
            </p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
