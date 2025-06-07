import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductImages,
  removeProductImage,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);

// Admin protected routes
router.use(verifyJWT, (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
});

router
  .route("/")
  .post(upload.fields([{ name: "images", maxCount: 5 }]), createProduct);

router.route("/:id").patch(updateProduct).delete(deleteProduct);

router
  .route("/:id/images")
  .patch(upload.fields([{ name: "images", maxCount: 5 }]), updateProductImages)
  .delete(removeProductImage);

export default router;
