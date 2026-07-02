import { Worker } from "bullmq";
import redis from "../config/redis.js";
import {
    sendOrderConfirmationEmail,
    sendPaymentSuccessEmail,
    sendOrderShippedEmail,
} from "../utils/mailer.js";

const emailWorker = new Worker(
    "emailQueue",
    async (job) => {
        console.log(`Processing job: ${job.name} [${job.id}]`);

        if (job.name === "order_created") {
            await sendOrderConfirmationEmail(job.data);
            console.log(`Order confirmation sent to ${job.data.to}`);
        }

        if (job.name === "payment_success") {
            await sendPaymentSuccessEmail(job.data);
            console.log(`Payment receipt sent to ${job.data.to}`);
        }

        if (job.name === "order_shipped") {
            await sendOrderShippedEmail(job.data);
            console.log(`Shipping notification sent to ${job.data.to}`);
        }
    },
    {
        connection: redis,
        concurrency: 5, // process 5 jobs at a time
    }
);

emailWorker.on("completed", (job) => {
    console.log(` Job completed: ${job.name} [${job.id}]`);
});

emailWorker.on("failed", (job, err) => {
    console.error(` Job failed: ${job.name} [${job.id}] → ${err.message}`);
});

export default emailWorker;