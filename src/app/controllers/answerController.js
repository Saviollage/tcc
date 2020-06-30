const express = require("express");
const Room = require("../models/room");
const Answer = require("../models/answer");

const router = express.Router();


router.post("/new", async (req, res) => {

    const { roomId, participant } = req.body;

    try {

        const room = await Room.findById(roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        if (!room.active)
            return res.status(400).send({ error: "Room closed" });

        const answer = await Answer.create(req.body);

        return res.send({ answer, message: "Answer recorded successfully" });

    } catch (err) {
        return res.status(400).send({ error: "Answer registration failed" });
    }
});

//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/answer'
module.exports = app => app.use("/answer", router);