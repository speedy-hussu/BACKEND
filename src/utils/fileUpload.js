import { v2 } from "cloudinary";
import fs from "fs";
console.log(process.env.CLOUDINARY_APIKEY, process.env.CLOUDINARY_API_SECRET);
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath) => {
  try {
    if (!filePath) {
      console.log("No file path provided");
      return null;
    }
    console.log("Uploading file:", filePath);
    const response = await v2.uploader.upload(filePath, {
      resource_type: "auto",
    });


    fs.unlinkSync(filePath); // Delete local file after upload
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return null;
  }
};

export { uploadFile };
