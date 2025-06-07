import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAdminTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    const accessToken = jwt.sign(
      { _id: admin._id, role: admin.role },
      process.env.ADMIN_ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { _id: admin._id },
      process.env.ADMIN_REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const { accessToken, refreshToken } = await generateAdminTokens(admin._id);

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("adminAccessToken", accessToken, options)
    .cookie("adminRefreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          admin: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "Admin logged in successfully"
      )
    );
});

const adminLogout = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1,
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
    .clearCookie("adminAccessToken", options)
    .clearCookie("adminRefreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ email });
  if (existedAdmin) {
    throw new ApiError(409, "Admin with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    role: role || "admin",
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while creating the admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin created successfully"));
});

const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, admins, "Admins retrieved successfully"));
});

const getAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin retrieved successfully"));
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { name, role, permissions } = req.body;

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name,
        role,
        permissions,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin updated successfully"));
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin deleted successfully"));
});

export {
  adminLogin,
  adminLogout,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
