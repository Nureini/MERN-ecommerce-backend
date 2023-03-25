const express = require("express");
const paymentControllers = require("../controllers/paymentControllers.js");

const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT);

router.route("/").post(paymentControllers.createPayment);

module.exports = router;
