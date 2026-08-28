export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
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