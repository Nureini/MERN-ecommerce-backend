const express = require("express");
const userControllers = require("../controllers/userControllers.js");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(userControllers.getAllUsers)
  .post(userControllers.createNewUser)
  .patch(verifyJWT, userControllers.updateUser)
  .delete(verifyJWT, userControllers.deleteUser);

module.exports = router;
