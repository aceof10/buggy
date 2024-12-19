import express from "express";
import sanitizeInput from "../utils/sanitizeInput.js";
import db from "../models/index.js";
import { comparePassword, hashPassword } from "../utils/passwordHashingUtil.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtUtil.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  let { email, password } = req.body;

  try {
    email = sanitizeInput(email);

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already taken." });
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

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    email = sanitizeInput(email);

    const existingUser = await db.User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isPasswordMatch = await comparePassword(
      password,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const accessToken = generateAccessToken(existingUser.id, existingUser.role);
    const refreshToken = generateRefreshToken(existingUser.id);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // valid for 30 days
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

router.post("/change-password", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    const existingUser = await db.User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordMatch = await comparePassword(
      oldPassword,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    const hashedPassword = await hashPassword(newPassword);
    await existingUser.update({ password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded.userId);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Internal Server Error." });
  }
});

export default router;
