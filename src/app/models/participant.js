const mongoose = require("../../database");

//O userSchema contem os campos do nosso banco na table Usuario
const ParticipantSchema = new mongoose.Schema({
    name: {
        type: String
    },
    code: {
        type: String
    }, 
    roomPin: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


//Apos definir o model user, declara como um Schema do Mongo
const Participant = mongoose.model("Participant", ParticipantSchema);

//Exporta o Participant
module.exports = Participant;