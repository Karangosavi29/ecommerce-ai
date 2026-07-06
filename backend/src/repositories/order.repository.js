import { Order } from "../models/order.model.js";

const findPendingByUser = (userId) =>
    Order.findOne({ user: userId, orderType: "online", paymentStatus: "pending", orderStatus: "pending" })
        .sort({ createdAt: -1 });

const findByIdAndUser = (orderId, userId) =>
    Order.findOne({ _id: orderId, user: userId }).select("-razorpaySignature");

const findByIdAdmin = (orderId) => Order.findById(orderId);

const create = (data, session = null) => Order.create([data], { session }).then((docs) => docs[0]);

const updatePendingOrder = (orderId, data, session = null) =>
    Order.findByIdAndUpdate(
        orderId,
        { $set: data, $unset: { razorpayOrderId: "" } }, // explicit $unset, not relying on undefined-assignment magic
        { new: true, session }
    );

const listByUser = (userId, { skip, limit }) =>
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-razorpaySignature");

const countByUser = (userId) => Order.countDocuments({ user: userId });

const listAll = (filter, { skip, limit }) =>
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email phone").select("-razorpaySignature");

const countAll = (filter) => Order.countDocuments(filter);

const updateStatus = (orderId, orderStatus, session = null) =>
    Order.findByIdAndUpdate(orderId, { $set: { orderStatus } }, { new: true, session });

const markCancelled = (orderId, refund, session = null) =>
    Order.findByIdAndUpdate(
        orderId,
        { $set: { orderStatus: "cancelled", ...(refund ? { paymentStatus: "refunded" } : {}) } },
        { new: true, session }
    );


const markPaidIfPending = (orderId, { razorpayPaymentId, razorpaySignature }, session = null) =>
    Order.findOneAndUpdate(
        { _id: orderId, paymentStatus: { $ne: "paid" } },
        { $set: { paymentStatus: "paid", orderStatus: "confirmed", razorpayPaymentId, ...(razorpaySignature ? { razorpaySignature } : {}) } },
        { new: true, session }
    );

const findByRazorpayOrderId = (razorpayOrderId) => Order.findOne({ razorpayOrderId });

const markFailed = (razorpayOrderId) =>
    Order.findOneAndUpdate({ razorpayOrderId }, { $set: { paymentStatus: "failed", orderStatus: "cancelled" } }, { new: true });

const setRazorpayOrderId = (orderId, razorpayOrderId, session = null) =>
    Order.findByIdAndUpdate(orderId, { $set: { razorpayOrderId } }, { new: true, session });


export default {
    findPendingByUser,
    findByIdAndUser,
    findByIdAdmin,
    create,
    updatePendingOrder,
    listByUser,
    countByUser,
    listAll,
    countAll,
    updateStatus,
    markCancelled,
    markPaidIfPending,
    findByRazorpayOrderId,
    markFailed,
    setRazorpayOrderId,
};