import crypto from "crypto";

export const verifySignature = (payload, signature, secret) => {
    if (!secret) throw new Error("Razorpay secret not configured");

    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(signature || "", "utf8");

    if (expectedBuffer.length !== actualBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};