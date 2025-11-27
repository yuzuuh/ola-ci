'use strict';

const Thread = require('../models/thread');

exports.createThread = async (req, res) => {
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

  // Required by FCC
  return res.redirect(303, `/b/${board}/`);
};

exports.getThreads = async (req, res) => {
  const board = req.params.board;

  let threads = await Thread.find({ board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .lean();

  threads = threads.map(t => ({
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

  res.json(threads);
};

exports.deleteThread = async (req, res) => {
  const { thread_id, delete_password } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("incorrect password");

  if (thread.delete_password !== delete_password)
    return res.send("incorrect password");

  await Thread.findByIdAndDelete(thread_id);
  res.send("success");
};

exports.reportThread = async (req, res) => {
  const { thread_id } = req.body;

  await Thread.findByIdAndUpdate(thread_id, { reported: true });
  res.send("reported");
};
