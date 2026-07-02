import { Queue } from "bullmq";
import redis from "../config/redis.js";

// One queue for all email jobs
const emailQueue = new Queue("emailQueue", {
    connection: redis,
    defaultJobOptions: {
        attempts:  3,      // retry 3 times if fails
        backoff: {
            type:  "exponential",
            delay: 5000,   // wait 5s, 10s, 20s between retries
        },
        removeOnComplete: true,  // clean up after success
        removeOnFail:     false, // keep failed jobs for debugging
    },
});

// Add order confirmation job
const addOrderConfirmationJob = async (data) => {
    await emailQueue.add("order_created", data);
    console.log(`Job added: order_created for order ${data.orderId}`);
};

// Add payment success job
const addPaymentSuccessJob = async (data) => {
    await emailQueue.add("payment_success", data);
    console.log(`Job added: payment_success for order ${data.orderId}`);
};

// Add order shipped job
const addOrderShippedJob = async (data) => {
    await emailQueue.add("order_shipped", data);
    console.log(`Job added: order_shipped for order ${data.orderId}`);
};

export {
    emailQueue,
    addOrderConfirmationJob,
    addPaymentSuccessJob,
    addOrderShippedJob,
};