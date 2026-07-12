import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import orderService from "../services/order.service.js";

const createOrder = asyncHandler(async (req, res) => {
    const result = await orderService.createOrder(req.user._id, req.user.email, req.user.name, req.body);
    const message = result.isWhatsApp ? "WhatsApp order created. Redirect user to WhatsApp." : "Order created. Proceed to payment.";
    return res.status(201).json(new ApiResponse(201, result, message));
});

const getMyOrders = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const data = await orderService.getMyOrders(req.user._id, page, limit);
    return res.status(200).json(new ApiResponse(200, data, "Orders fetched"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.orderId, req.user._id);
    return res.status(200).json(new ApiResponse(200, order, "Order fetched"));
});

const cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.orderId, req.user._id);
    return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
    const data = await orderService.getAllOrders(req.query);
    return res.status(200).json(new ApiResponse(200, data, "All orders fetched"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.orderId, req.body.orderStatus);
    return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

const getOrderByIdAdmin = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderByIdAdmin(req.params.orderId);
    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

export { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getOrderByIdAdmin };