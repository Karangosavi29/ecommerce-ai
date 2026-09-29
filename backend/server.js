import "dotenv/config";  

import { validateEnv } from "./src/config/validateEnv.js";
validateEnv();

// Everything below reads env vars at import time (e.g. the Razorpay/Cloudinary
// clients), so it's imported dynamically here, after validateEnv() has already
// run -- a static `import` at the top of this file would be hoisted and load
// before validateEnv() gets a chance to run, defeating the fail-fast check.
const { default: connectDB } = await import("./src/config/db.js");
const { app } = await import("./app.js");
await import("./src/workers/email.worker.js"); //  start worker

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});