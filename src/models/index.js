import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import process from "process";
import configFile from "../config/config.js";

const basename = path.basename(new URL(import.meta.url).pathname);
const env = process.env.NODE_ENV;
const config = configFile[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
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

db.User.belongsToMany(db.Project, { through: db.UserProject });
db.Project.belongsToMany(db.User, { through: db.UserProject });
