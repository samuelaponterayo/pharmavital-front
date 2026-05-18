import { api } from "../fetchClient";
import type { ApiResponse, Inventory } from "@/types";

interface InventoryInput {
  medicamento_id: string;
  proveedor_id: string;
  lote: string;
  fecha_fabricacion?: string;
  fecha_vencimiento: string;
  stock_disponible: number;
  stock_reservado?: number;
  stock_minimo?: number;
  ubicacion_bodega?: string;
  precio_compra: number;
  precio_venta: number;
  porcentaje_iva?: number;
}

export const inventoryService = {
  list() {
    return api.get<ApiResponse<Inventory[]>>("/inventory");
  },
  getById(id: string) {
    return api.get<ApiResponse<Inventory>>(`/inventory/${id}`);
  },
  create(data: InventoryInput) {
    return api.post<ApiResponse<Inventory>>("/inventory", data);
  },
  update(id: string, data: Partial<InventoryInput>) {
    return api.put<ApiResponse<Inventory>>(`/inventory/${id}`, data);
  },
  moveStock(id: string, tipo: string, cantidad: number, motivo?: string) {
    return api.post<ApiResponse<Inventory>>(`/inventory/${id}/move`, { tipo, cantidad, motivo });
  },
  remove(id: string) {
    return api.delete<ApiResponse<{ message: string }>>(`/inventory/${id}`);
  },
};
