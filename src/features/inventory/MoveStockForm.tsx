import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { moveStockSchema, type MoveStockFormData } from "@/schemas/inventory.schema";
import { Field } from "@/components/Field";

interface MoveStockFormProps {
  saving: boolean;
  onSave: (data: MoveStockFormData) => Promise<void>;
  onCancel: () => void;
}

export function MoveStockForm({ saving, onSave, onCancel }: MoveStockFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MoveStockFormData>({
    resolver: zodResolver(moveStockSchema) as any,
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Field label="Tipo de Movimiento" error={errors.tipo?.message}>
        <Select onValueChange={(v) => setValue("tipo", v as "entrada" | "salida" | "ajuste" | "devolucion" | "baja")}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="salida">Salida</SelectItem>
            <SelectItem value="ajuste">Ajuste</SelectItem>
            <SelectItem value="devolucion">Devolución</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Cantidad" error={errors.cantidad?.message}><Input type="number" {...register("cantidad")} /></Field>
      <Field label="Motivo"><Input {...register("motivo")} /></Field>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Procesando..." : "Confirmar"}</Button>
      </DialogFooter>
    </form>
  );
}
