import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import db from "./models/index.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { initializeDefaultAdmin } from "./init/adminInit.js";

import helloRoutes from "./routes/helloRoutes.js";
import authRutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import bugRoutes from "./routes/bugRoutes.js";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

/**
 * UN-AUTHENTICATED routes. can be accessed by anyone
 * except for specific routes within /auth
 * (e.g., /auth/change-password) which require authentication.
 */
app.use("/hello", helloRoutes);
app.use("/auth", authRutes);

/**
 * ! IMPORTANT
 * AUTHENTICATED routes.
 * routes defined after `app.use(authenticate)` will need authentication to be accessed
 */
app.use(authenticate);

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/bugs", bugRoutes);

db.sequelize
  .authenticate()
  .then(async () => {
    console.log("Database connected.");
    await db.sequelize.sync();

    await initializeDefaultAdmin(); // create default admin
  })
  .catch((err) => {
    console.log("Unable to connect to the database.");
  });

export default app;
