import { z } from "zod";

export const addressSchema = z.object({
  usuario_id: z.string().min(1, "Seleccione un usuario"),
  barrio_id: z.string().min(1, "Seleccione un barrio"),
  direccion: z
    .string()
    .min(1, "La dirección es requerida")
    .max(250, "Máximo 250 caracteres"),
  complemento: z.string().max(150, "Máximo 150 caracteres").optional().or(z.literal("")),
  referencia: z.string().optional().or(z.literal("")),
  latitud: z.coerce.number().optional(),
  longitud: z.coerce.number().optional(),
  es_principal: z.boolean().default(false),
  alias: z.string().max(50, "Máximo 50 caracteres").optional().or(z.literal("")),
});

export const addressUpdateSchema = addressSchema.partial();

export type AddressFormData = z.infer<typeof addressSchema>;
export type AddressUpdateFormData = z.infer<typeof addressUpdateSchema>;
