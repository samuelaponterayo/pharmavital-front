import { z } from "zod";

const docTypes = ["CC", "CE", "TI", "PAS", "NIT"] as const;
const userStates = ["activo", "inactivo", "suspendido"] as const;
const roleNames = ["administrador", "farmaceuta", "domiciliario", "cliente"] as const;

export const userSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  apellido: z.string().min(1, "El apellido es requerido").max(100, "Máximo 100 caracteres"),
  email: z.string().min(1, "El email es requerido").email("Ingrese un email válido"),
  telefono: z.string().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional()
    .or(z.literal("")),
  tipo_documento: z.enum(docTypes, { message: "Seleccione un tipo de documento" }),
  numero_documento: z
    .string()
    .min(1, "El número de documento es requerido")
    .max(30, "Máximo 30 caracteres"),
  fecha_nacimiento: z.string().optional().or(z.literal("")),
  roleName: z.enum(roleNames, { message: "Seleccione un rol" }).optional(),
  rol_id: z.string().optional(),
  estado: z.enum(userStates, { message: "Seleccione un estado" }).optional(),
  email_verificado: z.boolean().optional(),
});

export const userUpdateSchema = userSchema.partial().extend({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
