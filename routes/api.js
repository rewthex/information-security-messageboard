"use strict";

const mongoose = require("mongoose");
const { Message } = require("../models");

module.exports = function (app) {
	app
		.route("/api/threads/:board")

		.post(async (req, res) => {
			const board = req.params.board;
			const { text, delete_password } = req.body;
			const newMessage = new Message({ board, text, delete_password });
			await newMessage.save();

			return res.redirect(`/b/${board}`);
		})

		.get(async (req, res) => {
			const board = req.params.board;
			const recentMessages = await Message.aggregate([
				{ $match: { board } },
				{ $sort: { bumped_on: -1 } },
				{ $limit: 10 },
				{
					$project: {
						_id: 1,
						text: 1,
						created_on: 1,
						bumped_on: 1,
						replies: {
							$map: {
								input: { $slice: ["$replies", 3] },
								as: "reply",
								in: {
									_id: "$$reply._id",
									text: "$$reply.text",
									created_on: "$$reply.created_on",
								},
							},
						},
						replycount: { $size: "$replies" },
					},
				},
			]);

			return res.json(recentMessages);
		})
		.put(async (req, res) => {
			const _id = req.body.report_id;
			try {
				const message = await Message.findOne({ _id });
				if (message) {
					message.reported = true;
					await message.save();
					return res.send("reported");
				} else {
					return res.send("not found");
				}
			} catch (error) {
				return res.send("error");
			}
		})

		.delete(async (req, res) => {
			const board = req.params.board;
			const _id = req.body.thread_id;
			const delete_password = req.body.delete_password;
			try {
				const result = await Message.deleteOne({ _id, board, delete_password });
				if (result.deletedCount === 1) {
					return res.send("success");
				} else {
					return res.send("incorrect password");
				}
			} catch (error) {
				return res.send("error");
			}
		});
	app
		.route("/api/replies/:board")
		.get(async (req, res) => {
			const board = req.params.board;
			const _id = req.query.thread_id;
			try {
				const thread = await Message.findOne({ _id, board })
					.populate({
						path: "replies",
						select: "text created_on reported",
					})
					.select("_id text created_on bumped_on replies");
				if (!thread) {
					res.send("thread not found");
				} else {
					res.json(thread);
				}
			} catch (error) {
				res.send("error");
			}
		})
		.post(async (req, res) => {
			const board = req.params.board;
			const { thread_id, text, delete_password } = req.body;
			const reply = {
				text,
				created_on: new Date(),
				reported: false,
				delete_password,
			};
			try {
				await Message.findByIdAndUpdate(thread_id, {
					$push: { replies: reply },
					$set: { bumped_on: reply.created_on },
				});
			} catch (error) {
				return res.send("error");
			}
			return res.redirect(`/b/${board}/${thread_id}`);
		})
		.put(async (req, res) => {
			const { thread_id, reply_id } = req.body;
			try {
				const thread = await Message.findOne({ _id: thread_id });
				const reply = thread.replies.find((reply) =>
					reply._id.equals(reply_id)
				);
				reply.reported = true;
				await thread.save();
				return res.send("reported");
			} catch (error) {
				return res.send("error");
			}
		})
		.delete(async (req, res) => {
			const { thread_id, reply_id, delete_password } = req.body;
			try {
				const thread = await Message.findOne({ _id: thread_id });
				const reply = thread.replies.find((reply) =>
					reply._id.equals(reply_id)
				);
				if (delete_password == reply.delete_password) {
					reply.text = "[deleted]";
					return res.send("success");
				} else {
					return res.send("incorrect password");
				}
			} catch (error) {
				return res.send("error");
			}
		});
};
