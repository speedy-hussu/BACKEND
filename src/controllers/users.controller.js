import { User } from "../models/user.model.js";
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  uploadFile,
} from "../utils/index.utils.js";

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
  const { fullName, username, password } = req.body;
  console.log(fullName, username, password);
  if (!fullName || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
  if (!createdUser)
    throw new ApiError(500, "Unable to create user. Please try again later");
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created"));
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "OK Login",
  });
});
export { registerUser, loginUser };
