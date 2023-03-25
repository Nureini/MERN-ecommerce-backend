const express = require("express");
const basketControllers = require("../controllers/basketControllers.js");
const verifyJWT = require("../middleware/verifyJWT.js");

const router = express.Router();

router
  .route("/")
  .get(basketControllers.getBasketItems)
  .post(verifyJWT, basketControllers.createNewBasket)
  .delete(verifyJWT, basketControllers.deleteBasket);

router.route("/add").patch(basketControllers.addNewBasketItem);

router.route("/remove").patch(basketControllers.removeBasketItem);

module.exports = router;
