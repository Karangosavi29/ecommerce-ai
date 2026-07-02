import axiosClient from "./axiosClient";
import type { AuthCredentials, RegisterPayload } from "@/types";

export const registerUser = (data: RegisterPayload) => {
  return axiosClient.post("/auth/register", data);
};

export const loginUser = (data: AuthCredentials) => {
  return axiosClient.post("/auth/login", data);
};

export const logoutUser = () => {
  return axiosClient.post("/auth/logout");
};

export const refreshToken = () => {
  return axiosClient.post("/auth/refresh-token");
};

export const getCurrentUser = () => {
  return axiosClient.get("/auth/me");
};

export const updateProfile = (data: Partial<RegisterPayload>) => {
  return axiosClient.put("/auth/profile", data);
};