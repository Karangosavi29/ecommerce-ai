import axiosClient from "./axiosClient";

export const getProductReviews = (productId: string, page = 1, limit = 10) =>
  axiosClient.get(`/products/${productId}/reviews`, { params: { page, limit } });

export const createReview = (productId: string, data: { rating: number; comment?: string }) =>
  axiosClient.post(`/products/${productId}/reviews`, data);

export const updateReview = (productId: string, data: { rating: number; comment?: string }) =>
  axiosClient.put(`/products/${productId}/reviews`, data);

export const deleteReview = (productId: string) =>
  axiosClient.delete(`/products/${productId}/reviews`);