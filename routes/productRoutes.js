const express = require("express");
const productControllers = require("../controllers/productControllers.js");

const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(productControllers.getAllProducts)
  .post(verifyJWT, productControllers.createNewProduct)
  .patch(verifyJWT, productControllers.updateProduct)
  .delete(verifyJWT, productControllers.deleteProduct);

module.exports = router;
