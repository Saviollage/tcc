const mongoose = require("../../database");

const QuestionSchema = new mongoose.Schema({


    createdAt: {
        type: Date,
        default: Date.now
    },

    question: {
        type: String
    },

});

//Apos definir o model Question, declara como um Schema do Mongo
const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;