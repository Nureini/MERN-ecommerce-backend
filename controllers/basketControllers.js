const Basket = require("../models/Basket.js");
const User = require("../models/User.js");
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product.js");

const getBasketItems = asyncHandler(async (req, res) => {
  const basketItems = await Basket.find().lean();

  res.json(basketItems);
});

const createNewBasket = asyncHandler(async (req, res) => {
  const { productToAddId, user } = req.body;

  const existingBasket = await Basket.findOne({ user, active: true }).exec();
  if (existingBasket) {
    return res
      .status(400)
      .json({ message: "User already has an active basket" });
  }

  const validateProductToAddId = await Product.findById(productToAddId).lean();
  if (!validateProductToAddId) {
    return res.status(400).json({
      message:
        "Error! Product you are trying to purchase is no longer available or doesn't exist!",
    });
  }

  if (validateProductToAddId.user.toString() === user) {
    return res.status(400).json({
      message: "You cannot purchase your own product",
    });
  }

  if (!user) {
    return res.status(400).json({
      message: "Error! Please try again!",
    });
  }

  if (validateProductToAddId.sold === true) {
    return res.status(400).json({
      message: "Error! Product no longer in stock!",
    });
  }

  const findUser = await User.findById(user).lean();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const basket = await Basket.create({
    user,
    basketItems: productToAddId,
  });

  if (basket) {
    // Created
    return res.status(201).json({
      message:
        "New Basket Created and item has succesfully been added to basket",
    });
  } else {
    return res.status(400).json({ message: "Invalid  data received" });
  }
});

const addNewBasketItem = asyncHandler(async (req, res) => {
  const {
    id, // id of active basket
    productToAddId,
    user,
  } = req.body;

  //   Check Basket Model, if basketItem is empty of that user then create new addBasketItem
  if (!id || !productToAddId || !user) {
    return res.status(400).json({
      message: "Error! Please try again!",
    });
  }

  const validateProductToAddId = await Product.findById(productToAddId).lean();
  if (!validateProductToAddId) {
    return res.status(400).json({
      message:
        "Error! Product you are trying to purchase is no longer available or doesn't exist!",
    });
  }

  if (validateProductToAddId.user.toString() === user) {
    return res.status(400).json({
      message: "You cannot purchase your own product",
    });
  }

  if (validateProductToAddId.sold === true) {
    return res.status(400).json({
      message: "Error! Product no longer in stock!",
    });
  }

  const findUser = await User.findById(user).lean();
  if (!findUser) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  const findBasketToUpdate = await Basket.findById(id).exec();
  if (!findBasketToUpdate) {
    return res.status(400).json({ message: "Basket not found" });
  }

  if (!findBasketToUpdate.active) {
    return res.status(400).json({ message: "Basket is not active" });
  }

  const duplicate = findBasketToUpdate.basketItems.find(
    (item) => item.toString() === productToAddId
  );

  if (duplicate) {
    return res.status(400).json({ message: "Item already in basket" });
  }

  const updatingBasket = await findBasketToUpdate
    .updateOne({
      $push: {
        basketItems: productToAddId,
      },
    })
    .exec();

  if (updatingBasket) {
    return res.json(
      `Basket with ID'${findBasketToUpdate._id}' has been updated.`
    );
  } else {
    return res.status(400).json({ message: "Invalid  data received" });
  }
});

const removeBasketItem = asyncHandler(async (req, res) => {
  const { id, productToAddId } = req.body;

  if (!id || !productToAddId) {
    return res.status(400).json({
      message: "Error! Please try again!",
    });
  }

  const findBasketToUpdate = await Basket.findById(id).exec();
  if (!findBasketToUpdate) {
    return res.status(400).json({ message: "Basket not found" });
  }

  const updatedBasket = await findBasketToUpdate
    .updateOne({
      $pull: {
        basketItems: productToAddId,
      },
    })
    .exec();

  if (updatedBasket) {
    return res
      .status(200)
      .json({ message: "Basket item removed successfully" });
  } else {
    return res.status(400).json({ message: "Basket item removal failed" });
  }
});

const deleteBasket = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "Error! No basket ID was provided!",
    });
  }

  const basketToDelete = await Basket.findById(id).exec();
  if (!basketToDelete) {
    return res
      .status(400)
      .json({ message: "Basket not found, ID provided was Invalid!" });
  }

  const deleteBasket = basketToDelete.deleteOne();
  if (deleteBasket) {
    return res.json(`Basket with ID ${deleteBasket._id} deleted`);
  } else {
    return res
      .status(400)
      .json({ message: "Error! Was unable to delete Basket!" });
  }
});

module.exports = {
  getBasketItems,
  createNewBasket,
  addNewBasketItem,
  removeBasketItem,
  deleteBasket,
};
