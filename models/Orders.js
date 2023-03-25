const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  orders: [
    {
      productIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      ],
      deliveryAddress: {
        type: String,
        required: true,
      },
      total: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Orders", ordersSchema);
