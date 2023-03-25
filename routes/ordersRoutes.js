const express = require("express");
const ordersControllers = require("../controllers/ordersControllers.js");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(ordersControllers.getAllOrders)
  .post(verifyJWT, ordersControllers.createOrders)
  .patch(verifyJWT, ordersControllers.createNewOrder);

module.exports = router;
