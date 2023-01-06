const authorsRouter = require('express').Router();
const { Blog } = require('../models');
const { sequelize } = require('../utils/db');

authorsRouter.get('/', async (_req, res) => {
  const blogs = await Blog.findAll({
    attributes: [
      'author',
      [sequelize.fn('COUNT', sequelize.col('title')), 'articles'],
      [sequelize.fn('SUM', sequelize.col('likes')), 'likes'],
    ],
    group: ['author'],
    order: [['likes', 'DESC']],
  });
  console.log(JSON.stringify(blogs, null, 2));
  res.json(blogs);
});

module.exports = authorsRouter;
