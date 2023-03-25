const Product = require("../models/Product.js");
const User = require("../models/User.js");
const asyncHandler = require("express-async-handler");

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().lean();

  // assigns all products with the user who posted it.
  const productsWithUser = await Promise.all(
    products.map(async (product) => {
      const user = await User.findById(product.user).lean().exec();
      return { ...product, username: user?.username };
    })
  );

  res.json(productsWithUser);
});

const createNewProduct = asyncHandler(async (req, res) => {
  const { user, name, size, price, image, description } = req.body;

  if (!user || !name || !size || !price || !image || !description) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const findUser = await User.findById(user).lean();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const duplicate = await Product.findOne({ user, name });
  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Duplicate listing name by same user!" });
  }

  const product = await Product.create({
    user,
    name,
    size,
    price,
    image,
    description,
  });

  if (product) {
    // Created
    return res.status(201).json({ message: "New product created" });
  } else {
    return res.status(400).json({ message: "Invalid  data received" });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id, user, name, size, price, image, description, sold } = req.body;

  if (
    !id ||
    !user ||
    !name ||
    !size ||
    !price ||
    !image ||
    !description ||
    typeof sold !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const findUser = await User.findById(user).lean();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const findProductToUpdate = await Product.findById(id).exec();
  if (!findProductToUpdate) {
    return res.status(400).json({ message: "Product not found" });
  }

  if (findProductToUpdate.sold === true) {
    return res.status(400).json({
      message: "This product has already been sold.",
    });
  }

  const duplicate = await Product.findOne({ user, name });
  if (duplicate && findProductToUpdate._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "Duplicate product name by same user!" });
  }

  findProductToUpdate.name = name;
  findProductToUpdate.size = size;
  findProductToUpdate.price = price;
  findProductToUpdate.image = image;
  findProductToUpdate.description = description;
  findProductToUpdate.sold = sold;

  const updateProduct = await findProductToUpdate.save();

  res.json(`'${updateProduct.name}' updated.`);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Product ID required" });
  }

  const productToDelete = await Product.findById(id).exec();
  if (!productToDelete) {
    return res.status(400).json({ message: "Product not found" });
  }

  const deleteProduct = await productToDelete.deleteOne();
  if (deleteProduct) {
    return res.json(
      `Product '${deleteProduct.name}' with ID ${deleteProduct._id} deleted`
    );
  } else {
    return res
      .status(400)
      .json({ message: "Error! Was unable to delete product!" });
  }
});

module.exports = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
