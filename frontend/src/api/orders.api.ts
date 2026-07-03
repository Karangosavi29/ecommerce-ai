import axiosClient from "./axiosClient";
import type { ShippingAddress } from "@/types";

export const createOrder = (data: {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}) => {
  return axiosClient.post("/orders", data);
};

export const createWhatsAppOrder = (data: { shippingAddress: ShippingAddress }) => {
  return axiosClient.post("/orders/whatsapp", data);
};

export const getMyOrders = () => {
  return axiosClient.get("/orders/my-orders");
};

export const getOrderById = (orderId: string) => {
  return axiosClient.get(`/orders/${orderId}`);
};

export const cancelOrder = (orderId: string) => {
  return axiosClient.patch(`/orders/${orderId}/cancel`);
};