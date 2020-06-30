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

    /*  PONTOS DE RESPOSTA */
    
    excited: {
        type: Number
    },
    immersed: {
        type: Number
    },
    controlled: {
        type: Number
    },
    relaxed: {
        type: Number
    },
    bored: {
        type: Number
    },
    apathetic: {
        type: Number
    },
    worried: {
        type: Number
    },
    anxious: {
        type: Number
    }
});

//Apos definir o model Answer, declara como um Schema do Mongo
const Answer = mongoose.model("Answer", AnswerSchema);

module.exports = Answer;