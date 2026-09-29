// Fails fast with one clear message if a required env var is missing, instead of
// letting the app boot successfully and then break confusingly later (e.g. a
// Cloudinary upload throwing mid-request, or JWTs silently signing with "undefined").
// See backend/.env.example for what each of these is for.
const REQUIRED_ENV_VARS = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CORS_ORIGIN",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "GROQ_API_KEY",
];

export const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

    if (missing.length) {
        console.error(
            `Missing required environment variable(s): ${missing.join(", ")}\n` +
            "See backend/.env.example for the full list and what each one is for."
        );
        process.exit(1);
    }
};
