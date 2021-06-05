const mongoose = require("../../database");

const AnswerSchema = new mongoose.Schema({

    participant: {
        type: String
    },

    roomId: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    questionId: {
        type: Number
    },

    answer: {
        type: Number
    },

    zScore: {
        type: Number
    }
});

//Apos definir o model Answer, declara como um Schema do Mongo
const Answer = mongoose.model("Answer", AnswerSchema);

module.exports = Answer;