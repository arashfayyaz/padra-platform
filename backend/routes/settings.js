const express = require('express');
const router = express.Router();

const { adminMiddleware } = require('../middleware/auth');

const DEFAULT_HERO_BACKGROUNDS = {
  default: {
    light: '',
    dark: '',
  },
  flight: {
    light: '',
    dark: '',
  },
  train: {
    light: '',
    dark: '',
  },
  bus: {
    light: '',
    dark: '',
  },
  hotel: {
    light: '',
    dark: '',
  },
};

let heroBackgrounds = { ...DEFAULT_HERO_BACKGROUNDS };

router.get('/hero-backgrounds', (req, res) => {
  res.json({
    success: true,
    backgrounds: heroBackgrounds,
  });
});

router.put('/hero-backgrounds', adminMiddleware, (req, res) => {
  const incoming = req.body?.backgrounds;

  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Invalid backgrounds payload',
    });
  }

  const next = {};

  for (const type of Object.keys(DEFAULT_HERO_BACKGROUNDS)) {
    next[type] = {
      light: typeof incoming[type]?.light === 'string'
        ? incoming[type].light.trim()
        : heroBackgrounds[type].light,

      dark: typeof incoming[type]?.dark === 'string'
        ? incoming[type].dark.trim()
        : heroBackgrounds[type].dark,
    };
  }

  heroBackgrounds = next;

  res.json({
    success: true,
    backgrounds: heroBackgrounds,
  });
});

module.exports = router;
