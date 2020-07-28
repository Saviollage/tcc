const express = require("express");
const Room = require("../models/room");
const Moment = require("../models/moment");
const Participant = require("../models/participant");

const router = express.Router();

router.post("/new", async (req, res) => {

    const { roomPin, code } = req.body;

    try {

        const room = await Room.findOne({ pin: roomPin });

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        if (!room.active)
            return res.status(400).send({ error: "Room closed" });

        const particpantSearch = await Participant.findOne({
            roomPin: room.pin,
            code: code
        });

        if (particpantSearch == undefined) {
            const participant = await Participant.create(req.body);

            room.quantParticipants++;
            await room.save();

            return res.send({ participant, message: "Participant recorded successfully" });

        }
        else {
            const participant = particpantSearch;

            return res.send({ participant, room, message: "Participant founded successfully" });
        }

    } catch (err) {

        return res.status(400).send({ error: "Participant registration failed" });
    }
});

router.get("/", async (req, res) => {

    try {
        const participants = await Participant.find();

        return res.json(participants);

    } catch (err) {
        return res.status(400).send({ error: "Participant list failed" });
    }
});



router.get("/byRoom/:roomId", async (req, res) => {

    try {

        const room = await Room.findById(req.params.roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });


        const participants = await Participant.find({ roomPin: room.pin })

        return res.json(participants);

    } catch (err) {

        return res.status(400).send({ error: "Participant list failed" });
    }
});

//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/participant'
module.exports = app => app.use("/participant", router);