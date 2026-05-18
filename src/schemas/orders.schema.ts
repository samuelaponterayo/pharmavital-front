import { z } from "zod";

const paymentMethods = [
  "efectivo_contraentrega",
  "tarjeta_credito",
  "tarjeta_debito",
  "nequi",
  "daviplata",
  "pse",
  "bancolombia_qr",
] as const;

const orderItemSchema = z.object({
  inventario_id: z.string().min(1, "Seleccione un inventario"),
  cantidad: z.number().int().min(1, "La cantidad debe ser al menos 1"),
});

export const orderSchema = z.object({
  usuario_id: z.string().min(1, "Seleccione un usuario"),
  direccion_id: z.string().min(1, "Seleccione una dirección"),
  metodo_pago: z.enum(paymentMethods, { message: "Seleccione un método de pago" }),
  items: z.array(orderItemSchema).min(1, "Debe incluir al menos un item"),
  formula_id: z.string().optional().or(z.literal("")),
  cupon_id: z.string().optional().or(z.literal("")),
  descuento_directo: z.number().min(0, "El descuento directo no puede ser negativo").optional(),
  costo_domicilio: z.number().min(0, "El costo de domicilio no puede ser negativo").optional(),
  notas_cliente: z.string().optional().or(z.literal("")),
  notas_internas: z.string().optional().or(z.literal("")),
});

const orderStates = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "listo_despacho",
  "en_domicilio",
  "entregado",
  "cancelado",
  "devuelto",
] as const;

export const orderStatusSchema = z.object({
  estado: z.enum(orderStates, { message: "Seleccione un estado" }),
  comentario: z.string().optional().or(z.literal("")),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderStatusFormData = z.infer<typeof orderStatusSchema>;
