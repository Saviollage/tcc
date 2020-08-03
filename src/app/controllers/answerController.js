const express = require("express");
const Room = require("../models/room");
const Answer = require("../models/answer");
const Moment = require("../models/moment");
const Participant = require("../models/participant");

const router = express.Router();

router.post("/new", async (req, res) => {

    const { roomId, participant, questionId, answer } = req.body;

    try {

        const room = await Room.findById(roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        if (!room.active)
            return res.status(400).send({ error: "Room closed" });


        const p = await Participant.findById(participant);

        if (p == undefined)
            return res.status(400).send({ error: "Participant not found" });


        const answer = await Answer.create(req.body);

        const moment = await Moment.findOne({ roomId: roomId, createdAt: room.moments[room.moments.length - 1] });

        moment.totalAnswers += 1;

        await moment.save();

        room.quantAnswers++;

        await room.save();

        return res.send({ answer, message: "Answer recorded successfully" });

    } catch (err) {
        return res.status(400).send({ error: "Answer registration failed" });
    }
});

router.post("/newList", async (req, res) => {

    const { roomId, participant, answers } = req.body;

    try {

        const room = await Room.findById(roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        if (!room.active)
            return res.status(400).send({ error: "Room closed" });


        const p = await Participant.findById(participant);

        if (p == undefined)
            return res.status(400).send({ error: "Participant not found" });

        for (const answer of answers) {
            var data = answer;
            data['roomId'] = roomId;
            data['participant'] = participant;

            await Answer.create(data);
        }


        const moment = await Moment.findOne({ roomId: roomId, createdAt: room.moments[room.moments.length - 1] });

        moment.totalAnswers += 1;

        await moment.save();

        room.quantAnswers++;

        await room.save();

        return res.send({ message: `${answers.length} Answers recorded successfully` });

    } catch (err) {
        return res.status(400).send({ error: "Answers registration failed" });
    }
});

router.get("/", async (req, res) => {

    try {
        const answers = await Answer.find();

        return res.json(answers);

    } catch (err) {
        return res.status(400).send({ error: "Answer list failed" });
    }
});



router.get("/byRoom/:roomId", async (req, res) => {

    try {

        const room = await Room.findById(req.params.roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });


        const answers = await Answer.find({ roomId: req.params.roomId });

        return res.json(answers);

    } catch (err) {
        return res.status(400).send({ error: "Answer list failed" });
    }
});

router.get("/byRoom/:roomId/:momentIndex", async (req, res) => {

    try {
        const room = await Room.findById(req.params.roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        const moment = await Moment.findOne({ roomId: req.params.roomId, momentIndex: req.params.momentIndex });

        if (moment == undefined)
            return res.status(400).send({ error: "Moment Not found" });

        const answers = await Answer.find({ roomId: req.params.roomId, createdAt: { $gte: moment.createdAt } });

        return res.json({ moment: moment, answers: answers });

    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Answer list failed" });
    }
});

//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/answer'
module.exports = app => app.use("/answer", router);