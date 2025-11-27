'use strict';

const Thread = require('../models/thread');

module.exports = {

  // ➤ POST thread
  createThread: async (req, res) => {
    try {
      const board = req.params.board;
      const { text, delete_password } = req.body;

      const thread = await Thread.create({
        board,
        text,
        delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: []
      });

      return res.redirect(`/b/${board}/`);
    } catch (err) {
      console.error(err);
      res.send('Server error');
    }
  },

  // ➤ GET threads (last 10, with last 3 replies)
  getThreads: async (req, res) => {
    try {
      const board = req.params.board;

      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .lean();

      const cleaned = threads.map(t => {
        delete t.delete_password;
        delete t.reported;

        t.replies = t.replies
          .slice(-3)
          .map(r => ({
            _id: r._id,
            text: r.text,
            created_on: r.created_on
          }));

        return t;
      });

      return res.json(cleaned);
    } catch (err) {
      console.error(err);
      res.send('Server error');
    }
  },

  // ➤ DELETE thread
  deleteThread: async (req, res) => {
    try {
      const { thread_id, delete_password } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('incorrect password');

      if (thread.delete_password !== delete_password)
        return res.send('incorrect password');

      await Thread.findByIdAndDelete(thread_id);
      return res.send('success');
    } catch (err) {
      console.error(err);
      res.send('incorrect password');
    }
  },

  // ➤ PUT report thread
  reportThread: async (req, res) => {
    try {
      const { thread_id } = req.body;

      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      thread.reported = true;
      await thread.save();

      return res.send('reported');
    } catch (err) {
      console.error(err);
      res.send('Server error');
    }
  }

};
