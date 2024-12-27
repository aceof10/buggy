import { Model, DataTypes } from "sequelize";
import {
  BUG_STATUS_LIST,
  PRIORITY_LIST,
  MEDIUM,
  OPEN,
} from "../constants/constants.js";

export default (sequelize) => {
  class Bug extends Model {
    static associate(models) {
      Bug.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });

      Bug.belongsToMany(models.User, {
        through: models.UserBugAssociation,
        foreignKey: "bugId",
        as: "users",
      });
    }
  }

  Bug.init(
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
          return `BUG-${this.id}`;
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...BUG_STATUS_LIST),
        allowNull: false,
        defaultValue: OPEN,
      },
      priority: {
        type: DataTypes.ENUM(...PRIORITY_LIST),
        allowNull: false,
        defaultValue: MEDIUM,
      },
    },
    {
      initialAutoIncrement: 1000,

      sequelize,
      modelName: "Bug",
      tableName: "bug",
      timestamps: true,
    }
  );

  return Bug;
};
