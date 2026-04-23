import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Images } from "lucide-react";

export default function AdminGallery() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const { data: images = [], refetch } = trpc.gallery.list.useQuery();

  const uploadImage = trpc.gallery.upload.useMutation({
    onSuccess: () => {
      toast.success("Imagen subida");
      refetch();
      setCaption("");
    },
    onError: () => toast.error("Error al subir la imagen"),
  });

  const deleteImage = trpc.gallery.delete.useMutation({
    onSuccess: () => { toast.success("Imagen eliminada"); refetch(); },
    onError: () => toast.error("Error al eliminar la imagen"),
  });

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
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
        await uploadImage.mutateAsync({
          base64,
          mimeType: file.type,
          caption: caption || undefined,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast.error("Error al procesar la imagen");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-black text-black tracking-tight"
            >
              Galería
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {images.length} imagen{images.length !== 1 ? "es" : ""} en la galería
            </p>
          </div>
        </div>

        {/* Upload area */}
        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Subir nueva imagen
          </h2>
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Descripción de la imagen (opcional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1"
            />
          </div>
          <div
            className="border-2 border-dashed border-black/15 hover:border-black/40 p-10 text-center cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length) handleFiles(files);
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin"  />
                <span className="text-sm">Subiendo imagen...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="w-8 h-8" />
                <p className="text-sm font-medium">Hacé clic o arrastrá una imagen aquí</p>
                <p className="text-xs">PNG, JPG, WEBP · Máximo 5MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />
        </div>

        {/* Gallery grid */}
        {images.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <Images className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground">La galería está vacía</p>
            <p className="text-sm text-muted-foreground mt-1">
              Subí fotos de tu trabajo para mostrarlas en tu web.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-xl overflow-hidden bg-muted border border-border"
                style={{ aspectRatio: "1" }}
              >
                <img
                  src={image.url}
                  alt={image.caption ?? "Imagen de galería"}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
                  {image.caption && (
                    <p className="text-white text-xs text-center font-medium line-clamp-2">
                      {image.caption}
                    </p>
                  )}
                  <button
                    onClick={() => deleteImage.mutate({ id: image.id })}
                    disabled={deleteImage.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                  >
                    {deleteImage.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
