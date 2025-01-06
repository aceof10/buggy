import db from "../models/index.js";
import { hashPassword } from "../utils/passwordHashingUtil.js";

export const initializeDefaultAdmin = async () => {
  try {
    const userCount = await db.User.count();
    if (userCount === 0) {
      console.log("No users found. Creating default admin user...");

      const hashedPassword = await hashPassword("admin");
      await db.User.create({
        email: "admin@buggy.com",
        password: hashedPassword,
        role: "admin",
      });

      console.warn(
        'Default admin user created with email "admin@buggy.com" and password "admin"'
      );
      console.log(
        "\x1b[31m%s\x1b[0m",
        "IMPORTANT: Please update the default password immediately after login."
      );
    } else {
      console.log("Users already exist. Skipping default admin creation.");
    }
  } catch (error) {
    console.error("Error during default admin initialization:", error);
  }
};
