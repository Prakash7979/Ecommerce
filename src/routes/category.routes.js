import { Router } from "express";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllCategories); // Get all categories

router.route("/:id").get(getCategoryById); // Get specific category

// Admin-protected routes
router.use(verifyJWT, isAdmin);

router.route("/").post(createCategory); // Create new category

router
  .route("/:id")
  .patch(updateCategory) // Update category
  .delete(deleteCategory); // Delete category

export default router;
