'use strict';

const Thread = require('../models/thread');

module.exports = {

  // ➤ POST reply
  createReply: async (req, res) => {
    try {
      const board = req.params.board;
      const { thread_id, text, delete_password } = req.body;

      const reply = {
        text,
        delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false
      };

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.status(404).send('Thread not found');

      thread.replies.push(reply);
      thread.bumped_on = new Date();
      await thread.save();

      res.json(thread);
    } catch (err) {
      res.status(500).send('Server error');
    }
  },

  // ➤ GET thread with ALL replies
  getThreadWithReplies: async (req, res) => {
    try {
      const { thread_id } = req.query;

      const thread = await Thread.findById(thread_id).lean();
      if (!thread) return res.send('Thread not found');

      delete thread.delete_password;
      delete thread.reported;

      thread.replies = thread.replies.map(r => ({
        _id: r._id,
        text: r.text,
        created_on: r.created_on,
        bumped_on: r.bumped_on
      }));

      res.json(thread);
    } catch (err) {
      res.send('Server error');
    }
  },

  // ➤ DELETE reply
  deleteReply: async (req, res) => {
    try {
      const { thread_id, reply_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('incorrect password');

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send('incorrect password');

      if (reply.delete_password !== delete_password)
        return res.send('incorrect password');

      reply.text = '[deleted]';
      await thread.save();

      res.send('success');
    } catch (err) {
      res.send('incorrect password');
    }
  },

  // ➤ PUT report reply
  reportReply: async (req, res) => {
    try {
      const { thread_id, reply_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send('Thread not found');

      reply.reported = true;
      await thread.save();

      res.send('reported');
    } catch (err) {
      res.send('Server error');
    }
  }

};
