import express from "express";
import db from "../models/index.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
  ADMIN,
  DEVELOPER,
  TESTER,
  BUG_STATUS_LIST,
  PRIORITY_LIST,
  ROLES_AUTHORIZED_FOR_PROJECT_ASSIGNMENT,
  INTERNAL_SERVER_ERROR,
  PROJECT_NOT_FOUND,
  BUG_NOT_FOUND,
  INVALID_BUG_STATUS,
  INVALID_BUG_PRIORITY,
  USER_NOT_FOUND,
} from "../constants/constants.js";
import sanitizeInput from "../utils/sanitizeInput.js";

const router = express.Router();

/**
 * Create a bug
 */
router.post(
  "/",
  authorizeRole([ADMIN, DEVELOPER, TESTER]),
  async (req, res) => {
    try {
      let { title, description, priority, projectId } = req.body;

      title = sanitizeInput(title);
      description = sanitizeInput(description);

      if (!PRIORITY_LIST.includes(priority)) {
        return res.status(400).json({ message: INVALID_BUG_PRIORITY });
      }

      const project = await db.Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ message: PROJECT_NOT_FOUND });
      }

      const bug = await db.Bug.create({
        title,
        description,
        priority,
        projectId,
      });

      return res.status(201).json(bug);
    } catch (err) {
      return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 * Get all bugs
 */
router.get("/", authorizeRole([ADMIN, DEVELOPER, TESTER]), async (req, res) => {
  try {
    const bugs = await db.Bug.findAll();

    res.status(200).json(bugs);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Get a specific bug by id
 */
router.get(
  "/:id",
  authorizeRole([ADMIN, DEVELOPER, TESTER]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const bug = await db.Bug.findOne({ where: { id } });
      if (!bug) {
        return res.status(404).json({ message: BUG_NOT_FOUND });
      }

      res.status(200).json(bug);
    } catch (error) {
      res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 * Update a bug
 */
router.put(
  "/:id",
  authorizeRole([ADMIN, DEVELOPER, TESTER]),
  async (req, res) => {
    try {
      const { id } = req.params;
      let { title, description, status, priority, projectId } = req.body;

      title = sanitizeInput(title);
      description = sanitizeInput(description);

      if (!BUG_STATUS_LIST.includes(status)) {
        return res.status(400).json({ message: INVALID_BUG_STATUS });
      }

      if (!PRIORITY_LIST.includes(priority)) {
        return res.status(400).json({ message: INVALID_BUG_PRIORITY });
      }

      const project = await db.Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ message: PROJECT_NOT_FOUND });
      }

      const bug = await db.Bug.findByPk(id);

      if (!bug) {
        return res.status(404).json({ message: BUG_NOT_FOUND });
      }

      await bug.update({ title, description, status, priority, projectId });

      return res.status(200).json(bug);
    } catch (err) {
      return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 * Delete a bug
 * Only admins can delete a bug
 */
router.delete("/:id", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const bug = await db.Bug.findByPk(id);
    if (!bug) {
      return res.status(404).json({ message: BUG_NOT_FOUND });
    }

    await bug.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Assign a user to a bug
 * Only admins can assign a user to a bug
 */
router.post("/:id/add-user", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params; // Bug ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const bug = await db.Bug.findOne({ where: { id } });
    if (!bug) {
      return res.status(404).json({ message: BUG_NOT_FOUND });
    }

    const user = await db.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const userRole = user.role;
    if (!ROLES_AUTHORIZED_FOR_PROJECT_ASSIGNMENT.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Cannot assign this user role to a bug." });
    }

    const userBugAssociation = await db.UserBugAssociation.findOne({
      where: { userId, bugId: id },
    });

    if (userBugAssociation) {
      return res
        .status(409)
        .json({ message: "User is already assigned to this bug." });
    }

    const thisLoggedInUser = req.user.userId;
    await db.UserBugAssociation.create({
      userId,
      bugId: id,
      assignedBy: thisLoggedInUser,
    });

    res.status(200).json({ message: "User assigned to bug successfully." });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Remove a user from a bug
 * Only admins can remove user
 */
router.delete("/:id/remove-user", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params; // Bug ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const bug = await db.Bug.findOne({ where: { id } });
    if (!bug) {
      return res.status(404).json({ message: BUG_NOT_FOUND });
    }

    const user = await db.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const userBugAssociation = await db.UserBugAssociation.findOne({
      where: { userId, bugId: id },
    });

    if (!userBugAssociation) {
      return res
        .status(404)
        .json({ message: "User is not assigned to this bug." });
    }

    await userBugAssociation.destroy();

    res.status(200).json({ message: "User removed from bug successfully." });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Get users assigned to a bug
 */
router.get(
  "/:id/users",
  authorizeRole([ADMIN, DEVELOPER, TESTER]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const bug = await db.Bug.findByPk(id, {
        include: {
          model: db.User,
          as: "users",
          attributes: ["id", "email", "role"],
          through: { attributes: [] },
        },
      });

      if (!bug) {
        return res.status(404).json({ message: BUG_NOT_FOUND });
      }

      res.status(200).json(bug.users);
    } catch (error) {
      res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
  }
);

export default router;
