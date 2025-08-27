import { v2 } from "cloudinary";
import fs from "fs";
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath) => {
  try {
    if (!filePath) return console.log("No file path provided");
    const response = await v2.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully", response.url);
    console.log("Uploading file from:", filePath);
    console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);

    return response;
  } catch (error) {
    fs.unlinkSync(filePath); // Delete the file if upload fails
    return null;
  }
};
export { uploadFile };
