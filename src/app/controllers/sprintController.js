const express = require("express");
const Room = require("../models/room");
const Answer = require("../models/answer");
const User = require("../models/user");
const Sprint = require("../models/sprint");

const router = express.Router();

router.post("/createSprint", async (req, res) => {
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


        /*  Cria o sprint */
        const sprint = await Sprint.create(req.body);


        /*  Aloca o sprint no vetor da sala */
        room.sprints.push(sprint.createdAt)
        await room.save();


        return res.send({ sprint, message: "Sprint recorded successfully" });

    } catch (err) {
        return res.status(400).send({ error: "Sprint registration failed" });
    }
});

//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/room'
module.exports = app => app.use("/sprint", router);