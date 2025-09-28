
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFile, uploadFile } from "../utils/fileUpload.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
}); //TODO: get all videos based on query, sort, pagination

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoPath = req.file?.path;
  if (!videoPath) throw new ApiError(400, "Video Not found");
  const video = await uploadFile(videoPath);
  if (!video) throw new ApiError(500, "error while uploading video");

  const thumbnailUrl = await v2.uploader.upload(video.url, {
    resource_type: "video",
    public_id: video.public_id + "_thumb",
    format: "jpg",
    transformation: [{ start_offset: "3" }],
  });
  const videoModel = await Video.create({
    title,
    description,
    thumbnail: thumbnailUrl.secure_url,
    videoUrl: video.url,
    owner: req.user.id,
    duration: video.duration,
  });
  res
    .status(201)
    .json(new ApiResponse(201, videoModel, "Video Uploaded successfully"));
});

const videoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, " videoId is required");
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "no video found");
  res.status(200).json(new ApiResponse(200, video, "video found"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //getting video id
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id required");

  //getting masala for update
  const { title, description } = req.body;
  const thumbnailPath = req.file?.path;

  if (!title && !description && !thumbnailPath)
    throw new ApiError(400, "Something is reqired for updating");

  let updateData = {};

  if (title) updateData.title = title;
  if (description) updateData.description = description;

  if (thumbnailPath) {
    const thumbnail = await uploadFile(thumbnailPath);
    if (!thumbnail) throw new ApiError(400, "Error while uploading thumbnail");
    updateData.thumbnail = thumbnail.url; // only store URL
  }
  //finding video and updating
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateData },
    { new: true } // return updated doc
  );
  if (!video) throw new ApiError(404, "Video not found");

  //returning response
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated succesfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "video id is required");

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) throw new ApiError(404, "video not found");

  // 2. Extract public_id from Cloudinary URLs
  const extractPublicId = (url) => {
    const parts = url.split("/");
    const file = parts[parts.length - 1]; // e.g. abc123.jpg
    return file.split(".")[0]; // abc123
  };

  const videoUrl = extractPublicId(video.videoUrl);
  const thumbnailUrl = extractPublicId(video.thumbnail);

  if (videoUrl) await deleteFile(videoUrl, "video");
  if (thumbnailUrl) await deleteFile(thumbnailUrl);

  return res
    .status(200)
    .json(new ApiResponse(200, "video Deleted Successfully"));
});

export { publishVideo, videoById, updateVideo, deleteVideo };
