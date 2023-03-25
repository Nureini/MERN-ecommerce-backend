require("dotenv").config();
const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_TEST_KEY);

const createPayment = asyncHandler(async (req, res) => {
  const { total } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total, // subunits of the currency
    currency: "gbp",
  });

  res.status(201).send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = {
  createPayment,
};
