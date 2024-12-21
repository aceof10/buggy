import { Model } from "sequelize";

export default (sequelize) => {
  class UserProjects extends Model {}

  UserProjects.init(
    {},
    {
      sequelize,
      modelName: "UserProject",
      tableName: "user_project",
      timestamps: true,
    }
  );

  return UserProjects;
};
