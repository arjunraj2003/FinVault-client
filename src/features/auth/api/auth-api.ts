import axiosInstance from "@/lib/axios";
import type { LoginDto, AuthResponse } from "../types";

export class AuthApi {
  static login(data: LoginDto) {
    return axiosInstance.post<AuthResponse>("/auth/login", data);
  }

  static logout() {
    return axiosInstance.post("/auth/logout");
  }

  static refresh() {
    return axiosInstance.post<AuthResponse>("/auth/refresh");
  }
}
