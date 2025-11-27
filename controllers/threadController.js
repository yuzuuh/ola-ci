'use strict';

const Thread = require('../models/thread');

module.exports = {
  // CREATE THREAD
  async createThread(req, res) {
    try {
      const board = req.params.board;
      const { text, delete_password } = req.body;

      const newThread = new Thread({
        board,
        text,
        delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: []
      });

      await newThread.save();
      res.json(newThread);
    } catch (err) {
      console.error('Error al crear thread:', err);
      res.status(500).send('Server error');
    }
  },

  // GET THREADS
  async getThreads(req, res) {
    try {
      const board = req.params.board;

      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .lean();

      const cleaned = threads.map(t => ({
        _id: t._id,
        text: t.text,
        created_on: t.created_on,
        bumped_on: t.bumped_on,
        replies: t.replies
          .slice(-3)
          .map(r => ({
            _id: r._id,
            text: r.text,
            created_on: r.created_on
          }))
      }));

      res.json(cleaned);
    } catch (err) {
      console.error('Error al obtener threads:', err);
      res.status(500).send('Server error');
    }
  },

  // DELETE THREAD
  async deleteThread(req, res) {
    try {
      const { thread_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);

      if (!thread) return res.send('Thread not found');
      if (thread.delete_password !== delete_password) return res.send('incorrect password');

      await Thread.findByIdAndDelete(thread_id);
      res.send('success');
    } catch (err) {
      console.error('Error al borrar thread:', err);
      res.status(500).send('Server error');
    }
  },

  // REPORT THREAD
  async reportThread(req, res) {
    try {
      const { thread_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      thread.reported = true;
      await thread.save();

      res.send('reported');
    } catch (err) {
      console.error('Error al reportar thread:', err);
      res.status(500).send('Server error');
    }
  }
};
