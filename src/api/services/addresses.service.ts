import { api } from "../fetchClient";
import type { ApiResponse, Address } from "@/types";

interface AddressInput {
  usuario_id: string;
  barrio_id: string;
  direccion: string;
  complemento?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
  es_principal?: boolean;
  alias?: string;
  activo?: boolean;
}

export const addressesService = {
  list(params?: { user_id?: string }) {
    return api.get<ApiResponse<Address[]>>("/addresses", { params: params as Record<string, string | number | boolean | undefined> });
  },
  getById(id: string) {
    return api.get<ApiResponse<Address>>(`/addresses/${id}`);
  },
  create(data: AddressInput) {
    return api.post<ApiResponse<Address>>("/addresses", data);
  },
  update(id: string, data: Partial<AddressInput>) {
    return api.put<ApiResponse<Address>>(`/addresses/${id}`, data);
  },
  remove(id: string) {
    return api.delete<ApiResponse<{ message: string }>>(`/addresses/${id}`);
  },
};
