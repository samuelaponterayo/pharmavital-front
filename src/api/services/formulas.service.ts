import { api } from "../fetchClient";
import type { ApiResponse, Formula } from "@/types";

interface FormulaInput {
  usuario_id: string;
  medico_nombre: string;
  medico_registro: string;
  medico_especialidad?: string;
  ips_nombre?: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  imagen_url: string;
  imagen_url_2?: string;
}

export const formulasService = {
  list(params?: { user_id?: string }) {
    return api.get<ApiResponse<Formula[]>>("/formulas", { params: params as Record<string, string | number | boolean | undefined> });
  },
  getById(id: string) {
    return api.get<ApiResponse<Formula>>(`/formulas/${id}`);
  },
  create(data: FormulaInput) {
    return api.post<ApiResponse<Formula>>("/formulas", data);
  },
  updateStatus(id: string, estado: string, notas?: string) {
    return api.patch<ApiResponse<Formula>>(`/formulas/${id}/status`, { estado, notas });
  },
  remove(id: string) {
    return api.delete<ApiResponse<{ message: string }>>(`/formulas/${id}`);
  },
};
