const { DataTypes } = require('sequelize');
const { YEAR_START_END } = require('../utils/const');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER,
      len: [YEAR_START_END.start, YEAR_START_END.end],
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('blogs', 'year');
  },
};
