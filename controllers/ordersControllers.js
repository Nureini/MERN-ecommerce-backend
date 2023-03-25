const asyncHandler = require("express-async-handler");
const Orders = require("../models/Orders.js");
const User = require("../models/User.js");
const Product = require("../models/Product.js");
const crypto = require("crypto");
require("dotenv").config();

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Orders.find().lean();

  res.json(orders);
});

// Only called if user has never made any orders in the past
const createOrders = asyncHandler(async (req, res) => {
  const { userId, productIds, total, deliveryAddress } = req.body;

  if (!userId || !productIds || !total || !deliveryAddress) {
    return res.status(400).json({ message: "All fields required" });
  }

  const findUser = await User.findById(userId).lean();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const findProducts = await Product.find({ _id: { $in: productIds } }).lean();
  if (findProducts.length !== productIds.length) {
    return res.status(400).json({ message: "Invalid product IDs provided" });
  }

  // if users has already created orders in the past, they shouldn't be able to create a new collection
  const ordersExist = await Orders.findOne({ user: userId }).lean();
  if (ordersExist) {
    return res
      .status(409)
      .json({ message: "Unable to create a new orders collection" });
  }

  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY_SECRET, "hex");
  const iv = Buffer.from(process.env.INITIALIZATION_VECTOR_SECRET, "hex");

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedAddress = cipher.update(deliveryAddress, "utf8", "hex");
  encryptedAddress += cipher.final("hex");

  const order = await Orders.create({
    user: userId,
    orders: [
      {
        productIds: productIds,
        deliveryAddress: encryptedAddress,
        total: total,
      },
    ],
  });

  if (order) {
    return res.status(201).json({
      message: `New Order has been created for user ${userId}`,
    });
  } else {
    return res.status(400).json({ message: "Invalid data received" });
  }
});

// if user has already made orders in the past then it will update their Orders array.
const createNewOrder = asyncHandler(async (req, res) => {
  const { userId, productIds, total, deliveryAddress } = req.body;

  if (!userId || !productIds || !total || !deliveryAddress) {
    return res.status(400).json({ message: "All fields required" });
  }

  const findUser = await User.findById(userId).lean();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const findProducts = await Product.find({ _id: { $in: productIds } }).lean();
  if (findProducts.length !== productIds.length) {
    return res.status(400).json({ message: "Invalid product IDs provided" });
  }

  // if users has never created orders in the past, they shouldn't be able to do update
  const ordersExist = await Orders.findOne({ user: userId }).lean();
  if (!ordersExist) {
    return res.status(409).json({
      message:
        "Unable to update orders collection, as you don't currently have one.",
    });
  }

  // encrypt users address
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY_SECRET, "hex");
  const iv = Buffer.from(process.env.INITIALIZATION_VECTOR_SECRET, "hex");

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedAddress = cipher.update(deliveryAddress, "utf8", "hex");
  encryptedAddress += cipher.final("hex");

  const order = await Orders.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        orders: {
          productIds: productIds,
          deliveryAddress: encryptedAddress,
          total: total,
        },
      },
    },
    { new: true }
  );

  if (order) {
    return res.status(201).json({
      message: `New Order has been created for user ${userId}`,
    });
  } else {
    return res.status(400).json({ message: "Invalid data received" });
  }
});

module.exports = { getAllOrders, createOrders, createNewOrder };
