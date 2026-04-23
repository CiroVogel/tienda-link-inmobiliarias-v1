import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Clock } from "lucide-react";

const DAYS = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
];

interface DayConfig {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

const DEFAULT_DAY: Omit<DayConfig, "dayOfWeek"> = {
  startTime: "09:00",
  endTime: "18:00",
  slotDuration: 60,
  isActive: false,
};

export default function AdminAvailability() {
  const { data: availability = [], refetch } = trpc.availability.get.useQuery();
  const [saving, setSaving] = useState<number | null>(null);
  const [localConfig, setLocalConfig] = useState<Record<number, DayConfig>>({});

  const upsertAvailability = trpc.availability.upsert.useMutation({
    onSuccess: () => { toast.success("Disponibilidad actualizada"); refetch(); },
    onError: () => toast.error("Error al guardar la disponibilidad"),
  });

  const getConfig = (dayId: number): DayConfig => {
    if (localConfig[dayId]) return localConfig[dayId];
    const existing = availability.find((a) => a.dayOfWeek === dayId);
    if (existing) {
      return {
        dayOfWeek: dayId,
        startTime: existing.startTime,
        endTime: existing.endTime,
        slotDuration: existing.slotDuration,
        isActive: existing.isActive,
      };
    }
    return { dayOfWeek: dayId, ...DEFAULT_DAY };
  };

  const updateConfig = (dayId: number, updates: Partial<DayConfig>) => {
    setLocalConfig((prev) => ({
      ...prev,
      [dayId]: { ...getConfig(dayId), ...updates },
    }));
  };

  const saveDay = async (dayId: number) => {
    const config = getConfig(dayId);
    setSaving(dayId);
    try {
      await upsertAvailability.mutateAsync({
        dayOfWeek: config.dayOfWeek,
        startTime: config.startTime,
        endTime: config.endTime,
        slotDuration: config.slotDuration,
        isActive: config.isActive,
      });
      // Clear local override after save
      setLocalConfig((prev) => {
        const next = { ...prev };
        delete next[dayId];
        return next;
      });
    } finally {
      setSaving(null);
    }
  };

  const hasChanges = (dayId: number) => !!localConfig[dayId];

  // Calculate slot count preview
  const getSlotCount = (config: DayConfig) => {
    if (!config.isActive) return 0;
    const [sh, sm] = config.startTime.split(":").map(Number);
    const [eh, em] = config.endTime.split(":").map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, Math.floor(totalMinutes / config.slotDuration));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-black text-black tracking-tight"
          >
            Disponibilidad
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Configurá los días y horarios en que aceptás reservas
          </p>
        </div>

        {/* Days */}
        <div className="space-y-3">
          {DAYS.map((day) => {
            const config = getConfig(day.id);
            const slotCount = getSlotCount(config);
            const changed = hasChanges(day.id);

            return (
              <div
                key={day.id}
                className={`bg-white rounded-xl border p-5 transition-all duration-150 ${
                  config.isActive ? "border-border shadow-sm" : "border-border opacity-70"
                }`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={(checked) => updateConfig(day.id, { isActive: checked })}
                    />
                    <div>
                      <p className="font-semibold text-sm">{day.label}</p>
                      {config.isActive && slotCount > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {slotCount} turno{slotCount !== 1 ? "s" : ""} disponible{slotCount !== 1 ? "s" : ""}
                        </p>
                      )}
                      {!config.isActive && (
                        <p className="text-xs text-muted-foreground mt-0.5">No disponible</p>
                      )}
                    </div>
                  </div>

                  {changed && (
                    <Button
                      size="sm"
                      onClick={() => saveDay(day.id)}
                      disabled={saving === day.id}
                      className="gap-1.5 text-xs h-8"
                      style={{ background: "black", color: "white" }}
                    >
                      {saving === day.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Guardar
                    </Button>
                  )}
                </div>

                {/* Config fields (only when active) */}
                {config.isActive && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
                        Desde
                      </Label>
                      <Input
                        type="time"
                        value={config.startTime}
                        onChange={(e) => updateConfig(day.id, { startTime: e.target.value })}
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
                        Hasta
                      </Label>
                      <Input
                        type="time"
                        value={config.endTime}
                        onChange={(e) => updateConfig(day.id, { endTime: e.target.value })}
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
                        Duración (min)
                      </Label>
                      <Input
                        type="number"
                        min={15}
                        max={240}
                        step={15}
                        value={config.slotDuration}
                        onChange={(e) =>
                          updateConfig(day.id, { slotDuration: parseInt(e.target.value, 10) || 60 })
                        }
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div
          className="mt-6 rounded-xl p-4 text-sm text-muted-foreground"
          style={{ background: "oklch(97% 0 0)" }}
        >
          <p className="font-medium text-foreground mb-1">¿Cómo funciona?</p>
          <ul className="space-y-1 text-xs">
            <li>• Activá los días en que aceptás reservas.</li>
            <li>• Configurá el horario de inicio y fin para cada día.</li>
            <li>• La duración del turno define cada cuánto se generan los slots disponibles.</li>
            <li>• Los turnos ya reservados no se sobrepondrán a nuevas reservas.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
