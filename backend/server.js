import "dotenv/config";  

import connectDB from "./src/config/db.js";
import { app } from "./app.js";
import "./src/workers/email.worker.js"; //  start worker

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});