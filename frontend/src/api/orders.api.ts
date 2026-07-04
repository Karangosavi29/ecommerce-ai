import axiosClient from "./axiosClient";
import type { ShippingAddress } from "@/types";

export const createOrder = (data: {
  shippingAddress: ShippingAddress;
  orderType: "online" | "whatsapp";
  paymentMethod?: string; // required + must be "razorpay" when orderType is "online"
  notes?: string;
}) => {
  return axiosClient.post("/orders/create", data);
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