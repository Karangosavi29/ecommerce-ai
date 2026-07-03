import axiosClient from "./axiosClient";

export const createPaymentOrder = (orderId: string) => {
  return axiosClient.post("/payments/create-order", { orderId });
};

export const verifyPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}) => {
  return axiosClient.post("/payments/verify", data);
};