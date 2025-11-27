'use strict';

const Thread = require('../models/threadModel');

module.exports = {
  // CREATE REPLY
  async createReply(req, res) {
    try {
      const board = req.params.board;
      const { thread_id, text, delete_password } = req.body;

      const thread = await Thread.findOne({ _id: thread_id, board });
      if (!thread) return res.send('Thread not found');

      const newReply = {
        text,
        delete_password,
        created_on: new Date(),
        reported: false
      };

      thread.replies.push(newReply);
      thread.bumped_on = new Date();

      await thread.save();
      res.json(thread);
    } catch (err) {
      console.error('Error al crear reply:', err);
      res.status(500).send('Server error');
    }
  },

  // GET THREAD WITH ALL REPLIES
  async getThreadWithReplies(req, res) {
    try {
      const board = req.params.board;
      const thread_id = req.query.thread_id;

      const thread = await Thread.findOne({ _id: thread_id, board }).lean();
      if (!thread) return res.send('Thread not found');

      const cleaned = {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.map(r => ({
          _id: r._id,
          text: r.text,
          created_on: r.created_on
        }))
      };

      res.json(cleaned);
    } catch (err) {
      console.error('Error al obtener replies:', err);
      res.status(500).send('Server error');
    }
  },

  // DELETE REPLY (soft delete)
  async deleteReply(req, res) {
    try {
      const { thread_id, reply_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send('Reply not found');

      if (reply.delete_password !== delete_password) {
        return res.send('incorrect password');
      }

      reply.text = '[deleted]';
      await thread.save();

      res.send('success');
    } catch (err) {
      console.error('Error al borrar reply:', err);
      res.status(500).send('Server error');
    }
  },

  // REPORT REPLY
  async reportReply(req, res) {
    try {
      const { thread_id, reply_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send('Reply not found');

      reply.reported = true;
      await thread.save();

      res.send('reported');
    } catch (err) {
      console.error('Error al reportar reply:', err);
      res.status(500).send('Server error');
    }
  }
};
