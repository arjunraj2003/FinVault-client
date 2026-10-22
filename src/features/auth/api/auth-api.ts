import axiosInstance from "@/lib/axios";
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import type { LoginDto, RegisterDto, AuthResponse } from "../types";

export class AuthApi {
  static login(data: LoginDto) {
    return axiosInstance.post<AuthResponse>("/auth/login", data);
  }

  static register(data: RegisterDto) {
    return axiosInstance.post<AuthResponse>("/auth/register", data);
  }

  static logout() {
    return axiosInstance.post("/auth/logout");
  }

  static refresh() {
    return axiosInstance.post<AuthResponse>("/auth/refresh");
  }

  static passkeyRegisterOptions() {
    return axiosInstance.post<{ data: PublicKeyCredentialCreationOptionsJSON }>("/auth/webauthn/register/options");
  }

  static passkeyRegisterVerify(response: RegistrationResponseJSON) {
    return axiosInstance.post<{ data: { credentialId: string } }>("/auth/webauthn/register/verify", response);
  }

  static passkeyLoginOptions(credentialId?: string | null) {
    return axiosInstance.post<{ data: PublicKeyCredentialRequestOptionsJSON }>("/auth/webauthn/login/options", {
      credentialId: credentialId || undefined,
    });
  }

  static passkeyLoginVerify(response: AuthenticationResponseJSON) {
    return axiosInstance.post<AuthResponse>("/auth/webauthn/login/verify", response);
  }

  static passkeyRemove(credentialId: string) {
    return axiosInstance.delete("/auth/webauthn", { data: { credentialId } });
  }
}
