import { z } from "zod";

export const medicineSchema = z.object({
  nombre_comercial: z
    .string()
    .min(1, "El nombre comercial es requerido")
    .max(200, "Máximo 200 caracteres"),
  nombre_generico: z
    .string()
    .min(1, "El nombre genérico es requerido")
    .max(200, "Máximo 200 caracteres"),
  registro_invima: z
    .string()
    .min(1, "El registro INVIMA es requerido")
    .max(50, "Máximo 50 caracteres"),
  categoria_id: z.string().min(1, "Seleccione una categoría"),
  proveedor_id: z.string().min(1, "Seleccione un proveedor"),
  laboratorio_id: z.string().min(1, "Seleccione un laboratorio"),
  concentracion: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  presentacion: z.string().max(150, "Máximo 150 caracteres").optional().or(z.literal("")),
  contenido_por_unidad: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  via_administracion: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  condiciones_almacen: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  requiere_formula: z.boolean().default(false),
  requiere_refrigeracion: z.boolean().default(false),
  es_controlado: z.boolean().default(false),
  descripcion: z.string().optional().or(z.literal("")),
  indicaciones: z.string().optional().or(z.literal("")),
  contraindicaciones: z.string().optional().or(z.literal("")),
  imagen_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export const medicineUpdateSchema = medicineSchema.partial();

export type MedicineFormData = z.infer<typeof medicineSchema>;
export type MedicineUpdateFormData = z.infer<typeof medicineUpdateSchema>;
