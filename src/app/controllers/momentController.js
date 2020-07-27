const express = require("express");
const Room = require("../models/room");
const Answer = require("../models/answer");
const User = require("../models/user");
const Moment = require("../models/moment");

const router = express.Router();

router.post("/createMoment", async (req, res) => {
    const { roomId, email } = req.body;

    try {

        const room = await Room.findById(roomId);

        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        if (!room.active)
            return res.status(400).send({ error: "Room closed" });

        const user = await User.findOne({ email: email });

        if (user == undefined)
            return res.status(400).send({ error: "User not found" });

        if (user.email != room.createdBy)
            return res.status(400).send({ error: "User not have permission" });


        const moment = await Moment.create(req.body);


        room.moments.push(moment.createdAt);
        moment.momentIndex = room.moments.length - 1;
        await room.save();
        await moment.save();


        return res.send({ moment, message: "Moment recorded successfully" });

    } catch (err) {
        return res.status(400).send({ error: "Moment registration failed" });
    }
});



router.get("/", async (req, res) => {
    try {
        const moments = await Moment.find();

        return res.send({ moments });

    } catch (err) {

        return res.status(400).send({ error: "Moments list failed" });
    }
});


router.get("/byRoom/:roomId", async (req, res) => {
    try {

        const room = await Room.findById(req.params.roomId);
        if (room == undefined)
            return res.status(400).send({ error: "Room not found" });

        const moments = await Moment.find({ roomId: req.params.roomId });


        return res.json(moments);

    } catch (err) {

        return res.status(400).send({ error: "Moments list failed" });
    }
});


module.exports = app => app.use("/moment", router);