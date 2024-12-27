import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class UserProjectAssociation extends Model {
    static associate(models) {
      UserProjectAssociation.belongsTo(models.User, {
        foreignKey: "assignedBy",
        as: "assigner",
      });
    }
  }

  UserProjectAssociation.init(
    {
      assignedBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserProjectAssociation",
      tableName: "user_project_association",
      timestamps: true,
    }
  );

  return UserProjectAssociation;
};
