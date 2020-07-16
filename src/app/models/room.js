const mongoose = require("../../database");

//O roomSchema contem os campos do nosso banco na table Rooms

const RoomSchema = new mongoose.Schema({

    active: {
        type: Boolean,
        default: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },


    createdBy: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    participants: [{
        type: String
    }],

    quantAnswers: {
        type: Number,
        default: 0
    },

    moments: [{
        type: Date
    }],
});

//Apos definir o model room, declara como um Schema do Mongo
const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;