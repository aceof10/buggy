import express from "express";
import db from "../models/index.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { paginate } from "../utils/paginationUtil.js";

const router = express.Router();

router.get("/", authorizeRole(["admin"]), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const { count, rows: users } = await db.User.findAndCountAll(
      paginate({}, { page, limit })
    );

    res.status(200).json({
      total: count,
      page: parseInt(page, 10),
      pages: Math.ceil(count / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

router.patch("/:id/role", authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin", "developer", "tester"].includes(role)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  try {
    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully.", user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

router.delete("/:id", authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
});

export default router;
