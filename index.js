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
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 12424;
app.listen(PORT, 'localhost', () => console.log(`Сервер запущено: http://localhost:${PORT}/API.html`));