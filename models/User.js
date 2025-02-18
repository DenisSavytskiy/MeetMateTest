//User.js
const mongoose = require('mongoose');
const shortid = require('shortid');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shortId: { type: String, default: shortid.generate, unique: true },
  avatar: { data: Buffer, contentType: String }
});

module.exports = mongoose.model('User', UserSchema);
