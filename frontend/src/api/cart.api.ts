import axiosClient from "./axiosClient";

export const getCart = () => {
  return axiosClient.get("/cart");
};

export const addToCart = (productId: string, quantity: number) => {
  return axiosClient.post("/cart/add", { productId, quantity });
};

export const updateCartItem = (productId: string, quantity: number) => {
  return axiosClient.put("/cart/update", { productId, quantity });
};

export const removeCartItem = (productId: string) => {
  return axiosClient.delete(`/cart/item/${productId}`);
};

export const clearCart = () => {
  return axiosClient.delete("/cart/clear");
};
