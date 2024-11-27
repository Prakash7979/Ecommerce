import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAdmin,
  getUser,
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

// Define specific routes before dynamic ones
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

router.route("/create-user").post(createUser);
router.route("/").get(getUser);
router.route("/:userId").get(getUserById).patch(updateUser).delete(deleteUser);
router.route("/Admin").get(getAdmin);

export default router;
