import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import db from "./models/index.js";
import { authenticate } from "./middleware/authMiddleware.js";

import helloRoutes from "./routes/helloRoutes.js";
import authRutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/hello", helloRoutes);
app.use("/auth", authRutes);

app.use(authenticate); // Apply authentication middleware to protect all routes defined below
app.use("/users", userRoutes);

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
