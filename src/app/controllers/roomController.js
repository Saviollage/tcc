const express = require("express");
const Room = require("../models/room");
const Moment = require("../models/moment");
const User = require("../models/user");

const router = express.Router();

router.post("/createRoom", async (req, res) => {
    const { name, createdBy } = req.body;
    try {
        /*  VERIFICA PRESENÇA DO USUARIO NO SISTEMA */
        const user = await User.findOne({ email: createdBy });

        if (user == undefined)
            return res.status(400).send({ error: "User not found" });

        /*  CASO USUÁRIO EXISTA, SISTEMA PROSSEGUE PARA A CRIAÇÃO DA SALA */
        const room = await Room.create(req.body);
        const moment = await Moment.create({
            roomId: room._id,
            email: room.createdBy
        });

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

        return res.send({ rooms });

    } catch (err) {

        return res.status(400).send({ error: "Room list failed" });
    }
});

// DETALHAR SALA
router.get("/:roomId", async (req, res) => {
    try {
        //Retorna a sala cuja id foi requisitada  
        const room = await Room.findById(
            req.params.roomId,
            {
                //Apenas para tirar o DeprecationWarning que aparecia
                useFindAndModify: false
            }
        );

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" })

        return res.send(room);
    } catch (err) {

        return res.status(400).send({ error: "Error listing room detail" });
    }
});

router.delete("/:roomId", async (req, res) => {

    try {
        /*  VERIFICA PRESENÇA DA SALA NO SISTEMA */
        const room = await Room.findById(req.params.roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });


        const moments = await Moment.find({ roomId: room._id })

        for (var i = 0; i < moments.length; i++)
            await moments[i].remove();
        await room.remove();

        return res.send({ message: "Room '" + room.name + "' removed" });

    } catch (err) {
        ;
        return res.status(400).send({ error: "Room delete failed" });
    }
});



//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/room'
module.exports = app => app.use("/room", router);