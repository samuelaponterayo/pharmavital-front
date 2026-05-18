import { api } from "../fetchClient";
import type { ApiResponse, Barrio, Category, Laboratory, Provider, Coupon } from "@/types";

export const catalogService = {
  barrios() {
    return api.get<ApiResponse<Barrio[]>>("/catalogs/barrios");
  },
  categorias() {
    return api.get<ApiResponse<Category[]>>("/catalogs/categorias");
  },
  laboratorios() {
    return api.get<ApiResponse<Laboratory[]>>("/catalogs/laboratorios");
  },
  proveedores() {
    return api.get<ApiResponse<Provider[]>>("/catalogs/proveedores");
  },
  cupones() {
    return api.get<ApiResponse<Coupon[]>>("/catalogs/cupones");
  },
};
