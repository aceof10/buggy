import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const generateStoragePath = () => {
  const baseDir = "./tests/data/database";
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-"); // Replace unsafe characters
  const fileName = `test_database_${timestamp}.sqlite`;

  // Ensure the directory structure exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Return the full path to the SQLite file
  return path.join(baseDir, fileName);
};

export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mariadb",
    logging: true,
  },
  test: {
    dialect: "sqlite",
    storage: generateStoragePath(),
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mariadb",
    logging: true,
  },
};
