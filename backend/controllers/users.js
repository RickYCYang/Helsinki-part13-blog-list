const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const { User, Note, Blog, Team } = require('../models');
const { tokenExtractor, userDisabledChecker } = require('../utils/middleware');

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id);
  if (!user.admin) {
    return res.status(401).json({ error: 'operation not allowed' });
  }
  next();
};

usersRouter.get('/', async (_req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Note,
        attributes: { exclude: ['userId'] },
      },
      {
        model: Blog,
        attributes: { exclude: ['userId'] },
      },
      {
        model: Team,
        attributes: ['name', 'id'],
        through: {
          attributes: [],
        },
      },
    ],
    order: [['id']],
  });
  res.json(users);
});

usersRouter.post('/', async (req, res) => {
  try {
    const { username, name, password } = req.body;
    if (!password || password.length < 3) {
      return res.status(400).json({
        error: 'Invalid password',
      });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ username, name, passwordHash });
    res.json(user);
  } catch (error) {
    console.error(error);
    const errorMsgs = error.errors.map((err) => err.message);
    return res.status(400).json({ error: errorMsgs });
  }
});

usersRouter.get('/admin', async (_req, res) => {
  const adminUsers = await User.scope('admin').findAll({});
  res.json(adminUsers);
});

usersRouter.get('/:id', async (req, res) => {
  const where = {};

  if (req.query.read) {
    where.read = req.query.read === 'true';
  }

  const user = await User.findByPk(req.params.id, {
    include: [
      { model: Note, attributes: { exclude: ['userId'] } },
      {
        model: Note,
        as: 'marked_notes',
        attributes: { exclude: ['userId'] },
        through: {
          attributes: [],
        },
      },
      { model: Blog, attributes: { exclude: ['userId'] } },
      {
        model: Blog,
        as: 'reading_blogs',
        attributes: {
          exclude: ['userId', 'createdAt', 'updatedAt'],
        },
        through: {
          attributes: ['id', 'read'],
          where,
        },
      },
      {
        model: Team,
        attributes: ['name', 'id'],
        through: {
          attributes: [],
        },
        include: {
          model: User,
          attributes: ['name'],
        },
      },
    ],
  });
  if (!user) {
    return res.status(404).end();
  }

  let teams = undefined;
  if (req.query.teams === 'true') {
    teams = await user.getTeams({
      attributes: ['name'],
      joinTableAttributes: [],
    });
  }

  //console.log('user', user.toJSON());
  res.json({
    //id: user.id,
    //admin: user.admin,
    //disabled: user.disabled,
    //createdAt: user.createdAt,
    //updatedAt: user.updatedAt,
    //noteCount: user.notes.length,
    //blogCount: user.blogs.length,
    name: user.name,
    username: user.username,
    readings: user.reading_blogs.map((blog) => {
      //console.log('blog', blog.toJSON());
      return {
        id: blog.id,
        url: blog.url,
        title: blog.title,
        author: blog.author,
        likes: blog.likes,
        year: blog.year,
        readinglists: [
          {
            read: blog.user_reading_blogs.read,
            id: blog.user_reading_blogs.id,
          },
        ],
      };
    }),
    teams,
  });
  //res.json(user);
});

usersRouter.put(
  '/:username',
  userDisabledChecker,
  tokenExtractor,
  async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id);
    try {
      user.username = req.params.username;
      await user.save();
      res.json(user);
    } catch (err) {
      return res.status(400).json({ error });
    }
  }
);

usersRouter.patch(
  '/:username',
  userDisabledChecker,
  tokenExtractor,
  isAdmin,
  async (req, res) => {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });

    if (user) {
      user.disabled = req.body.disabled;
      await user.save();
      res.json(user);
    } else {
      res.status(404).end();
    }
  }
);

module.exports = usersRouter;
