const mongoose = require("mongoose");

const basketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  basketItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
  ],
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
});

module.exports = mongoose.model("Basket", basketSchema);
