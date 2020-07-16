const express = require("express");
const Room = require("../models/room");
const Answer = require("../models/answer");
const User = require("../models/user");
const Moment = require("../models/moment");

const router = express.Router();

router.post("/createMoment", async (req, res) => {
    const { roomId, email } = req.body;

    try {
        /*  Verifica sala no sistema */
        const room = await Room.findById(roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        if (!room.active)
            return res.status(400).send({ error: "Room closed" });

        /*  Verifica usuário no sistema */
        const user = await User.findOne({ email: email });

        if (user == undefined)
            return res.status(400).send({ error: "User not found" });

        if (user.email != room.createdBy)
            return res.status(400).send({ error: "User not have permission" });


        /*  Cria o moment */
        const moment = await Moment.create(req.body);

        /*  Aloca o moment no vetor da sala */
        room.moments.push(moment.createdAt);
        moment.momentIndex = room.moments.length + 1;
        await room.save();
        await moment.save();


        return res.send({ moment, message: "Moment recorded successfully" });

    } catch (err) {
        return res.status(400).send({ error: "Moment registration failed" });
    }
});



router.get("/", async (req, res) => {
    try {
        /*  VERIFICA PRESENÇA DO USUARIO NO SISTEMA */
        const moments = await Moment.find();

        return res.send({ moments });

    } catch (err) {

        return res.status(400).send({ error: "Moments list failed" });
    }
});
//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/room'
module.exports = app => app.use("/moment", router);