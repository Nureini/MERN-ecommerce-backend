require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const authRoutes = require("./routes/authRoutes");
const basketRoutes = require("./routes/basketRoutes.js");
const ordersRoutes = require("./routes/ordersRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions.js");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors(corsOptions));

const CONNECTION_URL =
  "mongodb+srv://admin:0wMa1uaLNZkGKhtC@cluster0.cpcknlm.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 3003;

app.use("/products", productRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/basket", basketRoutes);
app.use("/orders", ordersRoutes);
app.use("/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("APP IS RUNNING!");
});

mongoose.set("strictQuery", true);
mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((error) => {
    console.log(error.message);
  });
