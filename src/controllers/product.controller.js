import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import { uploadOnCloudinary } from "../utilis/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !price || !category) {
    throw new ApiError(400, "Name, price and category are required");
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, "Category not found");
  }

  // Handle image uploads
  const images = [];
  if (req.files && req.files.images) {
    for (const file of req.files.images) {
      const result = await uploadOnCloudinary(file.path);
      if (result && result.url) {
        images.push(result.url);
      }
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock: stock || 0,
    category,
    images,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, sort, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  if (sort) {
    if (sort === "price_asc") sortOptions.price = 1;
    if (sort === "price_desc") sortOptions.price = -1;
    if (sort === "newest") sortOptions.createdAt = -1;
  }

  const products = await Product.find(filter)
    .sort(sortOptions)
    .populate("category", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products retrieved successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product retrieved successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  // Handle image uploads
  const images = [];
  if (req.files && req.files.images) {
    for (const file of req.files.images) {
      const result = await uploadOnCloudinary(file.path);
      if (result && result.url) {
        images.push(result.url);
      }
    }
  }

  const updateData = {
    name,
    description,
    price,
    stock,
    category,
  };

  if (images.length > 0) {
    updateData.images = images;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  }).populate("category", "name");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const updateProductImages = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.images) {
    throw new ApiError(400, "Image files are required");
  }

  const images = [];
  for (const file of req.files.images) {
    const result = await uploadOnCloudinary(file.path);
    if (result && result.url) {
      images.push(result.url);
    }
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $push: { images: { $each: images } },
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product images updated successfully"));
});

const removeProductImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw new ApiError(400, "Image URL is required");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { images: imageUrl },
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product image removed successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductImages,
  removeProductImage,
};
