import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    //get token from cookie or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    //check if token exists
    if (!token) throw new ApiError("401", "Unauthorized request ");

    //verify token
    const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //get user from token
    const user = await User.findById(decodedInfo?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError("401", "Invalid token or user not found");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized request " + error.message);
  }
});
