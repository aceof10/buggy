const express = require("express");
const bodyParser = require("body-parser");

const helloRoutes = require("./routes/helloRoutes");

const app = express();

app.use(bodyParser.json());

app.use("/hello", helloRoutes);

module.exports = app;
