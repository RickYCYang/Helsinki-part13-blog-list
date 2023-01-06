const notesRouter = require('express').Router();
const { Note, User } = require('../models');
const { tokenExtractor, userDisabledChecker } = require('../utils/middleware');
const { Op } = require('sequelize');

const noteFinder = async (req, _res, next) => {
  req.note = await Note.findByPk(req.params.id);
  if (!req.note) {
    throw Error('note not found');
  }
  next();
};

const checkIsAuthor = async (req, res, next) => {
  const authorId = req.note.userId;
  const loginInUserId = req.decodedToken.id;
  /** check if the note belongs to login-in user */
  if (authorId !== loginInUserId) {
    return res.status(401).json({ error: 'invalid operation: no permission' });
  }
  next();
};

notesRouter.get('/', async (req, res) => {
  /** method 1: query by SQL */
  // const notes = await sequelize.query('SELECT * FROM notes', {
  //   type: QueryTypes.SELECT,
  // });

  /** method 2: query by orm */
  //const notes = await Note.findAll();

  // let important = {
  //   [Op.in]: [true, false]
  // }

  const where = {};

  if (req.query.important) {
    //important = req.query.important === "true"
    where.important = req.query.important === 'true';
  }

  if (req.query.search) {
    where.content = {
      [Op.substring]: req.query.search,
    };
  }

  const notes = await Note.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name'],
    },
    where,
    // where: {
    //   important,
    //   content: {
    //     [Op.substring]: req.query.search ? req.query.search : '',
    //   },
    // },
  });

  console.log(JSON.stringify(notes, null, 2));

  res.json(notes);
});

notesRouter.post('/', userDisabledChecker, tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    /** insert a note by build */
    // create a note without saving it yet
    // const note = Note.build({ ...req.body, date: new Date() })
    // // put the user id in the userId property of the created note
    // note.userId = user.id
    // // store the note object in the database
    // await note.save()

    /** insert a note by create */
    const { content, important } = req.body;
    const note = await Note.create({
      content,
      important,
      userId: user.id,
      date: new Date(),
    });
    res.json(note);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

notesRouter.get('/:id', noteFinder, async (req, res) => {
  res.json(req.note);
});

notesRouter.delete(
  '/:id',
  userDisabledChecker,
  noteFinder,
  tokenExtractor,
  checkIsAuthor,
  async (req, res) => {
    await req.note.destroy();
    res.status(204).end();
  }
);

notesRouter.put('/:id', userDisabledChecker, noteFinder, async (req, res) => {
  req.note.important = req.body.important;
  await req.note.save();
  res.json(req.note);
});

module.exports = notesRouter;
