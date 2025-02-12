const mongoose = require('mongoose');
const shortid = require('shortid');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shortId: { type: String, default: shortid.generate, unique: true },
});

module.exports = mongoose.model('User', UserSchema);