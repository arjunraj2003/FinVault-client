export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data:{
    accessToken: string;
    user: User;
  }
  
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  unlockWithFingerprint: () => Promise<void>;
  enrollFingerprint: () => Promise<void>;
  disableFingerprint: () => Promise<void>;
  logout: () => Promise<void>;
}
