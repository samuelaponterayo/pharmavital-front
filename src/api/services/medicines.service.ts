import { api } from "../fetchClient";
import type { ApiResponse, PaginatedList, Medicine } from "@/types";

interface MedicineInput {
  categoria_id: string;
  proveedor_id: string;
  laboratorio_id: string;
  nombre_comercial: string;
  nombre_generico: string;
  registro_invima: string;
  concentracion?: string;
  presentacion?: string;
  contenido_por_unidad?: string;
  via_administracion?: string;
  condiciones_almacen?: string;
  requiere_formula?: boolean;
  requiere_refrigeracion?: boolean;
  es_controlado?: boolean;
  descripcion?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  imagen_url?: string;
  activo?: boolean;
}

export const medicinesService = {
  list(params?: { page?: number; limit?: number; search?: string }) {
    return api.get<PaginatedList<Medicine>>("/medicines", { params: params as Record<string, string | number | boolean | undefined> });
  },
  getById(id: string) {
    return api.get<ApiResponse<Medicine>>(`/medicines/${id}`);
  },
  create(data: MedicineInput) {
    return api.post<ApiResponse<Medicine>>("/medicines", data);
  },
  update(id: string, data: Partial<MedicineInput>) {
    return api.put<ApiResponse<Medicine>>(`/medicines/${id}`, data);
  },
  remove(id: string) {
    return api.delete<ApiResponse<{ message: string }>>(`/medicines/${id}`);
  },
};
