import { z } from "zod";

const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

export const formulaSchema = z.object({
  medico_nombre: z
    .string()
    .min(1, "El nombre del médico es requerido")
    .max(150, "Máximo 150 caracteres"),
  medico_registro: z
    .string()
    .min(1, "El registro médico es requerido")
    .max(50, "Máximo 50 caracteres"),
  medico_especialidad: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  ips_nombre: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  fecha_emision: z
    .union([z.string().min(1), z.undefined()])
    .transform((v) => v ?? "")
    .pipe(
      z
        .string()
        .min(1, "La fecha de emisión es requerida")
        .regex(fechaRegex, "Formato de fecha inválido (yyyy-mm-dd)")
    ),
  fecha_vencimiento: z
    .union([z.string().min(1), z.undefined()])
    .transform((v) => v ?? "")
    .pipe(
      z
        .string()
        .min(1, "La fecha de vencimiento es requerida")
        .regex(fechaRegex, "Formato de fecha inválido (yyyy-mm-dd)")
    ),
  imagen_url: z
    .union([z.string(), z.undefined()])
    .transform((v) => v ?? "")
    .pipe(
      z
        .string()
        .min(1, "La imagen de la fórmula es requerida")
        .url("Debe ser una URL válida")
    ),
  imagen_url_2: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
});

export const formulaStatusSchema = z.object({
  estado: z.enum(
    ["pendiente", "aprobada", "rechazada", "vencida", "usada"] as const,
    { message: "Seleccione un estado" }
  ),
  notas: z.string().optional().or(z.literal("")),
});

export type FormulaFormData = z.infer<typeof formulaSchema>;
export type FormulaStatusFormData = z.infer<typeof formulaStatusSchema>;
