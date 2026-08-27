export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  id_token: string;
}

export interface AuthResponse {
  access?: string;
  token?: string;
  refresh?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}