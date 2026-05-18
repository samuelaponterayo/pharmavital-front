import { useEffect, useState } from "react";
import { medicinesService } from "@/api/services/medicines.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema, type InventoryFormData } from "@/schemas/inventory.schema";
import { Field } from "@/components/Field";
import { useCatalogOptions } from "@/hooks/useCatalogOptions";
import type { Inventory, Medicine } from "@/types";

interface InventoryFormProps {
  item?: Inventory;
  onSave: (data: InventoryFormData) => Promise<void>;
  saving: boolean;
  onCancel: () => void;
}

export function InventoryForm({ item, onSave, saving, onCancel }: InventoryFormProps) {
  const [meds, setMeds] = useState<Medicine[]>([]);
  const { providers } = useCatalogOptions();

  useEffect(() => {
    const loadMeds = async () => {
      try {
        const res = await medicinesService.list({ limit: 100 });
        setMeds(res.data ?? []);
      } catch (err) {
        console.error("Error loading medicines:", err);
      }
    };
    loadMeds();
  }, []);

  const { register, handleSubmit, control, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema) as any,
    defaultValues: item ? {
      medicamento_id: item.medicamento_id,
      proveedor_id: item.proveedor_id,
      lote: item.lote,
      fecha_fabricacion: item.fecha_fabricacion ?? "",
      fecha_vencimiento: item.fecha_vencimiento,
      stock_disponible: Number(item.stock_disponible),
      stock_reservado: Number(item.stock_reservado),
      stock_minimo: Number(item.stock_minimo),
      ubicacion_bodega: item.ubicacion_bodega ?? "",
      precio_compra: Number(item.precio_compra),
      precio_venta: Number(item.precio_venta),
      porcentaje_iva: Number(item.porcentaje_iva),
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Field label="Medicamento" error={errors.medicamento_id?.message}>
        <Controller control={control} name="medicamento_id" render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange} defaultValue={item?.medicamento_id}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {meds.map((m) => <SelectItem key={m.id} value={m.id}>{m.nombre_comercial}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
      </Field>
      <Field label="Proveedor" error={errors.proveedor_id?.message}>
        <Controller control={control} name="proveedor_id" render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange} defaultValue={item?.proveedor_id}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Lote" error={errors.lote?.message}><Input {...register("lote")} /></Field>
        <Field label="Ubicación"><Input {...register("ubicacion_bodega")} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha Fabricación"><Input type="date" {...register("fecha_fabricacion")} /></Field>
        <Field label="Fecha Vencimiento" error={errors.fecha_vencimiento?.message}><Input type="date" {...register("fecha_vencimiento")} /></Field>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Field label="Stock" error={errors.stock_disponible?.message}><Input type="number" {...register("stock_disponible")} /></Field>
        <Field label="Reservado"><Input type="number" {...register("stock_reservado")} /></Field>
        <Field label="Mínimo"><Input type="number" {...register("stock_minimo")} /></Field>
        <Field label="IVA %"><Input type="number" step="0.01" {...register("porcentaje_iva")} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Precio Compra" error={errors.precio_compra?.message}><Input type="number" step="0.01" {...register("precio_compra")} /></Field>
        <Field label="Precio Venta" error={errors.precio_venta?.message}><Input type="number" step="0.01" {...register("precio_venta")} /></Field>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}
