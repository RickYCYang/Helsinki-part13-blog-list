const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db');

class Note extends Model {}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    important: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
    },
    /** it's not necessary but ok to define the association in class level */
    // userId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: { model: 'users', key: 'id' },
    // }
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'note',
  }
);

module.exports = Note;
