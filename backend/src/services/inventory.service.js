import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

const reserveStockForItems = async (items, session) => {
    for (const item of items) {
        const updated = await productRepository.decrementStock(item.product, item.quantity, session);
        if (!updated) throw new ApiError(409, `"${item.name}" no longer has enough stock`);
    }
};

const restockItems = async (items, session) => {
    for (const item of items) {
        await productRepository.incrementStock(item.product, item.quantity, session);
    }
};

export default { reserveStockForItems, restockItems };