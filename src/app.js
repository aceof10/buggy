import express from "express";
import bodyParser from "body-parser";

import helloRoutes from "./routes/helloRoutes.js";

const app = express();

app.use(bodyParser.json());

app.use("/hello", helloRoutes);

export default app;
