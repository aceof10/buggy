import { Model, DataTypes } from "sequelize";
import { ROLES_LIST, USER } from "../constants/constants.js";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Project, {
        through: models.UserProjectAssociation,
        foreignKey: "userId",
        as: "projects",
      });

      User.belongsToMany(models.Bug, {
        through: models.UserBugAssociation,
        foreignKey: "userId",
        as: "bugs",
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...ROLES_LIST),
        allowNull: false,
        defaultValue: USER,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "user",
      timestamps: true,
    }
  );

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};
