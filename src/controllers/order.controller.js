import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's cart
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart || cart.products.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Check product availability and calculate total
  let totalAmount = 0;
  const products = [];

  for (const item of cart.products) {
    const product = await Product.findById(item.productId._id);
    if (!product) {
      throw new ApiError(404, `Product ${item.productId.name} not found`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for product ${item.productId.name}`
      );
    }

    totalAmount += product.price * item.quantity;
    products.push({
      productId: product._id,
      quantity: item.quantity,
    });
  }

  // Create order
  const order = await Order.create({
    userId,
    products,
    totalAmount,
    orderStatus: "Pending",
  });

  // Update product stocks
  for (const item of cart.products) {
    await Product.findByIdAndUpdate(item.productId._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear the cart
  await Cart.findOneAndDelete({ userId });

  return res
    .status(201)
    .json(new ApiResponse(200, order, "Order created successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "username email")
    .populate("products.productId", "name price");
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("userId", "username email")
    .populate("products.productId", "name price images");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ userId }).populate(
    "products.productId",
    "name price images"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "User orders retrieved successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, "Valid status is required");
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: status },
    { new: true }
  )
    .populate("userId", "username email")
    .populate("products.productId", "name price");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Only allow cancellation if order is pending or processing
  if (!["Pending", "Processing"].includes(order.orderStatus)) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  // Update order status
  order.orderStatus = "Cancelled";
  await order.save();

  // Restore product stocks
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted successfully"));
});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};
