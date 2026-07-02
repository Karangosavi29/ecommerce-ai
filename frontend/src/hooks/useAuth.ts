import useAuthStore from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const isAdmin = user?.role === "admin";

  return {
    user,
    isAuthenticated,
    isLoading,
    isSubmitting,
    isAdmin,
    login,
    register,
    logout,
    updateUserProfile,
    checkAuth,
  };
}

export default useAuth;