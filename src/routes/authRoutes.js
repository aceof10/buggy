import express from "express";
import sanitizeInput from "../utils/sanitizeInput.js";
import db from "../models/index.js";
import { hashPassword } from "../utils/passwordHashingUtil.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  let { email, password } = req.body;

  try {
    email = sanitizeInput(email);

    const existingUser = await db.User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already taken" });
    }

    let hashedPassword = await hashPassword(password);
    let user = await db.User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ user: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

export default router;
