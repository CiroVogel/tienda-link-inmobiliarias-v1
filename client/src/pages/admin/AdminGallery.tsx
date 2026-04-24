import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Images,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { propertyImageFallback } from "@/lib/realEstateDemo";
import { trpc } from "@/lib/trpc";

type AdminPropertyImage = {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
};

type AdminProperty = {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  price: string;
  images: AdminPropertyImage[];
};

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        reject(new Error("Invalid file result"));
        return;
      }

      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

export default function AdminGallery() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [uploading, setUploading] = useState(false);
  const { data: properties = [] } = trpc.properties.list.useQuery();

  useEffect(() => {
    if (!properties.length) {
      setSelectedPropertyId("");
      return;
    }

    if (!selectedPropertyId || !properties.some((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(properties[0]!.id);
    }
  }, [properties, selectedPropertyId]);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) as AdminProperty | undefined,
    [properties, selectedPropertyId],
  );

  const uploadImage = trpc.properties.uploadImage.useMutation({
    onSuccess: async () => {
      await utils.properties.list.invalidate();
    },
    onError: () => toast.error("No pudimos subir la imagen."),
  });

  const reorderImages = trpc.properties.reorderImages.useMutation({
    onSuccess: async () => {
      await utils.properties.list.invalidate();
    },
    onError: () => toast.error("No pudimos reordenar las fotos."),
  });

  const setPrimaryImage = trpc.properties.setPrimaryImage.useMutation({
    onSuccess: async () => {
      toast.success("Imagen principal actualizada.");
      await utils.properties.list.invalidate();
    },
    onError: () => toast.error("No pudimos marcar la imagen principal."),
  });

  const deleteImage = trpc.properties.deleteImage.useMutation({
    onSuccess: async () => {
      toast.success("Imagen eliminada.");
      await utils.properties.list.invalidate();
    },
    onError: () => toast.error("No pudimos eliminar la imagen."),
  });

  async function handleFiles(fileList: FileList | File[]) {
    if (!selectedProperty) {
      toast.error("Primero elegi una propiedad.");
      return;
    }

    const files = Array.from(fileList);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" supera el maximo de 5MB.`);
        return;
      }
    }

    setUploading(true);

    try {
      for (const file of files) {
        const base64 = await readFileAsBase64(file);
        await uploadImage.mutateAsync({
          propertyId: selectedProperty.id,
          base64,
          mimeType: file.type,
        });
      }

      toast.success(
        `${files.length} foto${files.length !== 1 ? "s" : ""} subida${files.length !== 1 ? "s" : ""}.`,
      );
    } catch {
      toast.error("No pudimos procesar las fotos.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function moveImage(imageId: string, direction: -1 | 1) {
    if (!selectedProperty) return;

    const images = [...selectedProperty.images];
    const index = images.findIndex((image) => image.id === imageId);
    const nextIndex = index + direction;

    if (index === -1 || nextIndex < 0 || nextIndex >= images.length) return;
    if (images[index]?.isPrimary || images[nextIndex]?.isPrimary) return;

    const reorderedImages = [...images];
    [reorderedImages[index], reorderedImages[nextIndex]] = [
      reorderedImages[nextIndex]!,
      reorderedImages[index]!,
    ];

    await reorderImages.mutateAsync({
      propertyId: selectedProperty.id,
      imageIds: reorderedImages.map((image) => image.id),
    });
  }

  async function handleDeleteImage(imageId: string) {
    if (!selectedProperty) return;

    await deleteImage.mutateAsync({
      propertyId: selectedProperty.id,
      imageId,
    });
  }

  async function handleSetPrimary(imageId: string) {
    if (!selectedProperty) return;

    await setPrimaryImage.mutateAsync({
      propertyId: selectedProperty.id,
      imageId,
    });
  }

  if (!properties.length) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-4xl p-6">
          <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
            <Images className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <h1 className="text-2xl font-black tracking-tight text-zinc-950">
              Fotos de propiedades
            </h1>
            <p className="mt-3 text-sm text-zinc-500">
              Crea una propiedad primero y despues carga sus imagenes desde este panel.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const currentImages = selectedProperty?.images ?? [];
  const isBusy =
    uploading ||
    uploadImage.isPending ||
    reorderImages.isPending ||
    setPrimaryImage.isPending ||
    deleteImage.isPending;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Fotos de propiedades</h1>
            <p className="mt-1 text-sm text-black/50">
              Elegi una propiedad, subi sus imagenes y defini la principal.
            </p>
          </div>

          <div className="w-full md:max-w-sm">
            <select
              value={selectedPropertyId}
              onChange={(event) => setSelectedPropertyId(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedProperty ? (
          <>
            <div className="mb-8 grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <img
                  src={selectedProperty.images[0]?.url ?? propertyImageFallback}
                  alt={selectedProperty.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="space-y-2 p-5">
                  <h2 className="text-lg font-black text-zinc-950">{selectedProperty.title}</h2>
                  <p className="text-sm text-zinc-500">
                    {selectedProperty.location} | {selectedProperty.propertyType}
                  </p>
                  <p className="text-sm font-semibold text-zinc-950">{selectedProperty.price}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                    {currentImages.length} foto{currentImages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                  Subir imagenes
                </p>
                <div
                  className="cursor-pointer border-2 border-dashed border-black/15 p-10 text-center transition-colors hover:border-black/40"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (event.dataTransfer.files.length) {
                      void handleFiles(event.dataTransfer.files);
                    }
                  }}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">Subiendo fotos...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Upload className="h-8 w-8" />
                      <p className="text-sm font-medium">
                        Hace clic o arrastra imagenes para esta propiedad
                      </p>
                      <p className="text-xs">PNG, JPG, WEBP · Maximo 5MB por archivo</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      void handleFiles(event.target.files);
                    }
                  }}
                />
              </div>
            </div>

            {currentImages.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
                <ImagePlus className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
                <p className="font-semibold text-zinc-700">Todavia no hay fotos cargadas.</p>
                <p className="mt-1 text-sm text-zinc-500">
                  La web usara un fallback visual hasta que subas imagenes reales.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {currentImages.map((image, index) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
                  >
                    <div className="relative bg-zinc-100">
                      <img
                        src={image.url}
                        alt={image.caption ?? `${selectedProperty.title} foto ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 flex gap-2">
                        {image.isPrimary ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                            <Star className="h-3 w-3 fill-current" />
                            Principal
                          </span>
                        ) : null}
                        <span className="bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-700">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void moveImage(image.id, -1)}
                          disabled={isBusy || index === 0 || image.isPrimary || currentImages[index - 1]?.isPrimary}
                          className="justify-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Subir
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void moveImage(image.id, 1)}
                          disabled={
                            isBusy ||
                            index === currentImages.length - 1 ||
                            image.isPrimary ||
                            currentImages[index + 1]?.isPrimary
                          }
                          className="justify-center gap-2"
                        >
                          Bajar
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={image.isPrimary ? "secondary" : "outline"}
                          onClick={() => void handleSetPrimary(image.id)}
                          disabled={isBusy || image.isPrimary}
                          className="justify-center gap-2"
                        >
                          <Star className={`h-4 w-4 ${image.isPrimary ? "fill-current" : ""}`} />
                          {image.isPrimary ? "Principal" : "Hacer principal"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleDeleteImage(image.id)}
                          disabled={isBusy}
                          className="justify-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Borrar
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
