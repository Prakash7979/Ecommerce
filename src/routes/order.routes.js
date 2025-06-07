import { Router } from "express";

import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Apply JWT verification to all order routes
router.use(verifyJWT);

// Customer routes
router
  .route("/")
  .post(createOrder) // Create new order
  .get(getUserOrders); // Get logged-in user's orders

router
  .route("/:id")
  .get(getOrderById) // Get specific order details
  .patch(cancelOrder); // Cancel order

// Admin-only routes
router.use(isAdmin);

router.route("/admin/all").get(getAllOrders); // Get all orders (admin only)

router.route("/admin/:id/status").patch(updateOrderStatus); // Update order status (admin only)

router.route("/admin/:id").delete(deleteOrder);

export default router;
