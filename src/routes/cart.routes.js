import { Router } from "express";
import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply JWT verification to all cart routes
router.use(verifyJWT);

// Cart routes
router
  .route("/")
  .get(getCartByUserId) // Get user's cart
  .post(addToCart) // Add item to cart
  .delete(clearCart); // Clear entire cart

router.route("/item").patch(updateCartItem); // Update cart item quantity

router.route("/item/:productId").delete(removeFromCart);

export default router;
