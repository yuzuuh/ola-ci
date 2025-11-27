'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
  text: String,
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String
});

const threadSchema = new Schema({
  board: String,
  text: String,
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: [replySchema]
});

module.exports = mongoose.model('Thread', threadSchema);
