const readinglistsRouter = require('express').Router();
const { tokenExtractor, userDisabledChecker } = require('../utils/middleware');
const { Blog, User, UserReadingBlogs } = require('../models');

readinglistsRouter.post(
  '/',
  userDisabledChecker,
  tokenExtractor,
  async (req, res) => {
    const { blogId } = req.body;
    if (!blogId)
      return res
        .status(401)
        .json({ error: 'invalid operation: no permission' });

    try {
      const user = await User.findByPk(req.decodedToken.id);
      const blog = await Blog.findByPk(blogId);
      const readingBlog = await UserReadingBlogs.create({
        userId: user.id,
        blogId: blog.id,
      });
      res.json({
        blogId: readingBlog.blogId,
        userId: readingBlog.userId,
      });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
);

readinglistsRouter.put(
  '/:id',
  userDisabledChecker,
  tokenExtractor,
  async (req, res) => {
    try {
      const readingBlog = await UserReadingBlogs.findOne({
        where: {
          user_id: req.decodedToken.id,
          blog_id: req.params.id,
        },
      });

      if (!readingBlog)
        return res
          .status(401)
          .json({ error: 'invalid operation: no permission' });

      const { read } = req.body;

      readingBlog.read = read === true;
      await readingBlog.save();
      res.json(readingBlog);
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
);

module.exports = readinglistsRouter;
