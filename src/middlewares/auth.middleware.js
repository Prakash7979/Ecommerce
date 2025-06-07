import { ApiError } from "../utilis/ApiError.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Retrieve token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("Received Token:", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // Verify the token using ACCESS_TOKEN_SECRET
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user associated with the token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    // Attach the authenticated user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", {
      message: error.message,
      token: req.cookies?.accessToken || req.header("Authorization"),
    });

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired. Please log in again.");
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token format.");
    } else {
      throw new ApiError(401, error?.message || "Unauthorized request");
    }
  }
});
