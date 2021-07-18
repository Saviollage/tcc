const express = require("express");
const Room = require("../models/room");
const Moment = require("../models/moment");
const User = require("../models/user");
const Answer = require("../models/answer");
const { listIndexes } = require("../models/room");
const Participant = require("../models/participant");
const authMiddlware = require('../middlewares/auth')
const MomentService = require('../services/momentService')
const router = express.Router();

function generatePinCode() {
    var value = Math.floor(Math.random() * 8999999 + 1000000);
    return value.toString();
}

router.post("/createRoom", async (req, res) => {
    const { name, createdBy } = req.body;
    try {
        /*  VERIFICA PRESENÇA DO USUARIO NO SISTEMA */
        const user = await User.findOne({ email: createdBy });

        if (user == undefined)
            return res.status(400).send({ error: "User not found" });

        const data = req.body;


        /*  CASO USUÁRIO EXISTA, SISTEMA PROSSEGUE PARA A CRIAÇÃO DA SALA */
        const room = await Room.create(req.body);

        const moment = await Moment.create({
            roomId: room._id,
            email: room.createdBy
        });

        room.pin = generatePinCode();
        room.moments.push(moment.createdAt);
        moment.momentIndex = 0;
        await moment.save();
        await room.save();

        return res.send({ message: "Room recorded successfully", room });

    } catch (err) {

        return res.status(400).send({ error: "Room registration failed" });
    }
});

// LISTAR TODAS AS SALAS
router.get("/all", async (req, res) => {
    try {
        /*  VERIFICA PRESENÇA DO USUARIO NO SISTEMA */
        const rooms = await Room.find();
        return res.json(rooms);

    } catch (err) {

        return res.status(400).send({ error: "Room list failed" });
    }
});

// LISTAR TODAS AS SALAS
router.get("/my", authMiddlware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user)
            return res.status(403).send({ error: 'user not found' })
        const rooms = await Room.find({
            createdBy: user.email
        });
        return res.json(rooms);

    } catch (err) {

        return res.status(400).send({ error: "Room list failed" });
    }
});

// DETALHAR SALA
router.get("/:roomPin", async (req, res) => {
    try {
        const pin = req.params.roomPin;
        const room = await Room.findOne({ pin: pin }).populate(`Moment`);
        if (room == undefined)
            return res.status(400).send({ error: "Room not found" })

        return res.json(room);
    } catch (err) {
        return res.status(400).send({ error: "Error listing room detail" });
    }
});

router.get("/data/:roomId", async (req, res) => {
    try {
        const roomId = req.params.roomId;
        if (!roomId) return res.status(400).send({ error: `Please provide some id` })

        const room = await Room.findById(roomId)
        if (!room) return res.status(404).send({ error: `Room not found` })
        const dataToReturn = {
            room,
            moments: [],
            participantsAnswersData: []
        }
        const participants = await Participant.find({ roomPin: room.pin })
        const moments = await Moment.find({ roomId: roomId });

        await Promise.all(moments.map(async moment => {
            await MomentService.populateData({
                momentId: moment._id,
                roomId: room._id
            })
            const createdAtOptions = (moment.momentIndex + 1 === room.moments.length) ?
                {
                    "$gte": moment.createdAt
                } :
                {
                    "$gte": moment.createdAt,
                    "$lte": room.moments[moment.momentIndex + 1]
                }

            const answers = await Answer.find({
                roomId: room._id,
                createdAt: createdAtOptions
            })
            dataToReturn.moments.push({
                moment, answers
            })

            participants.map(participant => {
                const zIndexes = [...new Set(
                    answers
                        .filter(answer => answer.participant === `${participant._id}`)
                        .map(answer => answer.zScore)
                )]
                if (zIndexes.length) {
                    const x = MomentService.getFields({
                        array: zIndexes,
                        indexesToSearch: [0],
                        maxQuestions: moment.questions.length
                    })
                    const y = MomentService.getFields({
                        array: zIndexes,
                        indexesToSearch: [1],
                        maxQuestions: moment.questions.length
                    })
                    dataToReturn.participantsAnswersData.push({
                        participant,
                        zIndexes,
                        x,
                        y
                    })
                }
            })
        }))


        return res.json(dataToReturn);
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Error listing room detail" });
    }
});

router.delete("/:roomId", async (req, res) => {

    try {
        /*  VERIFICA PRESENÇA DA SALA NO SISTEMA */
        const room = await Room.findById(req.params.roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });


        const moments = await Moment.find({ roomId: room._id });

        const answers = await Answer.find({ roomId: room._id });

        const participants = await Participant.find({ roomPin: room.pin })

        for (var i = 0; i < participants.length; i++)
            await participants[i].remove();

        for (var i = 0; i < answers.length; i++)
            await answers[i].remove();

        for (var i = 0; i < moments.length; i++)
            await moments[i].remove();
        await room.remove();

        return res.send({ message: "Room '" + room.name + "' removed" });

    } catch (err) {

        return res.status(400).send({ error: "Room delete failed" });
    }
});

// DETALHAR SALA
router.put("/edit", async (req, res) => {
    try {
        const id = req.body.roomId;
        const room = await Room.findById(id);
        if (room == undefined)
            return res.status(400).send({ error: "Room not found" })
        const { name, minInterval, maxInterval } = req.body

        if (name !== undefined) room.name = name
        if (minInterval !== undefined) room.minInterval = minInterval
        if (maxInterval !== undefined) room.maxInterval = maxInterval

        await room.save();

        return res.send({ message: "Room edited" });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "Error edting room" });
    }
});

// DETALHAR SALA
router.get("/activate/:roomId", async (req, res) => {
    try {
        const id = req.params.roomId;
        const room = await Room.findById(id);
        if (room == undefined)
            return res.status(400).send({ error: "Room not found" })

        room.active = true;
        await room.save();

        return res.send({ message: "Room activeted" });
    } catch (err) {
        return res.status(400).send({ error: "Error listing room detail" });
    }
});

// DETALHAR SALA
router.get("/desactivate/:roomId", async (req, res) => {
    try {
        const id = req.params.roomId;
        const room = await Room.findById(id);
        if (room == undefined)
            return res.status(400).send({ error: "Room not found" })
        room.active = false;
        room.closedAt = Date.now();
        room.duration = new Date(room.closedAt - room.createdAt).getTime();

        await room.save();

        return res.send({ message: "Room deactivated" });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "Error listing room detail" });
    }
});

//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/room'
module.exports = app => app.use("/room", router);