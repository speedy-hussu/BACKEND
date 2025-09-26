import mongoose, { Schema } from "mongoose";
const TweetSchema = new Schema(
  {
    tweetBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const Tweet = mongoose.model("tweet", TweetSchema );
