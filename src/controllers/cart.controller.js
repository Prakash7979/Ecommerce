import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const getCartByUserId = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId }).populate(
    "products.productId",
    "name price images"
  );

  if (!cart) {
    return res
      .status(200)
      .json(new ApiResponse(200, { products: [] }, "Cart is empty"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create new cart if it doesn't exist
    cart = await Cart.create({
      userId,
      products: [{ productId, quantity }],
      totalPrice: 0, // Will be calculated below
    });
  } else {
    // Check if product already exists in cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      // Update quantity if product exists
      cart.products[productIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.products.push({ productId, quantity });
    }
  }

  // Calculate total price (you might want to fetch product prices from DB)
  // For now, we'll just set a placeholder
  cart.totalPrice = cart.products.reduce((total, item) => {
    return total + (item.productId.price || 0) * item.quantity;
  }, 0);

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    "products.productId",
    "name price images"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, populatedCart, "Product added to cart"));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const productIndex = cart.products.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (productIndex === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.products[productIndex].quantity = quantity;

  // Recalculate total price
  cart.totalPrice = cart.products.reduce((total, item) => {
    return total + (item.productId.price || 0) * item.quantity;
  }, 0);

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    "products.productId",
    "name price images"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, populatedCart, "Cart updated successfully"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.products = cart.products.filter(
    (item) => item.productId.toString() !== productId
  );

  // Recalculate total price
  cart.totalPrice = cart.products.reduce((total, item) => {
    return total + (item.productId.price || 0) * item.quantity;
  }, 0);

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    "products.productId",
    "name price images"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, populatedCart, "Product removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOneAndDelete({ userId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Cart cleared successfully"));
});

export {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
