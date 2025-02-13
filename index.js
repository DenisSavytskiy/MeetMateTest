//index.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const path = require('path');
const exp = require('constants');

const app = express();

connectDB();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'API.html'));
});

const PORT = process.env.PORT || 12424;
const HOST = process.env.HOST || '0.0.0.0'
app.listen(PORT, HOST, () => console.log(`Сервер запущено: http://${HOST}:${PORT}/API.html`));
