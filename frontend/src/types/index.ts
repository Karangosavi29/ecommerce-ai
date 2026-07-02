export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin"; // ⚠️ adjust if your backend uses a different field/shape
  [key: string]: unknown;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  message?: string;
}