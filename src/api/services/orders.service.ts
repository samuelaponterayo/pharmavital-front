import { api } from "../fetchClient";
import type { ApiResponse, PaginatedList, Order } from "@/types";

interface OrderItemInput {
  inventario_id: string;
  cantidad: number;
}

interface OrderInput {
  usuario_id: string;
  direccion_id: string;
  metodo_pago: string;
  items: OrderItemInput[];
  formula_id?: string;
  cupon_id?: string;
  descuento_directo?: number;
  costo_domicilio?: number;
  notas_cliente?: string;
  notas_internas?: string;
}

export const ordersService = {
  list(params?: { page?: number; limit?: number }) {
    return api.get<PaginatedList<Order>>("/orders", { params: params as Record<string, string | number | boolean | undefined> });
  },
  getById(id: string) {
    return api.get<ApiResponse<Order>>(`/orders/${id}`);
  },
  create(data: OrderInput) {
    return api.post<ApiResponse<Order>>("/orders", data);
  },
  updateStatus(id: string, estado: string, comentario?: string) {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { estado, comentario });
  },
  assignDelivery(id: string, mensajero_id: string, direccion_texto?: string) {
    return api.post<ApiResponse<Order>>(`/orders/${id}/delivery`, { mensajero_id, direccion_texto });
  },
  remove(id: string) {
    return api.delete<ApiResponse<{ message: string }>>(`/orders/${id}`);
  },
};
