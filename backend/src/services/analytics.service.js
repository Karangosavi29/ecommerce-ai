import analyticsRepository from "../repositories/analytics.repository.js";
import { getCache, setCache } from "../utils/cache.js";

const DASHBOARD_TTL = 120; // 2 min — dashboard stats don't need per-second freshness

const getDashboardAnalytics = async () => {
    const cacheKey = "admin:analytics:dashboard";
    const cached = await getCache(cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const [
        totalOrders, pendingOrders, totalUsers, totalProducts,
        revenueData, ordersByStatus, ordersByType, recentOrders, lowStockProducts,
    ] = await Promise.all([
        analyticsRepository.countOrders(),
        analyticsRepository.countOrders({ orderStatus: "pending" }),
        analyticsRepository.countUsers({ role: "customer" }),
        analyticsRepository.countActiveProducts(),
        analyticsRepository.getTotalRevenue(),
        analyticsRepository.getOrdersByStatus(),
        analyticsRepository.getOrdersByType(),
        analyticsRepository.getRecentOrders(5),
        analyticsRepository.getLowStockProducts(10),
    ]);

    const data = {
        totalOrders, pendingOrders, totalUsers, totalProducts,
        totalRevenue: revenueData[0]?.total || 0,
        ordersByStatus, ordersByType, recentOrders, lowStockProducts,
    };

    await setCache(cacheKey, data, DASHBOARD_TTL);
    return { data, fromCache: false };
};

const getRevenueReport = async () => {
    const cacheKey = "admin:analytics:revenue";
    const cached = await getCache(cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [dailyRevenue, topProducts] = await Promise.all([
        analyticsRepository.getDailyRevenue(last7Days),
        analyticsRepository.getTopProducts(5),
    ]);

    const data = { dailyRevenue, topProducts };
    await setCache(cacheKey, data, DASHBOARD_TTL);
    return { data, fromCache: false };
};

export default { getDashboardAnalytics, getRevenueReport };