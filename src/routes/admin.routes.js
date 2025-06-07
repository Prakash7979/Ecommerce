import { Router } from "express";

import {
  adminLogin,
  adminLogout,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public routes
router.route("/login").post(adminLogin); // Admin login

// Protected routes (require valid JWT)
router.use(verifyJWT);

router.route("/logout").post(adminLogout); // Admin logout

// Super Admin protected routes
router.use(isSuperAdmin);

router
  .route("/")
  .post(createAdmin) // Create new admin
  .get(getAllAdmins); // Get all admins

router
  .route("/:id")
  .get(getAdminById) // Get admin by ID
  .patch(updateAdmin) // Update admin
  .delete(deleteAdmin);

export default router;
