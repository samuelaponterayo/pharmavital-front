import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCatalogOptions } from "@/hooks/useCatalogOptions";
import { Field } from "@/components/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { medicineSchema, medicineUpdateSchema, type MedicineFormData } from "@/schemas/medicines.schema";
import type { Medicine } from "@/types";

interface MedicineFormProps {
  medicine?: Medicine;
  onSave: (data: MedicineFormData) => void;
  saving: boolean;
  onCancel: () => void;
}

export function MedicineForm({ medicine, onSave, saving, onCancel }: MedicineFormProps) {
  const { categories, laboratories, providers, loading: catalogLoading } = useCatalogOptions();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicine ? medicineUpdateSchema : medicineSchema) as any,
    defaultValues: medicine ? {
      nombre_comercial: medicine.nombre_comercial,
      nombre_generico: medicine.nombre_generico,
      registro_invima: medicine.registro_invima,
      categoria_id: medicine.categoria_id,
      proveedor_id: medicine.proveedor_id,
      laboratorio_id: medicine.laboratorio_id,
      concentracion: medicine.concentracion ?? "",
      presentacion: medicine.presentacion ?? "",
      contenido_por_unidad: medicine.contenido_por_unidad ?? "",
      via_administracion: medicine.via_administracion ?? "",
      condiciones_almacen: medicine.condiciones_almacen ?? "",
      requiere_formula: medicine.requiere_formula,
      requiere_refrigeracion: medicine.requiere_refrigeracion,
      es_controlado: medicine.es_controlado,
      descripcion: medicine.descripcion ?? "",
      indicaciones: medicine.indicaciones ?? "",
      contraindicaciones: medicine.contraindicaciones ?? "",
      imagen_url: medicine.imagen_url ?? "",
    } : undefined,
  });

  if (catalogLoading) return null;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre Comercial" error={errors.nombre_comercial?.message}>
          <Input {...register("nombre_comercial")} />
        </Field>
        <Field label="Nombre Genérico" error={errors.nombre_generico?.message}>
          <Input {...register("nombre_generico")} />
        </Field>
      </div>
      <Field label="Registro INVIMA" error={errors.registro_invima?.message}>
        <Input {...register("registro_invima")} />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Categoría" error={errors.categoria_id?.message}>
          <Controller control={control} name="categoria_id" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Laboratorio" error={errors.laboratorio_id?.message}>
          <Controller control={control} name="laboratorio_id" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {laboratories.map((l) => <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Proveedor" error={errors.proveedor_id?.message}>
          <Controller control={control} name="proveedor_id" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Concentración">
          <Input {...register("concentracion")} placeholder="500 mg" />
        </Field>
        <Field label="Presentación">
          <Input {...register("presentacion")} placeholder="Tabletas" />
        </Field>
        <Field label="Contenido por Unidad">
          <Input {...register("contenido_por_unidad")} placeholder="Caja x 30" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vía Administración">
          <Input {...register("via_administracion")} placeholder="Oral" />
        </Field>
        <Field label="Condiciones Almacén">
          <Input {...register("condiciones_almacen")} placeholder="Lugar fresco y seco" />
        </Field>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <Controller control={control} name="requiere_formula" render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          )} />
          <span className="text-sm">Requiere fórmula</span>
        </label>
        <label className="flex items-center gap-2">
          <Controller control={control} name="requiere_refrigeracion" render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          )} />
          <span className="text-sm">Refrigeración</span>
        </label>
        <label className="flex items-center gap-2">
          <Controller control={control} name="es_controlado" render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          )} />
          <span className="text-sm">Controlado</span>
        </label>
      </div>
      <Field label="Imagen URL">
        <Input {...register("imagen_url")} placeholder="https://..." />
      </Field>
      <div className="grid grid-cols-1 gap-4">
        <Field label="Descripción">
          <Textarea {...register("descripcion")} rows={2} />
        </Field>
        <Field label="Indicaciones">
          <Textarea {...register("indicaciones")} rows={2} />
        </Field>
        <Field label="Contraindicaciones">
          <Textarea {...register("contraindicaciones")} rows={2} />
        </Field>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}
