import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
} from "@/api/auth.api";
import axiosClient from "@/api/axiosClient";
import type {
  User,
  AuthCredentials,
  RegisterPayload,
  ApiErrorResponse,
} from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  checkAuth: () => Promise<void>;
  login: (creds: AuthCredentials) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<RegisterPayload>) => Promise<boolean>;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSubmitting: false,

  checkAuth: async () => {
    try {
      const res = await getCurrentUser();
      set({ user: res.data.user ?? res.data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ isSubmitting: true });
    try {
      const res = await loginUser({ email, password });
      set({ user: res.data.user ?? res.data, isAuthenticated: true });
      toast.success("Logged in successfully");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  register: async ({ name, email, password }) => {
    set({ isSubmitting: true });
    try {
      const res = await registerUser({ name, email, password });
      set({ user: res.data.user ?? res.data, isAuthenticated: true });
      toast.success("Account created successfully");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } finally {
      set({ user: null, isAuthenticated: false });
      toast.success("Logged out");
    }
  },

  updateUserProfile: async (data) => {
    set({ isSubmitting: true });
    try {
      const res = await updateProfile(data);
      set({ user: res.data.user ?? res.data });
      toast.success("Profile updated");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

axiosClient.onRefreshFailed = () => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
};

export default useAuthStore;