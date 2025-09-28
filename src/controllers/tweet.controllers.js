import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) throw new ApiError(400, "Tweet content is required");

  const tweet = await Tweet.create({
    tweetBy: req.user?.id,
    content: content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet uploaded succesfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: { tweetBy: new mongoose.Types.ObjectId(userId) },
    },
    {
      $project: { content: 1, createdAt: 1 },
    },
    { $sort: { createdAt: -1 } }, // newest first
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tweets,
        `Tweets for user ${userId} fetched successfully`
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params; // should be tweetId not tweetUrl
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "No changes provided for the tweet");
  }

  const tweetInstance = await Tweet.findById(tweetId);
  if (!tweetInstance) {
    throw new ApiError(404, "Tweet not found");
  }

  // Authorization check (only tweet owner can update)
  if (tweetInstance.tweetBy.toString() !== req.user.id.toString()) {
    throw new ApiError(403, "Unauthorized: you can't update this tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content: content } },
    { new: true } // return updated doc
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //get tweet id
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "tweet id is required");

  //find tweet from db
  const tweetInstance = await Tweet.findById(tweetId);
  if (!tweetInstance) {
    throw new ApiError(404, "Tweet not found");
  }

  // Authorization check (only tweet owner can update)
  if (tweetInstance.tweetBy.toString() !== req.user.id.toString()) {
    throw new ApiError(403, "Unauthorized: you can't update this tweet");
  }
  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, "tweet deleted Succesfully"));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
