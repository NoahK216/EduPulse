import express from "express";
import { z } from "zod";

import { prisma } from "./prisma.js";
import { Prisma } from "../../prisma/generated/client.js";

const UserRoleSchema = z.enum(["trainee", "trainer", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

function parseUserId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export function createUserRouter() {
  const router = express.Router();

  // Create or get user (for login/signup)
  router.post("/login", async (req, res) => {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate role if provided
    const validRole =
      role && UserRoleSchema.safeParse(role).success ? role : "trainee";

    try {
      // Try to find existing user
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true },
      });

      if (existingUser) {
        return res.json({ user: existingUser });
      }

      // Create new user with role
      const createdUser = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          role: validRole,
        },
        select: { id: true, email: true, name: true, role: true },
      });

      res.json({ user: createdUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Create user (explicit creation for admins)
  router.post("/", async (req, res) => {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate role
    const validation = UserRoleSchema.safeParse(role);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be: trainee, trainer, or admin" });
    }

    try {
      const createdUser = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          role: validation.data,
        },
        select: { id: true, email: true, name: true, role: true },
      });

      res.json({ user: createdUser });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Get user by ID
  router.get("/:userId", async (req, res) => {
    const parsedUserId = parseUserId(req.params.userId);
    if (!parsedUserId) {
      return res.status(400).json({ error: "userId must be an integer" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: parsedUserId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          created_at: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // List all users (admin only)
  router.get("/", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          created_at: true,
        },
      });

      res.json({ users });
    } catch (error) {
      console.error("List users error:", error);
      res.status(500).json({ error: "Failed to list users" });
    }
  });

  // Update user role
  router.put("/:userId/role", async (req, res) => {
    const { role } = req.body;
    const parsedUserId = parseUserId(req.params.userId);
    if (!parsedUserId) {
      return res.status(400).json({ error: "userId must be an integer" });
    }

    const validation = UserRoleSchema.safeParse(role);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be: trainee, trainer, or admin" });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: parsedUserId },
        data: { role: validation.data, updated_at: new Date() },
        select: { id: true, email: true, name: true, role: true },
      });

      res.json({ user: updatedUser });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Update role error:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  return router;
}
