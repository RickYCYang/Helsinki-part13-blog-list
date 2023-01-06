const blogsRouter = require('express').Router();
const { Blog, User } = require('../models');
const { tokenExtractor, userDisabledChecker } = require('../utils/middleware');
const { Op } = require('sequelize');
const { YEAR_START_END } = require('../utils/const');

const blogFinder = async (req, _res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  if (!req.blog) {
    throw Error('blog not found');
  }
  next();
};

const checkIsAuthor = async (req, res, next) => {
  const authorId = req.blog.userId;
  const loginInUserId = req.decodedToken.id;
  /** check if the note belongs to login-in user */
  if (authorId !== loginInUserId) {
    return res.status(401).json({ error: 'invalid operation: no permission' });
  }
  next();
};

const isValidYear = (year) => {
  if (year === null) return true;
  if (isNaN(year)) return false;
  if (year < YEAR_START_END.start || year > YEAR_START_END.end) return false;

  return true;
};

blogsRouter.get('/', async (req, res) => {
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.substring]: req.query.search,
        },
      },
      {
        author: {
          [Op.substring]: req.query.search,
        },
      },
    ];
  }
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    order: [['likes', 'DESC']],
    include: {
      model: User,
      attributes: ['name'],
    },
    where,
  });
  console.log(JSON.stringify(blogs, null, 2));
  res.json(blogs);
});

blogsRouter.post('/', userDisabledChecker, tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const { author, url, title, year = null } = req.body;

    if (!isValidYear(year)) {
      return res.status(400).json({ error: 'Invalid year value' });
    }

    const blog = await Blog.create({
      author,
      url,
      title,
      userId: user.id,
      year,
    });
    return res.json(blog);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

blogsRouter.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog);
});

blogsRouter.delete(
  '/:id',
  userDisabledChecker,
  blogFinder,
  tokenExtractor,
  checkIsAuthor,
  async (req, res) => {
    await req.blog.destroy();
    res.status(204).end();
  }
);

blogsRouter.put('/:id', userDisabledChecker, blogFinder, async (req, res) => {
  req.blog.likes = req.body.likes;
  await req.blog.save();
  res.json({ likes: req.blog.likes });
});

module.exports = blogsRouter;
