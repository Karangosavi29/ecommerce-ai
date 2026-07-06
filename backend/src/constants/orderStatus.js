export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export const TERMINAL_STATUSES = ["delivered", "cancelled"];

// Explicit allow-list: current status -> statuses it's legal to move to
export const ORDER_STATUS_TRANSITIONS = {
    pending:    ["confirmed", "cancelled"],
    confirmed:  ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped:    ["delivered"],
    delivered:  [],
    cancelled:  [],
};

export const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];