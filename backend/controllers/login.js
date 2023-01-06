const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const loginRouter = require('express').Router();

const { SECRET } = require('../utils/config');
const User = require('../models/user');

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    where: {
      username: username,
    },
  });

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  /** check password is valid */
  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password',
    });
  }

  /** check user is disabled */
  if (user.disabled) {
    return res.status(401).json({
      error: 'account disabled, please contact admin',
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);

  req.session.user = {
    id: user.id,
    username: user.username,
    name: user.name,
  };

  res.status(200).send({
    token,
    username: user.username,
    name: user.name,
    disabled: user.disabled,
  });
});

module.exports = loginRouter;
