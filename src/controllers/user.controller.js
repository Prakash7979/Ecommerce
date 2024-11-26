import { User } from "../models/user.model.js";

const getUser = async (req, res) => {
  try {
    const result = await User.find();
    res.send({
      success: true,
      message: " User list retrived success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "failed to retrived user lists",
      data: [],
    });
  }
};

const getAdmin = async (req, res) => {
  try {
    const result = await User.find();
    res.send({
      success: true,
      message: " Admin list retrived success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "failed to retrived Admin lists",
      data: [],
    });
  }
};

const createUser = async (req, res) => {
  const userDetails = req.body;
  try {
    const result = await User.create(userDetails);
    res.send({
      success: true,
      message: "User is created success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "User is created failes",
      data: [],
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await User.findById(userId);
    res.send({
      success: true,
      message: "User is retrived success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "User is retrived failes",
      data: [],
    });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const updatedUser = req.body;
  try {
    const result = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });
    res.send({
      success: true,
      message: "User is updated success",
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "User is updated failed",
      data: result,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.send({
      success: true,
      message: "User is deleted success",
      data: null,
    });
  } catch (error) {
    res.send({
      success: true,
      message: "User is deleted failed",
      data: [],
    });
  }
};

export { getUser, createUser, getUserById, updateUser, deleteUser, getAdmin };
