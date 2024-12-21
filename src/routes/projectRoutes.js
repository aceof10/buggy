import express from "express";
import db from "../models/index.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Create a new project
 * Only admins are allowed to create projects
 */
router.post("/", authorizeRole(["admin"]), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const newProject = await db.Project.create({ name, description });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating project." });
  }
});

/**
 * Get all projects
 * Only admins can view all projects
 */
router.get("/", authorizeRole(["admin"]), async (req, res) => {
  try {
    const projects = await db.Project.findAll();

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching projects." });
  }
});

/**
 * Get a specific project by ID
 */
router.get(
  "/:id",
  authorizeRole(["admin", "developer", "tester"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const project = await db.Project.findOne({ where: { id } });
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }

      res.status(200).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching project." });
    }
  }
);

/**
 * Update a project by ID
 * Only admins can update projects
 */
router.put("/:id", authorizeRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await db.Project.findOne({ where: { id } });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await project.update({ name, description });

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating project." });
  }
});

/**
 * Delete a project by ID
 * Only admins can delete projects
 */
router.delete("/:id", authorizeRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db.Project.findOne({ where: { id } });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await project.destroy();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting project." });
  }
});

/**
 * Assign a user to a project
 * Only admins can assign users
 */
router.post("/:id/assign", authorizeRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params; // Project ID
    const { userId } = req.body;

    console.log("user id is:", userId);

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

    await db.UserProject.create({ UserId: userId, ProjectId: id });

    res.status(200).json({ message: "User assigned to project successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Remove a user from a project
 * Only admins can remove users
 */
router.delete("/:id/unassign", authorizeRole(["admin"]), async (req, res) => {
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

    const assignment = await db.UserProject.findOne({
      where: { UserId: userId, ProjectId: id },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "User is not assigned to this project." });
    }

    await assignment.destroy();

    res
      .status(200)
      .json({ message: "User removed from project successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
