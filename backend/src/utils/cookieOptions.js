export const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction, // false locally so cookies work over http://localhost
        sameSite: isProduction ? "none" : "lax", // "none" required for cross-domain (Vercel <-> Railway/Render)
        // "none" requires secure:true — browsers reject sameSite:none without secure in production, which is fine since isProduction implies secure:true here
    };
};