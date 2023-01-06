const { PORT, SECRET } = require('./utils/config');
const { connectToDatabase, sessionStore } = require('./utils/db');
const cors = require('cors');
const session = require('express-session');
const express = require('express');
const logger = require('morgan');
require('express-async-errors');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: SECRET,
    store: sessionStore,
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    proxy: true, // if you do SSL outside of node.
  })
);

/** routers */
const notesRouter = require('./controllers/notes');
const blogsRouter = require('./controllers/blogs');
const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');
const authorsRouter = require('./controllers/authors');
const readinglistsRouter = require('./controllers/readinglists');
const logoutRouter = require('./controllers/logout');
app.use('/api/notes', notesRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/readinglists', readinglistsRouter);
app.use('/api/logout', logoutRouter);

// middleware for error handling
const middleware = require('./utils/middleware');
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
