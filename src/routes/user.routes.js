import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAdmin,
  getUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

// Define specific routes before dynamic ones
router.route("/create-user").post(createUser);
router.route("/users").get(getUser);
router.route("/:userId").get(getUserById).patch(updateUser).delete(deleteUser);
router.route("/Admin").get(getAdmin);

export default router;
