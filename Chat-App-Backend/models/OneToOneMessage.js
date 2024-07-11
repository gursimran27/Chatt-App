const mongoose = require("mongoose");

const oneToOneMessageSchema = new mongoose.Schema({
  participants: [
    //array
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      to: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      from: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: [
          "Text",
          "doc",
          "reply",
          "Link",
          "img",
          "video",
          "deleted",
          "loc",
        ],
      },
      created_at: {
        type: Date,
        default: Date.now(),
      },
      text: {
        type: String,
      },
      file: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ["Sent", "Delivered", "Seen"],
        default: "Sent",
      },
      replyToMsg: {
        type: String,
        default: null,
      },
      star: {
        type: Map,
        of: Boolean,
        default: {},
      },
      reaction: {
        type: Map,
        of: String,
        default: {},
      },
      deletedFor: {
        type: Map,
        of: Boolean,
        default: {},
      },
      deletedForEveryone: {
        //false mean that user cannat do deleteForEveryOne
        type: Boolean,
        default: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: [Number],
      },
    },
  ],
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  typing: {
    type: Map,
    of: Boolean,
    default: {},
  },
});

const OneToOneMessage = new mongoose.model(
  "OneToOneMessage",
  oneToOneMessageSchema
);
module.exports = OneToOneMessage;
