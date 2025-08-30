import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadFile } from "../utils/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

//generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens", error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get data from user
  //validate data
  //check if user already exists
  //file exixts or not
  //upload file to cloudinary
  //create user  in db
  //remove password from response and refresh tokoen from response
  // check for user creation
  // return response
  const { fullName, username, password, email } = req.body;
  if (!fullName || !username || !password || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");
  const avatar = await uploadFile(avatarLocalPath);

  const coverImage = await uploadFile(coverImageLocalPath);
  if (!avatar) throw new ApiError(500, "Error while uploading avatar");

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log(createdUser);
  if (!createdUser)
    throw new ApiError(500, "Unable to create user. Please try again later");
  console.log(fullName, username, password, email, avatar, coverImage);
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created"));
});

const loginUser = asyncHandler(async (req, res) => {
  // access and refresh token
  //send cookie
  //send response

  //data from req body
  const { username, email, password } = req.body;

  //username||email validation
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  //find user
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) throw new ApiError(404, "User not found");

  //check for password
  const isPassCorrect = await user.isPassCorrect(password);
  if (!isPassCorrect) throw new ApiError(401, "invalid credentials");

  //refresh and access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  //get user without password and refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //cookies
  const option = {
    httpOnly: true,
    secure: false,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user loggedIn succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //   req.user.refreshToken = null;
  //   await req.user.save({ validateBeforeSave: false });
  //   res
  //     .status(200)
  //     .clearCookie("accessToken")
  //     .clearCookie("refreshToken")
  //     .json(new ApiResponse(200, null, "Logged out successfully"));
  // });
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: false,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "unautorized request ");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "invalid token or user not found");

    const option = {
      httpOnly: true,
      secure: false,
    };
    if (user.refreshToken !== incomingRefreshToken)
      throw new ApiError(401, "expired token or invalid token");
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "invalid refresh token" + error.message);
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
