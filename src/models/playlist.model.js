import mongoose, { Schema } from "mongoose";
const PlayListSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    video: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    madeBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const PlayList = mongoose.model("playlist", PlayListSchema);
