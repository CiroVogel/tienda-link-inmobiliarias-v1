import { useMemo, useState } from "react";
import { trpc } from "../../lib/trpc";

type FormState = {
  businessName: string;
  slug: string;
  whatsapp: string;
  tagline: string;
  adminEmail: string;
  adminPassword: string;
};

const initialForm: FormState = {
  businessName: "",
  slug: "",
  whatsapp: "",
  tagline: "",
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
    },
  });

  const publicUrl = useMemo(() => {
    if (!created) return "";
    return `${window.location.origin}${created.publicPath}`;
  }, [created]);

  const adminUrl = useMemo(() => {
    if (!created) return "";
    return `${window.location.origin}${created.adminLoginPath}`;
  }, [created]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBusinessNameChange(value: string) {
    setForm((prev) => {
      const nextSlug = prev.slug.trim() ? prev.slug : slugify(value);
      return {
        ...prev,
        businessName: value,
        slug: nextSlug,
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreated(null);

    await createPageMutation.mutateAsync({
      businessName: form.businessName.trim(),
      slug: slugify(form.slug),
      whatsapp: form.whatsapp.trim() || undefined,
      tagline: form.tagline.trim() || undefined,
      adminEmail: form.adminEmail.trim(),
      adminPassword: form.adminPassword,
    });
  }

  const loading = createPageMutation.isPending;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alta mínima de nueva página</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea una nueva página de servicios con su propio admin.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del negocio</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={form.businessName}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                placeholder="Ej: Luna Masajes"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={form.slug}
                onChange={(e) => updateField("slug", slugify(e.target.value))}
                placeholder="Ej: luna-masajes"
              />
              <p className="text-xs text-muted-foreground">
                Solo minúsculas, números y guiones.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                placeholder="Ej: 3415551234"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frase corta</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={form.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="Ej: Turnos simples y rápidos"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email admin</label>
              <input
                type="email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={form.adminEmail}
                onChange={(e) => updateField("adminEmail", e.target.value)}
                placeholder="admin@negocio.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña admin</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                value={form.adminPassword}
                onChange={(e) => updateField("adminPassword", e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          {createPageMutation.error ? (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createPageMutation.error.message}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear nueva página"}
            </button>
          </div>
        </form>
      </div>

      {created ? (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Página creada</h2>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Negocio:</strong> {created.businessName}
            </p>
            <p>
              <strong>Slug:</strong> {created.slug}
            </p>
            <p>
              <strong>Email admin:</strong> {created.adminEmail}
            </p>
            <p>
              <strong>Link público:</strong>{" "}
              <a className="underline" href={publicUrl} target="_blank" rel="noreferrer">
                {publicUrl}
              </a>
            </p>
            <p>
              <strong>Link admin:</strong>{" "}
              <a className="underline" href={adminUrl} target="_blank" rel="noreferrer">
                {adminUrl}
              </a>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}