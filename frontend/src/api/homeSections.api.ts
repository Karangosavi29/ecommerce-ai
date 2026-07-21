import axiosClient from "./axiosClient";

export type HomeSectionKey = "flashSale" | "featured" | "bestSellers";

export const getAllHomeSections = () => axiosClient.get("/home-sections");

export const getHomeSection = (key: HomeSectionKey) => axiosClient.get(`/home-sections/${key}`);

export const updateHomeSection = (key: HomeSectionKey, productIds: string[]) =>
  axiosClient.put(`/home-sections/${key}`, { productIds });