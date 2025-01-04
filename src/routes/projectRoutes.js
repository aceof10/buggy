import express from "express";
import db from "../models/index.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
  ADMIN,
  DEVELOPER,
  TESTER,
  ROLES_AUTHORIZED_FOR_PROJECT_ASSIGNMENT,
} from "../constants/constants.js";

const router = express.Router();

/**
 * Create a new project
 * Only admins are allowed to create projects
 */
router.post("/", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const newProject = await db.Project.create({ name, description });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Get all projects
 * Only admins can view all projects
 */
router.get("/", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const projects = await db.Project.findAll();

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Get a specific project by ID
 */
router.get(
  "/:id",
  authorizeRole([ADMIN, DEVELOPER, TESTER]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const project = await db.Project.findOne({ where: { id } });
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }

      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 * Update a project by ID
 * Only admins can update projects
 */
router.put("/:id", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const project = await db.Project.findOne({ where: { id } });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await project.update({ name, description, status });

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Delete a project by ID
 * Only admins can delete projects
 */
router.delete("/:id", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db.Project.findOne({ where: { id } });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await project.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Assign a user to a project
 * Only admins can assign users
 */
router.post("/:id/add-user", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params; // Project ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const project = await db.Project.findOne({ where: { id } });
    const user = await db.User.findOne({ where: { id: userId } });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userRole = user.role;
    if (!ROLES_AUTHORIZED_FOR_PROJECT_ASSIGNMENT.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Cannot assign this user role to a project." });
    }

    const userProjectAssociation = await db.UserProjectAssociation.findOne({
      where: { userId, projectId: id },
    });

    if (userProjectAssociation) {
      return res
        .status(409)
        .json({ message: "User is already assigned to this project." });
    }

    const thisLoggedInUser = req.user.userId;
    await db.UserProjectAssociation.create({
      userId,
      projectId: id,
      assignedBy: thisLoggedInUser,
    });

    res.status(200).json({ message: "User assigned to project successfully." });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Remove a user from a project
 * Only admins can remove users
 */
router.delete("/:id/remove-user", authorizeRole([ADMIN]), async (req, res) => {
  try {
    const { id } = req.params; // Project ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const project = await db.Project.findOne({ where: { id } });
    const user = await db.User.findOne({ where: { id: userId } });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userProjectAssociation = await db.UserProjectAssociation.findOne({
      where: { userId, projectId: id },
    });

    if (!userProjectAssociation) {
      return res
        .status(404)
        .json({ message: "User is not assigned to this project." });
    }

    await userProjectAssociation.destroy();

    res
      .status(200)
      .json({ message: "User removed from project successfully." });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

/**
 * Get users assigned to a project
 */
router.get("/:id/users", authorizeRole([ADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    const project = await db.Project.findByPk(id, {
      include: {
        model: db.User,
        as: "users",
        attributes: ["id", "email", "role"],
        through: { attributes: ["assignedBy", "createdAt"] },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json(project.users);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

export default router;
