const User = require("../models/User.js");
const Product = require("../models/Product.js");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  res.json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10); // saltOrRounds

  const userObject = { username, password: hashedPassword };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    return res.status(201).json({ message: `New user ${username} created` });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, role } = req.body;

  if (!id || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const findUser = await User.findById(id).exec();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const duplicate = await User.findOne({ username });
  // allows updates to the original user
  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  findUser.username = username;

  if (password) {
    findUser.password = await bcrypt.hash(password, 10); // saltOrRounds
  }

  if (role) {
    findUser.role = role;
  }

  const updatedUser = await findUser.save();
  res.json(`User '${updatedUser.username}' with ID ${updatedUser._id} updated`);
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const product = await Product.findOne({ user: id }).lean().exec();
  if (product) {
    return res.status(400).json({ message: "User has assigned products" });
  }

  const userToDelete = await User.findById(id).exec();
  if (!userToDelete) {
    return res.status(400).json({ message: "User not found" });
  }

  const deleteUser = await userToDelete.deleteOne();
  res.json(`User '${deleteUser.username}' with ID ${deleteUser._id} deleted`);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
