import { ApiError } from "../utilis/ApiError.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

export const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    // The verifyJWT middleware should have already attached the user to req.user
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized access: User not authenticated");
    }

    // Check if user has admin or superadmin role
    if (user.role !== "admin" && user.role !== "superadmin") {
      throw new ApiError(403, "Forbidden: Admin privileges required");
    }

    // If checks pass, proceed to the next middleware/controller
    next();
  } catch (error) {
    // Handle specific error cases
    if (error instanceof ApiError) {
      throw error; // Re-throw existing ApiError instances
    }
    throw new ApiError(500, "Admin verification failed", [error.message]);
  }
});

// Enhanced version with additional checks (optional)
export const isSuperAdmin = asyncHandler(async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized access");
    }

    if (req.user.role !== "superadmin") {
      throw new ApiError(403, "Forbidden: Superadmin privileges required");
    }

    next();
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Superadmin verification failed"
    );
  }
});
