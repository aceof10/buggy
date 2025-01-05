import express from "express";
import sanitizeInput from "../utils/sanitizeInput.js";
import db from "../models/index.js";
import { comparePassword, hashPassword } from "../utils/passwordHashingUtil.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtil.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  INTERNAL_SERVER_ERROR,
  INVALID_CREDENTIALS,
} from "../constants/constants.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  let { email, password } = req.body;

  try {
    email = sanitizeInput(email);

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(200).json({ message: "Email already taken." });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ user: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    email = sanitizeInput(email);

    const existingUser = await db.User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(401).json({ message: INVALID_CREDENTIALS });
    }

    const isPasswordMatch = await comparePassword(
      password,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ message: INVALID_CREDENTIALS });
    }

    const accessToken = generateAccessToken(existingUser.id, existingUser.role);
    const refreshToken = generateRefreshToken(existingUser.id);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // valid for 30 days
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/change-password", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    const existingUser = await db.User.findByPk(userId);
    if (!existingUser) {
      return res.status(401).json({ message: INVALID_CREDENTIALS });
    }

    const isPasswordMatch = await comparePassword(
      oldPassword,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect old password." });
    }

    const hashedPassword = await hashPassword(newPassword);
    await existingUser.update({ password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No session found. Please log in to continue." });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const userInDb = await db.User.findByPk(decoded.userId);
    if (!userInDb) {
      return res.status(401).json({ message: INVALID_CREDENTIALS });
    }

    const accessToken = generateAccessToken(userInDb.id, userInDb.role);
    res.status(200).json({ accessToken });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || INTERNAL_SERVER_ERROR });
  }
});

export default router;
