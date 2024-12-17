import express from "express";
import bodyParser from "body-parser";
import db from "./models/index.js";

import helloRoutes from "./routes/helloRoutes.js";
import authRutes from "./routes/authRoutes.js";

const app = express();

app.use(bodyParser.json());

app.use("/hello", helloRoutes);
app.use("/auth", authRutes);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected.");
    return db.sequelize.sync();
  })
  .catch((err) => {
    console.log("Unable to connect to the database.");
  });

export default app;
