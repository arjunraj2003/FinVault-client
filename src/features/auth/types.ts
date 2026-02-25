export interface LoginDto {
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
  logout: () => Promise<void>;
}
