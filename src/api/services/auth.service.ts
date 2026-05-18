import { api } from "../fetchClient";
import type { ApiResponse, AuthResponse, User } from "@/types";

export const authService = {
  login(email: string, password: string) {
    return api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
  },
  refresh(refreshToken: string) {
    return api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", { refreshToken });
  },
  logout(refreshToken: string) {
    return api.post<ApiResponse<{ message: string }>>("/auth/logout", { refreshToken });
  },
  me() {
    return api.get<ApiResponse<User>>("/auth/me");
  },
};
