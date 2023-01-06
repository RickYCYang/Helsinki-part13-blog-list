const logoutRouter = require('express').Router();

logoutRouter.delete('/', async (req, res) => {
  req.session.destroy(() => {
    console.log(req.session);
    return res.sendStatus(200);
  });
});

module.exports = logoutRouter;
