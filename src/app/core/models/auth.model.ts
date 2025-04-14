export interface User { 
    id: number;
    nickname: string;
    name: string;
    last_name1: string;
    last_name2: string;
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