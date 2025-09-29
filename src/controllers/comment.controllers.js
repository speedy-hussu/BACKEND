import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "comment is required");

  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "video id needed");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?.id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "commented successfully", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "comment is required");

  const { commentId } = req.params;
  if (!commentId) throw new ApiError(400, "comment id needed");

  const comment = await Comment.findByIdAndUpdate(
    mongoose.Types.ObjectId(commentId),
    {
      $set: { content },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "commented updated", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(400, "comment id needed");

  const comment = await Comment.findByIdAndDelete(
    mongoose.Types.ObjectId(commentId)
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "commented deleted", comment));
});

export { addComment, updateComment, deleteComment };
