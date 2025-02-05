import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class UserBugAssociation extends Model {
    static associate(models) {
      UserBugAssociation.belongsTo(models.User, {
        foreignKey: "assignedBy",
        as: "assigner",
      });
    }
  }

  UserBugAssociation.init(
    {
      assignedBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserBugAssociation",
      tableName: "user_bug_association",
      timestamps: true,
    }
  );

  return UserBugAssociation;
};
