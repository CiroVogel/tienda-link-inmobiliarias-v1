import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Trash2,
} from "lucide-react";

type RemovableImageField = "heroImageUrl" | "ownerImageUrl";

const PRIMARY_COLOR_OPTIONS = [
  { label: "Negro", value: "#000000" },
  { label: "Gris grafito", value: "#3A3A3A" },
  { label: "Beige", value: "#D6C2A8" },
  { label: "Verde oliva", value: "#6B705C" },
  { label: "Azul petróleo", value: "#2F5D62" },
  { label: "Bordó", value: "#6E2233" },
  { label: "Terracota", value: "#C06C4E" },
];

function ImageUploader({
  label,
  currentUrl,
  field,
  onUpload,
  onRemove,
  tall = false,
}: {
  label: string;
  currentUrl?: string | null;
  field: RemovableImageField;
  onUpload: (
    field: RemovableImageField,
    base64: string,
    mimeType: string
  ) => Promise<void>;
  onRemove?: (field: RemovableImageField) => Promise<void>;
  tall?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1];
        await onUpload(field, base64, file.type);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast.error("Error al subir la imagen");
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemove) return;

    setRemoving(true);
    try {
      await onRemove(field);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
        {label}
      </Label>

      <div
        className="relative border-2 border-dashed border-black/15 hover:border-black/40 transition-colors cursor-pointer overflow-hidden"
        style={{ height: tall ? "180px" : "120px" }}
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-black/30">
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-xs">Subir imagen</span>
          </div>
        )}

        {(uploading || removing) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {currentUrl && !uploading && !removing && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              Cambiar imagen
            </span>
          </div>
        )}
      </div>

      {currentUrl && onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="mt-1.5 flex items-center gap-1 text-xs text-black/40 hover:text-red-600 transition-colors disabled:opacity-30"
        >
          <Trash2 className="w-3 h-3" />
          Eliminar imagen
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

export default function AdminProfile() {
  const { data: profile, refetch } = trpc.business.get.useQuery();

  const updateProfile = trpc.business.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado");
      refetch();
    },
    onError: () => toast.error("Error al guardar los cambios"),
  });

  const uploadImage = trpc.business.uploadImage.useMutation({
    onSuccess: () => {
      toast.success("Imagen actualizada");
      refetch();
    },
    onError: () => toast.error("Error al subir la imagen"),
  });

  const removeImage = trpc.business.removeImage.useMutation({
    onSuccess: () => {
      toast.success("Imagen eliminada");
      refetch();
    },
    onError: () => toast.error("Error al eliminar la imagen"),
  });

  const passwordStatus = trpc.auth.passwordStatus.useQuery();

  const setMyPassword = trpc.auth.setMyPassword.useMutation({
    onSuccess: () => {
      toast.success("Contraseña guardada");
      passwordStatus.refetch();
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo guardar la contraseña");
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const getValue = (field: string) =>
    form[field] !== undefined
      ? form[field]
      : (profile as Record<string, unknown>)?.[field] != null
      ? String((profile as Record<string, unknown>)[field])
      : "";

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    const updates: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(form)) {
      if (key === "paymentMpAccessToken") {
        const trimmed = value.trim();
        if (trimmed !== "") updates[key] = trimmed;
        continue;
      }

      if (value !== "") updates[key] = value;
    }

    if (form.depositPercentage !== undefined) {
      updates.depositPercentage = parseFloat(form.depositPercentage) || 30;
    }

    await updateProfile.mutateAsync(
      updates as Parameters<typeof updateProfile.mutateAsync>[0]
    );
    setForm({});
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("La confirmación no coincide");
      return;
    }

    await setMyPassword.mutateAsync({
      currentPassword: passwordStatus.data?.hasCredential
        ? passwordForm.currentPassword
        : undefined,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleImageUpload = async (
    field: RemovableImageField,
    base64: string,
    mimeType: string
  ) => {
    await uploadImage.mutateAsync({ field, base64, mimeType });
  };

  const handleImageRemove = async (field: RemovableImageField) => {
    await removeImage.mutateAsync({ field });
  };

  const hasChanges = Object.keys(form).length > 0;

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              Perfil de la inmobiliaria
            </h1>
            <p className="text-black/40 text-sm mt-0.5">
              Informacion que se muestra en tu web publica
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasChanges || updateProfile.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Imágenes
            </h2>

            <div className="grid gap-5">
              <ImageUploader
                label="Imagen de portada"
                currentUrl={profile?.heroImageUrl}
                field="heroImageUrl"
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                tall
              />

              <div>
                <ImageUploader
                  label="Logo o imagen institucional"
                  currentUrl={profile?.ownerImageUrl}
                  field="ownerImageUrl"
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                />
                <p className="text-xs text-black/40 mt-2 leading-relaxed">
                  Opcional. Usala para reforzar la identidad visual de la
                  inmobiliaria sin cambiar la estructura actual de la pantalla.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Apariencia
            </h2>

            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-3 block">
                Color principal
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRIMARY_COLOR_OPTIONS.map((option) => {
                  const selected =
                    (getValue("primaryColor") || "#000000") === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange("primaryColor", option.value)}
                      className={`flex items-center gap-3 border px-3 py-3 text-left transition-colors ${
                        selected
                          ? "border-black bg-black/5"
                          : "border-black/15 hover:border-black/30"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: option.value }}
                      />
                      <span className="text-xs font-medium text-black">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-black/30 mt-2">
                Se aplica a botones, links y detalles visuales de la web pública.
              </p>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Informacion de la inmobiliaria
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  URL pública (slug) *
                </Label>

                <div className="flex items-center border border-black/20 bg-[#f5f5f5]">
                  <span className="px-3 py-2.5 text-xs text-black/40 border-r border-black/20 whitespace-nowrap">
                    {typeof window !== "undefined" ? window.location.origin : ""}/
                  </span>

                  <Input
                    value={getValue("slug")}
                    onChange={(e) =>
                      handleChange(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                      )
                    }
                    placeholder="mi-negocio"
                    className="border-0 bg-transparent focus-visible:ring-0 rounded-none"
                  />
                </div>

                <p className="text-xs text-black/30 mt-1">
                  Solo letras minusculas, numeros y guiones. Ej: clave-urbana-propiedades
                </p>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Nombre de la inmobiliaria *
                </Label>
                <Input
                  value={getValue("businessName")}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  placeholder="Ej: Clave Urbana Propiedades"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Frase principal (tagline)
                </Label>
                <Input
                  value={getValue("tagline")}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="Ej: Venta y alquiler de propiedades en Rosario"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Descripcion de la inmobiliaria
                </Label>
                <textarea
                  value={getValue("description")}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Presenta en pocas palabras a tu inmobiliaria..."
                  className="w-full border border-black/20 bg-white px-3 py-2.5 text-sm placeholder:text-black/30 focus:outline-none focus:border-black resize-none"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Presentacion institucional
            </h2>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                    Responsable o equipo
                  </Label>
                  <Input
                    value={getValue("ownerName")}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    placeholder="Ej: Equipo comercial"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                    Rol o enfoque
                  </Label>
                  <Input
                    value={getValue("ownerTitle")}
                    onChange={(e) => handleChange("ownerTitle", e.target.value)}
                    placeholder="Ej: Tasaciones, ventas y alquileres"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Presentacion
                </Label>
                <textarea
                  value={getValue("ownerBio")}
                  onChange={(e) => handleChange("ownerBio", e.target.value)}
                  placeholder="Conta brevemente como trabaja tu inmobiliaria y que tipo de propiedades gestiona..."
                  className="w-full border border-black/20 bg-white px-3 py-2.5 text-sm placeholder:text-black/30 focus:outline-none focus:border-black resize-none"
                  rows={4}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Contacto
            </h2>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 flex items-center gap-1.5 block">
                    <Phone className="w-3.5 h-3.5" />
                    Teléfono
                  </Label>
                  <Input
                    value={getValue("phone")}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 flex items-center gap-1.5 block">
                    <Globe className="w-3.5 h-3.5" />
                    WhatsApp
                  </Label>
                  <Input
                    value={getValue("whatsapp")}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 flex items-center gap-1.5 block">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={getValue("email")}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="hola@minegocio.com"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 flex items-center gap-1.5 block">
                  <MapPin className="w-3.5 h-3.5" />
                  Dirección
                </Label>
                <Input
                  value={getValue("address")}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 flex items-center gap-1.5 block">
                    <Instagram className="w-3.5 h-3.5" />
                    Instagram
                  </Label>
                  <Input
                    value={getValue("instagram")}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/tu_negocio"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 flex items-center gap-1.5 block">
                    <Facebook className="w-3.5 h-3.5" />
                    Facebook
                  </Label>
                  <Input
                    value={getValue("facebook")}
                    onChange={(e) => handleChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/tu_negocio"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Seguridad
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Email de acceso
                </Label>
                <Input
                  value={passwordStatus.data?.email ?? ""}
                  disabled
                  className="bg-[#f5f5f5]"
                />
                <p className="text-xs text-black/30 mt-1">
                  Este email es el que se usa para entrar a la administración.
                </p>
              </div>

              {passwordStatus.data?.hasCredential && (
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                    Contraseña actual
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Ingresá tu contraseña actual"
                    autoComplete="current-password"
                  />
                </div>
              )}

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Nueva contraseña
                </Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Confirmar nueva contraseña
                </Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repetí la nueva contraseña"
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePasswordSave}
                  disabled={setMyPassword.isPending || passwordStatus.isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {setMyPassword.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {passwordStatus.data?.hasCredential
                    ? "Cambiar contraseña"
                    : "Crear contraseña"}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-5">
              Configuración de pagos
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Moneda
                </Label>
                <Input
                  value={getValue("currency")}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  placeholder="ARS"
                  maxLength={5}
                />
                <p className="text-xs text-black/30 mt-1">
                  Ej: ARS, USD, CLP, UYU
                </p>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                  Porcentaje de seña (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={getValue("depositPercentage")}
                  onChange={(e) => handleChange("depositPercentage", e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-black/30 mt-1">
                  Porcentaje del total que se cobra como seña
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-black/10">
              <Label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2 block">
                Access Token de Mercado Pago
              </Label>
              <Input
                type="password"
                value={getValue("paymentMpAccessToken")}
                onChange={(e) =>
                  handleChange("paymentMpAccessToken", e.target.value)
                }
                placeholder="APP_USR-..."
                autoComplete="off"
              />
              <p className="text-xs text-black/30 mt-1">
                Se guarda por página y se usa para crear el cobro real de esta web.
              </p>
            </div>
          </section>
        </div>

        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors shadow-xl disabled:opacity-30"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
