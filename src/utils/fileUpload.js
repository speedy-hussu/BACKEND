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
      media_metadata: true,
    });
    
    fs.unlinkSync(filePath); // Delete local file after upload
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return null;
  }
};
const deleteFile = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) {
      console.log("No public_id provided for deletion");
      return null;
    }

    const response = await v2.uploader.destroy(publicId, {
      resource_type: resourceType, // "image" | "video" | "raw"
    });

    return response;
  } catch (error) {
    console.error("Error occurred while deleting file:", error);
    return null;
  }
};


export { uploadFile, deleteFile };
