//auth.js
require('dotenv').config();
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Користувач із цією електронною адресою вже існує' });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Користувач із таким іменем вже існує' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, shortId: user.shortId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const userByEmail = await User.findOne({ email: identifier });
    const userByUsername = await User.findOne({ username: identifier });
    const user = userByEmail || userByUsername
    if (!user) {
      return res.status(400).json({ error: 'Недійсне ім’я користувача/email або пароль' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, shortId: user.shortId });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getUserById', async (req, res) => {
  const token = req.headers['x-access-token'];
  const { shortId } = req.query;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ shortId });

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*
router.post('/user/:username', async(req, res) => {
try{

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
module.exports = router;
