import userRepository from "../repositories/user.repository.js";
import orderRepository from "../repositories/order.repository.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_LIMIT = 50;

const listUsers = async (page, limit) => {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
        userRepository.findAllCustomers({ skip, limit: safeLimit }),
        userRepository.countCustomers(),
    ]);

    return { users, pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit) } };
};

const getUserWithOrders = async (userId, page, limit) => {
    const user = await userRepository.findByIdAdmin(userId);
    if (!user) throw new ApiError(404, "User not found");

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [orders, total] = await Promise.all([
        orderRepository.listByUser(userId, { skip, limit: safeLimit }),
        orderRepository.countByUser(userId),
    ]);

    return { user, orders, pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit) } };
};

export default { listUsers, getUserWithOrders };