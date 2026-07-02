import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Order confirmation email
const sendOrderConfirmationEmail = async ({ to, name, orderId, items, totalAmount }) => {
    const itemRows = items
        .map((item) => `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">₹${item.price * item.quantity}</td>
        </tr>`)
        .join("");

    await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to,
        subject: `Order Confirmed #${orderId}`,
        html: `
            <h2>Hi ${name}, your order is confirmed! 🎉</h2>
            <p>Order ID: <strong>${orderId}</strong></p>
            <table style="width:100%;border-collapse:collapse">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px">Product</th>
                        <th style="text-align:left;padding:8px">Qty</th>
                        <th style="text-align:left;padding:8px">Price</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
            <h3>Total: ₹${totalAmount}</h3>
            <p>We'll notify you when your order ships.</p>
        `,
    });
};

// Payment success email
const sendPaymentSuccessEmail = async ({ to, name, orderId, totalAmount, paymentId }) => {
    await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to,
        subject: `Payment Received #${orderId}`,
        html: `
            <h2>Hi ${name}, payment received! ✅</h2>
            <p>Order ID: <strong>${orderId}</strong></p>
            <p>Payment ID: <strong>${paymentId}</strong></p>
            <p>Amount Paid: <strong>₹${totalAmount}</strong></p>
            <p>Your order is now being processed.</p>
        `,
    });
};

// Order shipped email
const sendOrderShippedEmail = async ({ to, name, orderId }) => {
    await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to,
        subject: `Your Order Has Shipped #${orderId}`,
        html: `
            <h2>Hi ${name}, your order is on the way! 🚚</h2>
            <p>Order ID: <strong>${orderId}</strong></p>
            <p>Your order has been shipped and will arrive soon.</p>
        `,
    });
};

export {
    sendOrderConfirmationEmail,
    sendPaymentSuccessEmail,
    sendOrderShippedEmail,
};