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
  updateUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/create-user").post(createUser);
router.route("/").get(getUser);
router.route("/:userId").get(getUserById).patch(updateUser).delete(deleteUser);
router.route("/Admin").get(getAdmin);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// router
//   .route("/cover-image")
//   .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
