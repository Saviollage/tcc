const mongoose = require("../../database");

const MomentSchema = new mongoose.Schema({
    roomId: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    momentIndex: {
        type: Number
    },

    totalAnswers: {
        type: Number,
        default: 0
    },

    /*  PONTOS DE RESPOSTA */

    excitedLevel: {
        type: Number,
        default: 0
    },
    immersedLevel: {
        type: Number,
        default: 0
    },
    controlledLevel: {
        type: Number,
        default: 0
    },
    relaxedLevel: {
        type: Number,
        default: 0
    },
    boredLevel: {
        type: Number,
        default: 0
    },
    apatheticLevel: {
        type: Number,
        default: 0
    },
    worriedLevel: {
        type: Number,
        default: 0
    },
    anxiousLevel: {
        type: Number,
        default: 0
    }
});

//Apos definir o model Moment, declara como um Schema do Mongo
const Moment = mongoose.model("Moment", MomentSchema);

module.exports = Moment;