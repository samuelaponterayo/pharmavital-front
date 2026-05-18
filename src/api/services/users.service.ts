import { api } from "../fetchClient";
import type { ApiResponse, PaginatedList, User } from "@/types";

interface UserInput {
  roleName?: string;
  rol_id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password?: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento?: string;
  foto_url?: string;
  estado?: string;
  email_verificado?: boolean;
}

export const usersService = {
  list(params?: { page?: number; limit?: number; search?: string }) {
    return api.get<PaginatedList<User>>("/users", { params: params as Record<string, string | number | boolean | undefined> });
  },
  getById(id: string) {
    return api.get<ApiResponse<User>>(`/users/${id}`);
  },
  create(data: UserInput) {
    return api.post<ApiResponse<User>>("/users", data);
  },
  update(id: string, data: Partial<UserInput>) {
    return api.put<ApiResponse<User>>(`/users/${id}`, data);
  },
  remove(id: string) {
    return api.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
  },
};
