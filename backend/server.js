import dotenv from "dotenv";
import express from "express"; 
import connectDB from "./src/config/db.js";

dotenv.config();
connectDB();

const app = express();    

const PORT =process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})