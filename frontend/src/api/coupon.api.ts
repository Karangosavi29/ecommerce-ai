import axiosClient from "./axiosClient";
import type { CouponFormData } from "@/types/coupon";

// Preview-only: validates a code against the given order value and returns
// the discount amount, WITHOUT reserving/consuming the coupon's usage.
export const previewCoupon = (code: string, orderValue: number) =>
  axiosClient.post("/coupons/preview", { code, orderValue });

// Admin
export const createCoupon = (data: CouponFormData) => axiosClient.post("/coupons", data);

export const updateCoupon = (id: string, data: Partial<CouponFormData> & { isActive?: boolean }) =>
  axiosClient.put(`/coupons/${id}`, data);

export const listCoupons = (page = 1, limit = 20) =>
  axiosClient.get("/coupons", { params: { page, limit } });