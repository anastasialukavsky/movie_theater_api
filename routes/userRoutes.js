const router = require('express').Router();
const User = require('../models/User');
const { Show } = require('../models/index');
const { check, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();

    if (!users) res.status(404).send({ error: 'No users found' });

    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) res.status(404).send({ error: `User with ID ${id} not found` });

    res.status(200).json(user);
  } catch (e) {
    res.status(500).send('Internal Server Error');
    console.error(e);
  }
});

router.get('/:id/movies', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user || user === null)
      res.status(404).send({ error: `Cannot find user with ID ${id}` });

    const movies = await user.getShows();
    res.status(200).json(movies);
  } catch (e) {
    res.status(500).send('Internal Server Error');
    console.error(e);
  }
});

router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    if (!newUser) res.status(400).send({ error: 'Cannot create user' });

    res.status(201).json(newUser);
  } catch (e) {
    res.status(500).send('Internal Server Error');
    console.error(e);
  }
});

router.put('/:id/shows', async (req, res) => {
  try {
    const { id } = req.params;
    const { showId } = req.body;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ error: `User with ID ${id} not found` });

    const show = await Show.findByPk(showId);
    if (!show)
      return res
        .status(404)
        .json({ error: `Show with ID ${showId} not found` });

    await user.addShow(show);

    res.status(200).json({ message: 'Show added to user watched list' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user)
      res.status(404).send({ error: `Cannot find user with ID ${id}` });
    const updatedUser = await user.update(req.body);

    res.status(200).json(updatedUser);
  } catch (e) {
    res.status(500).send('Internal Server Error');
    console.error(e);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (user === null || !user)
      res.status(404).send({ error: `User with ID ${id} not found` });
    await user.destroy();

    res.sendStatus(204);
  } catch (e) {
    res.status(500).send('Internal Server Error');
    console.error(e);
  }
});
module.exports = router;
