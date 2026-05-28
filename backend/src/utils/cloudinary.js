import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Importing the file system module

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOncloudinary = async (Localfilepath) => {
    try {
        if (!Localfilepath) return null;

        const response = await cloudinary.uploader.upload(Localfilepath, {
            resource_type: "auto"
        });

        console.log("file uploaded successfully", response.url);
        fs.unlinkSync(Localfilepath);  // delete after success
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error); // 👈 add this
        if (fs.existsSync(Localfilepath)) {
            fs.unlinkSync(Localfilepath);
        }
        return null;
    }
}


export {uploadOncloudinary} ;