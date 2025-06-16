const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    ],
    don_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Don",
      required: true
    },
    envoye_par: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recu_par: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dernierMessage: {
      contenu: String,
      envoye_par: mongoose.Schema.Types.ObjectId,
      envoye_le: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);