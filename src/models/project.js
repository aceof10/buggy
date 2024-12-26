import { Model, DataTypes } from "sequelize";
import { OPEN, PROJECT_STATUS_LIST } from "../constants/constants.js";

export default (sequelize) => {
  class Project extends Model {}

  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      displayId: {
        type: DataTypes.VIRTUAL,
        get() {
          return `PRJ-${this.id}`;
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...PROJECT_STATUS_LIST),
        allowNull: false,
        defaultValue: OPEN,
      },
    },
    {
      initialAutoIncrement: 1000,

      sequelize,
      modelName: "Project",
      tableName: "project",
      timestamps: true,
    }
  );

  return Project;
};
