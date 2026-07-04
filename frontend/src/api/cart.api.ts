import axiosClient from "./axiosClient";

export const getCart = () => {
  return axiosClient.get("/cart");
};

export const addToCart = (productId: string, qty: number) => {
  return axiosClient.post("/cart/add", { productId, qty });
};

export const updateCartItem = (productId: string, qty: number) => {
  return axiosClient.put("/cart/update", { productId, qty });
};

export const removeCartItem = (productId: string) => {
  return axiosClient.delete(`/cart/item/${productId}`);
};

export const clearCart = () => {
  return axiosClient.delete("/cart/clear");
};
