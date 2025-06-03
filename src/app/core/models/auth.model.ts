export interface User {
  id: number;
  name: string;
  last_name1?: string;
  last_name2?: string;
  nickname: string;
  birthdate?: string;
  union_date: string;
  id_role: number;
  role: string;
}

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface LogoutRequest {
  refresh_token?: string;
}