export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  employeeId?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  redirectTo?: string;
  data?: {
    user?: AuthUser;
    token?: string;
    accessToken?: string;
    redirectTo?: string;
  };
  user?: AuthUser;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[] | string>;
}
