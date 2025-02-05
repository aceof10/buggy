import express from "express";
import db from "../models/index.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { paginate } from "../utils/paginationUtil.js";
import {
  ADMIN,
  ROLES_LIST,
  INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND,
  INVALID_ROLE,
} from "../constants/constants.js";

const router = express.Router();

/**
 * Get users with pagination
 * Only admins can fetch all users
 */
router.get("/", authorizeRole([ADMIN]), async (req, res) => {
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
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Get user by id
 * Anyone authenticated can view a user by id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existingUser = await db.User.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    res.status(200).json(existingUser);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * USER ROLE MANAGEMENT
 * Change user's role
 * Only admins can change a user's role
 */
router.patch("/:id/role", authorizeRole([ADMIN]), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!ROLES_LIST.includes(role)) {
    return res.status(400).json({ message: INVALID_ROLE });
  }

  try {
    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    if (user.role === role) {
      return res.status(304).end(); // User already has the assigned role
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully.", user });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Delete user by id
 * Only admins can delete a user
 */
router.delete("/:id", authorizeRole([ADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    await user.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * PROJECT MANAGEMENT
 * Get projects assigned to a user
 * Only admins can get projects assigned to a user
 */
router.get("/:id/projects", authorizeRole([ADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db.User.findByPk(id, {
      include: {
        model: db.Project,
        as: "projects",
        through: { attributes: ["assignedBy", "createdAt"] },
      },
    });

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    res.status(200).json(user.projects);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * BUG MANAGEMENT
 * Get bugs assigned to a user
 * Only admins can get bugs assigned to a user
 */
router.get("/:id/bugs", authorizeRole([ADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await db.User.findByPk(id, {
      include: {
        model: db.Bug,
        as: "bugs",
        through: { attributes: ["assignedBy", "createdAt"] },
      },
    });

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    res.status(200).json(user.bugs);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

export default router;
