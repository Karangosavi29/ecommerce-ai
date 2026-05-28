import "dotenv/config";  // 👈 this is an import — runs before everything

import connectDB from "./src/config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});