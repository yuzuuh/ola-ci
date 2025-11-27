'use strict';

const Thread = require('../models/thread');

// Create reply
exports.createReply = async (req, res) => {
  const { board } = req.params;
  const { text, delete_password, thread_id } = req.body;

  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const newReply = {
      text,
      delete_password,
      created_on: new Date(),
      reported: false
    };

    thread.replies.push(newReply);
    thread.bumped_on = new Date();
    await thread.save();

    // FCC requires 303
    return res.redirect(303, `/b/${board}/${thread_id}`);
  } catch {
    return res.send("thread not found");
  }
};

// Get full thread with replies
exports.getThreadWithReplies = async (req, res) => {
  const board = req.params.board;
  const thread_id = req.query.thread_id;

  let thread;
  try {
    thread = await Thread.findById(thread_id).lean();
  } catch {
    return res.send("thread not found");
  }

  if (!thread || thread.board !== board)
    return res.send("thread not found");

  const formatted = {
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

  res.json(formatted);
};

// Delete reply
exports.deleteReply = async (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  const reply = thread.replies.id(reply_id);
  if (!reply) return res.send("reply not found");

  if (reply.delete_password !== delete_password)
    return res.send("incorrect password");

  reply.text = "[deleted]";
  await thread.save();

  res.send("success");
};

// Report reply
exports.reportReply = async (req, res) => {
  const { thread_id, reply_id } = req.body;

  const thread = await Thread.findById(thread_id);
  if (!thread) return res.send("thread not found");

  const reply = thread.replies.id(reply_id);
  if (!reply) return res.send("reply not found");

  reply.reported = true;
  await thread.save();

  res.send("reported");
};
