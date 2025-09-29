import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video id is required");

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.id?.user,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, "video unliked"));
  } else {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user?.id,
    });
    return res.status(201).json(new ApiResponse(201, like, "video Liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(400, "comment id is required");

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?.id,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, "comment unliked"));
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user?.id,
    });
    return res.status(201).json(new ApiResponse(201, like, "comment liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "tweet id is required");

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?.id,
  });
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json(new ApiResponse(200, "tweet unliked"));
  } else {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user?.id,
    });
    return res.status(201).json(new ApiResponse(201, like, "tweet liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: req.user?.id },
    },
    {
      $lookup: {
        from: "videos", // collection to join
        localField: "video", // field in Like model
        foreignField: "_id", // match against _id in videos
        as: "likedVideos",
      },
    },
    {
      $unwind: "$likedVideos", // flatten the likedVideos array
    },
    {
      $replaceRoot: { newRoot: "$likedVideos" }, // return only the video object
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
