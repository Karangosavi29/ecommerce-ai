import axiosClient from "./axiosClient";

// Analytics
export const getAnalytics        = ()    => axiosClient.get("/admin/analytics");
export const getRevenueAnalytics = ()    => axiosClient.get("/admin/analytics/revenue");

// Orders
export const getAdminOrders      = ()    => axiosClient.get("/orders/admin/all");
export const updateOrderStatus   = (orderId: string, status: string) =>
    axiosClient.patch(`/orders/admin/${orderId}/status`, { orderStatus: status }); // was { status }
// Products
export const getAdminProducts = () => axiosClient.get("/admin/products");

export const createProduct = (data: FormData) =>
    axiosClient.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateProduct = (id: string, data: FormData) =>
    axiosClient.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deleteProduct = (id: string) => axiosClient.delete(`/products/${id}`);

// Users
export const getAdminUsers     = ()               => axiosClient.get("/admin/users");
export const getAdminUserById  = (userId: string) => axiosClient.get(`/admin/users/${userId}`);
export const getAdminOrderById = (orderId: string) => axiosClient.get(`/orders/admin/${orderId}`);