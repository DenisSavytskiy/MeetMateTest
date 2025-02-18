//auth.js
require('dotenv').config();
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const upload = require('../middleware/upload');

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
    if (!(userByEmail || userByUsername)) {
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


router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(401).json({ error: 'Необхідно авторизуватися' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Користувач не знайдений' });
    }

    user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    await user.save();

    res.json({ message: 'Аватарка успішно збережена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/avatar/:username', async (req, res) => {
  try {
      const user = await User.findOne({ username: req.params.username });

      if (!user || !user.avatar) {
          return res.status(404).json({ error: 'Аватарка не знайдена' });
      }

      res.set('Content-Type', user.avatar.contentType);
      res.send(user.avatar.data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
