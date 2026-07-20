import axiosClient from "./axiosClient";

export const getWishlist = () => axiosClient.get("/wishlist");

export const addToWishlist = (productId: string) =>
  axiosClient.post("/wishlist/add", { productId });

export const removeFromWishlist = (productId: string) =>
  axiosClient.delete(`/wishlist/item/${productId}`);

export const clearWishlist = () => axiosClient.delete("/wishlist/clear");