const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'user',
    // defaultScope: {
    //   where: {
    //     disabled: false,
    //   },
    // },
    scopes: {
      admin: {
        where: {
          admin: true,
        },
      },
      disabled: {
        where: {
          disabled: true,
        },
      },
      name(value) {
        return {
          where: {
            name: {
              [Op.iLike]: value,
            },
          },
        };
      },
    },
  }
);

module.exports = User;
