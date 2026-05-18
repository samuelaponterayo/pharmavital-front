import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formulaSchema, type FormulaFormData } from "@/schemas/formulas.schema";
import { Field } from "@/components/Field";
import { Stethoscope, Calendar, Image } from "lucide-react";

interface FormulaFormProps {
  saving: boolean;
  onSave: (data: FormulaFormData) => Promise<void>;
  onCancel: () => void;
}

const today = new Date(new Date().toISOString().split("T")[0] + "T00:00:00");

export function FormulaForm({ saving, onSave, onCancel }: FormulaFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormulaFormData>({
    resolver: zodResolver(formulaSchema) as any,
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5" noValidate>
      <div className="rounded-xl border dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/5 dark:bg-emerald-500/5 border-b dark:border-zinc-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-emerald-500/10">
            <Stethoscope className="h-4 w-4 text-primary dark:text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-primary dark:text-emerald-400">
            Datos del médico
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre del médico" error={errors.medico_nombre?.message}>
              <Input {...register("medico_nombre")} placeholder="Dr. Juan Pérez" />
            </Field>
            <Field label="Registro médico" error={errors.medico_registro?.message}>
              <Input {...register("medico_registro")} placeholder="RM-12345" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Especialidad">
              <Input {...register("medico_especialidad")} placeholder="Medicina General" />
            </Field>
            <Field label="IPS">
              <Input {...register("ips_nombre")} placeholder="Nombre de la IPS" />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-xl border dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50/60 dark:bg-amber-950/30 border-b dark:border-zinc-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Vigencia
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Fecha de emisión" error={errors.fecha_emision?.message}>
              <Controller
                name="fecha_emision"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    max={today}
                  />
                )}
              />
            </Field>
            <Field label="Fecha de vencimiento" error={errors.fecha_vencimiento?.message}>
              <Controller
                name="fecha_vencimiento"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    min={today}
                  />
                )}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-xl border dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/60 dark:bg-zinc-800/50 border-b dark:border-zinc-700">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-700">
            <Image className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
            Imagen de la fórmula
          </span>
        </div>
        <div className="p-4 space-y-3">
          <Field label="URL de la imagen" error={errors.imagen_url?.message}>
            <Input
              {...register("imagen_url")}
              placeholder="https://ejemplo.com/formula-medica.jpg"
              className="font-mono text-xs"
            />
          </Field>
          <Field label="Segunda imagen (opcional)">
            <Input
              {...register("imagen_url_2")}
              placeholder="https://ejemplo.com/formula-medica-2.jpg"
              className="font-mono text-xs"
            />
          </Field>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Enviando..." : "Enviar fórmula"}
        </Button>
      </DialogFooter>
    </form>
  );
}
