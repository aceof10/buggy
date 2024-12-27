import { Model } from "sequelize";

export default (sequelize) => {
  class UserBugAssociations extends Model {}

  UserBugAssociations.init(
    {},
    {
      sequelize,
      modelName: "UserBugAssociations",
      tableName: "user_bug_associations",
      timestamps: true,
    }
  );

  return UserBugAssociations;
};
