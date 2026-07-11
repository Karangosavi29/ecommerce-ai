const sanitizeObjectInPlace = (obj) => {
    if (!obj || typeof obj !== "object") return;

    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
            continue;
        }
        if (obj[key] && typeof obj[key] === "object") {
            sanitizeObjectInPlace(obj[key]);
        }
    }
};

export const mongoSanitizeMiddleware = (req, res, next) => {
    sanitizeObjectInPlace(req.body);
    sanitizeObjectInPlace(req.params);
    sanitizeObjectInPlace(req.query); 
    next();
};