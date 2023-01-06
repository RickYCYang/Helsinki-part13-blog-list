const jwt = require('jsonwebtoken');
const { SECRET } = require('./config');
const { User } = require('../models');

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, _req, res, next) => {
  if (err.message === 'blog not found' || err.message === 'note not found') {
    res.status(404);
    res.json({ error: err.message });
  }
  next(err);
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

const userDisabledChecker = async (req, res, next) => {
  //console.log('req.session', req.session);
  if (!req.session.user) {
    return res.status(401).json({ error: 'invalid operation: no permission' });
  }

  const id = req.session.user.id;
  const user = await User.findByPk(id);
  if (user.disabled) {
    return res.status(401).json({ error: 'invalid operation: no permission' });
  }

  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userDisabledChecker,
};
