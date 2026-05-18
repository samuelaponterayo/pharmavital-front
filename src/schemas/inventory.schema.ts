import { z } from "zod";

export const inventorySchema = z.object({
  medicamento_id: z.string().min(1, "Seleccione un medicamento"),
  proveedor_id: z.string().min(1, "Seleccione un proveedor"),
  lote: z.string().min(1, "El lote es requerido").max(50, "Máximo 50 caracteres"),
  fecha_fabricacion: z.string().optional().or(z.literal("")),
  fecha_vencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
  stock_disponible: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  stock_reservado: z.coerce.number().int().min(0, "El stock reservado no puede ser negativo").optional(),
  stock_minimo: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo").optional(),
  ubicacion_bodega: z.string().max(50, "Máximo 50 caracteres").optional().or(z.literal("")),
  precio_compra: z.coerce.number().min(0, "El precio de compra no puede ser negativo"),
  precio_venta: z.coerce.number().min(0, "El precio de venta no puede ser negativo"),
  porcentaje_iva: z.coerce
    .number()
    .min(0, "El porcentaje de IVA no puede ser negativo")
    .max(100, "El porcentaje de IVA no puede exceder 100%")
    .optional(),
});

export const moveStockSchema = z.object({
  tipo: z.enum(["entrada", "salida", "ajuste", "devolucion", "baja"] as const, {
    message: "Seleccione un tipo de movimiento",
  }),
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  motivo: z.string().optional().or(z.literal("")),
});

export const inventoryUpdateSchema = inventorySchema.partial();

export type InventoryFormData = z.infer<typeof inventorySchema>;
export type MoveStockFormData = z.infer<typeof moveStockSchema>;
export type InventoryUpdateFormData = z.infer<typeof inventoryUpdateSchema>;
