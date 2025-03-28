const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/db");
const app = express();
const userRoutes = require("./Routes/userRoutes");

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/users", userRoutes);

module.exports = app;
