const Note = require('./note');
const Blog = require('./blog');
const User = require('./user');
const Team = require('./team');
const Membership = require('./membership');
const UserNotes = require('./user_notes');
const UserReadingBlogs = require('./user_reading_blogs');

/** define the associations */
Note.belongsTo(User);
User.hasMany(Note);

Blog.belongsTo(User);
User.hasMany(Blog);

User.belongsToMany(Team, { through: Membership });
Team.belongsToMany(User, { through: Membership });

User.belongsToMany(Note, { through: UserNotes, as: 'marked_notes' });
Note.belongsToMany(User, { through: UserNotes, as: 'users_marked' });

User.belongsToMany(Blog, {
  through: UserReadingBlogs,
  as: 'reading_blogs',
});
Blog.belongsToMany(User, { through: UserReadingBlogs, as: 'users_reading' });

/**
 * since we have migration files (/backend/migrations/*.js),
 * we don't need to sync table schema from code,
 * otherwise the migrations will fail.
 */
// Note.sync({ alter: true });
// Blog.sync({ alter: true });
// User.sync({ alter: true });

module.exports = {
  Note,
  Blog,
  User,
  Team,
  Membership,
  UserNotes,
  UserReadingBlogs,
};
