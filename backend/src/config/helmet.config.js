import helmet from "helmet";

export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "https://res.cloudinary.com", "https://placehold.co", "data:"],
            connectSrc: ["'self'", process.env.CORS_ORIGIN].filter(Boolean),
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
});