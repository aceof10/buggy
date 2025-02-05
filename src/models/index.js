import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import process from "process";
import configFile from "../config/config.js";

const basename = path.basename(new URL(import.meta.url).pathname);
const env = process.env.NODE_ENV;
const config = configFile[env];
const db = {};

let loggingOption;

if (config.logging === undefined) {
  loggingOption = true;
} else {
  loggingOption = config.logging === false ? false : console.log;
}

const sequelize = new Sequelize(
  config.database || undefined,
  config.username || undefined,
  config.password || undefined,
  {
    ...config,
    logging: loggingOption,
  }
);

const modelFiles = fs
  .readdirSync(new URL(".", import.meta.url).pathname)
  .filter((file) => {
    return (
      !file.startsWith(".") &&
      file !== basename &&
      file.endsWith(".js") &&
      !file.includes(".test.js")
    );
  });

const importModels = async () => {
  await Promise.all(
    modelFiles.map(async (file) => {
      const model = (
        await import(path.join(new URL(".", import.meta.url).pathname, file))
      ).default(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    })
  );
};

await importModels();

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
