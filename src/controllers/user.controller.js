import { User } from "../models/user.model.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import { uploadOnCloudinary } from "../utilis/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m", // Short-lived token
      }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d", // Long-lived token
      }
    );

    // const accessToken = user.generateAccessToken();
    // const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // if (!avatar) {
  //   throw new ApiError(400, "Avatar file is required");
  // }

  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Error while uploading avatar to Cloudinary");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // if (!avatar.url) {
  //   throw new ApiError(400, "Error while uploading on avatar");
  // }

  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Error while uploading avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const getUser = async (req, res) => {
  try {
    const result = await User.find();
    res.send({
      success: true,
      message: " User list retrived success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "failed to retrived user lists",
      data: [],
    });
  }
};

const getAdmin = async (req, res) => {
  try {
    const result = await User.find();
    res.send({
      success: true,
      message: " Admin list retrived success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "failed to retrived Admin lists",
      data: [],
    });
  }
};

const createUser = async (req, res) => {
  const userDetails = req.body;
  try {
    const result = await User.create(userDetails);
    res.send({
      success: true,
      message: "User is created success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "User is created failes",
      data: [],
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await User.findById(userId);
    res.send({
      success: true,
      message: "User is retrived success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "User is retrived failes",
      data: [],
    });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const updatedUser = req.body;
  try {
    const result = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });
    res.send({
      success: true,
      message: "User is updated success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "User is updated failed",
      data: null,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.send({
      success: true,
      message: "User is deleted success",
      data: null,
    });
  } catch (error) {
    res.send({
      success: true,
      message: "User is deleted failed",
      data: [],
    });
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  updateUserAvatar,
  getUser,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAdmin,
};
