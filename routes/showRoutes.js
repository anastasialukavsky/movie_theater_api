const router = require('express').Router();
const Show = require('../models/Show');
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
  try {
    const shows = await Show.findAll();

    if (!shows) res.status(404).send({ error: 'Shows not found' });

    res.status(200).json(shows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const show = await Show.findByPk(id);

    if (!show || show === null)
      res.status(404).send({ error: `Show with ID ${id} is not found` });

    res.status(200).json(show);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;

    const show = await Show.findByPk(id);

    if (!show) {
      return res.status(404).json({ error: `Show with ID ${id} not found` });
    }

    const users = await show.getUsers();

    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/genre/:genre', async (req, res) => {
  try {
    let { genre } = req.params;
    genre = genre.toLowerCase();

    if (genre.split(' ').length > 1) genre = genre.replace(/\s/g, '_');

    const shows = await Show.findAll({
      where: {
        genre: {
          [Op.like]: `%${genre}%`,
        },
      },
    });

    res.status(200).json(shows);
  } catch (e) {
    console.error(error);
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newShow = await Show.create(req.body);

    if (newShow === null)
      res.status(400).send({ error: 'Cannot create a show' });

    res.status(201).json(newShow);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Show.findByPk(id);
    if (!movie || movie === null)
      res.status(404).send(`Cannot find movie with ID ${id}`);

    const updatedMovie = await movie.update(req.body);
    res.status(200).json(updatedMovie);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put(
  '/:id/rating',
  [
    check('rating')
      .trim()
      .notEmpty()
      .withMessage('Rating is required')
      .isLength({ min: 1, max: 25 })
      .withMessage('Rating must be between 1 and 25 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const { rating } = req.body;

      const show = await Show.findByPk(id);
      if (!show)
        return res.status(404).json({ error: `Show with ID ${id} not found` });

      show.rating = rating;
      await show.save();

      res.status(200).json({ message: 'Show rating updated successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  }
);

router.put(
  '/:showId/availability',
  [
    check('status')
      .trim()
      .notEmpty()
      .withMessage('Status is required')
      .isLength({ min: 5, max: 25 })
      .withMessage('Status must be between 5 and 25 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { showId } = req.params;
      const { available } = req.body;

      const show = await Show.findByPk(showId);
      if (!show) {
        return res
          .status(404)
          .json({ error: `Show with ID ${showId} not found` });
      }

      show.available = available;
      await show.save();

      res
        .status(200)
        .json({ message: 'Show availability updated successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  }
);

router.put(
  '/:id/updates',
  [
    check('status')
      .trim()
      .notEmpty()
      .withMessage('Status is required')
      .isLength({ min: 5, max: 25 })
      .withMessage('Status must be between 5 and 25 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      
      const { id } = req.params;
      const show = await Show.findByPk(id);

      if (!show) {
        return res.status(404).json({ error: `Show with ID ${id} not found` });
      }

      show.status = show.status === 'canceled' ? 'on-going' : 'canceled';
      await show.save();

      res
        .status(200)
        .json({ message: 'Show status updated successfully', show });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const show = await Show.findByPk(id);
    if (show === null || !show)
      res.status(404).send({ error: `Show with ID ${id} not found` });
    await show.destroy();

    res.sendStatus(204);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
