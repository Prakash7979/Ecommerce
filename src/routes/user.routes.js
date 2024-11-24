import { Router } from "express";
import {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/user.controller.js";

const router = Router();

// Define specific routes before dynamic ones
router.route("/create-todo").post(createTodo);
router.route("/todos").get(getTodos);
router.route("/:todoId").get(getTodoById).patch(updateTodo).delete(deleteTodo);

export default router;
