import axiosClient from "./axiosClient";
import type { ProductQueryParams } from "@/types";

export const getProducts = (params: ProductQueryParams = {}) => {
  return axiosClient.get("/products", { params });
};

export const getCategories = () => {
  return axiosClient.get("/products/categories");
};

export const getProductById = (id: string) => {
  return axiosClient.get(`/products/${id}`);
};