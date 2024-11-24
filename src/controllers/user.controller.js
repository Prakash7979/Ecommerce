import { User } from "../models/user.model";

const getTodos = async (req, res) => {
  try {
    const result = await User.find();
    res.send({
      success: true,
      message: " todo list retrived success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "failed to retrived todo lists",
      data: [],
    });
  }
};

const createTodo = async (req, res) => {
  const todoDetails = req.body;
  try {
    const result = await User.create(todoDetails);
    res.send({
      success: true,
      message: "todo is created success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "todo is created failes",
      data: [],
    });
  }
};

const getTodoById = async (req, res) => {
  const todoId = req.params.todoId;
  try {
    const result = await User.findById(todoId);
    res.send({
      success: true,
      message: "todo is retrived success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "todo is retrived failes",
      data: [],
    });
  }
};

const updateTodo = async (req, res) => {
  const todoId = req.params.todoId;
  const updatedTodo = req.body;
  try {
    const result = await User.findByIdAndUpdate(todoId, updatedTodo, {
      new: true,
    });
    res.send({
      success: true,
      message: "todo is updated success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "todo is updated failed",
      data: result,
    });
  }
};

const deleteTodo = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.todoId);
    res.send({
      success: true,
      message: "todo is deleted success",
      data: null,
    });
  } catch (error) {
    res.send({
      success: true,
      message: "todo is deleted failed",
      data: [],
    });
  }
};

export { getTodos, createTodo, getTodoById, updateTodo, deleteTodo };

// import { asyncHandler } from "../utilis/asyncHandler.js";
// import { Todo } from "../models/todoModel.js";

// // Get all todos
// const getTodos = asyncHandler(async (req, res) => {
//   const todos = await Todo.find();
//   res.status(200).send({
//     success: true,
//     message: "Todo list retrieved successfully",
//     data: todos,
//   });
// });

// // Create a new todo
// const createTodo = asyncHandler(async (req, res) => {
//   const todoDetails = req.body;
//   const newTodo = await Todo.create(todoDetails);
//   res.status(201).send({
//     success: true,
//     message: "Todo created successfully",
//     data: newTodo,
//   });
// });

// // Get a specific todo by ID
// const getTodoById = asyncHandler(async (req, res) => {
//   const { todoId } = req.params;
//   const todo = await Todo.findById(todoId);
//   if (!todo) {
//     return res.status(404).send({
//       success: false,
//       message: "Todo not found",
//       data: null,
//     });
//   }
//   res.status(200).send({
//     success: true,
//     message: "Todo retrieved successfully",
//     data: todo,
//   });
// });

// // Update a specific todo by ID
// const updateTodo = asyncHandler(async (req, res) => {
//   const { todoId } = req.params;
//   const updatedData = req.body;
//   const todo = await Todo.findByIdAndUpdate(todoId, updatedData, { new: true });
//   if (!todo) {
//     return res.status(404).send({
//       success: false,
//       message: "Todo not found",
//       data: null,
//     });
//   }
//   res.status(200).send({
//     success: true,
//     message: "Todo updated successfully",
//     data: todo,
//   });
// });

// // Delete a specific todo by ID
// const deleteTodo = asyncHandler(async (req, res) => {
//   const { todoId } = req.params;
//   const todo = await Todo.findByIdAndDelete(todoId);
//   if (!todo) {
//     return res.status(404).send({
//       success: false,
//       message: "Todo not found",
//       data: null,
//     });
//   }
//   res.status(200).send({
//     success: true,
//     message: "Todo deleted successfully",
//     data: null,
//   });
// });

// export { getTodos, createTodo, getTodoById, updateTodo, deleteTodo };
