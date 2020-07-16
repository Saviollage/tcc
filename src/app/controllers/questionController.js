const express = require("express");
const Room = require("../models/room");
const Moment = require("../models/moment");
const Question = require("../models/question");

const router = express.Router();

router.post("/new", async (req, res) => {

    const { questionText } = req.body;

    try {

        const question = await Question.create({ question: questionText});


        return res.send({ question, message: "Question recorded successfully" });

    } catch (err) {
        return res.status(400).send({ error: "Question registration failed" });
    }
});

router.get("/", async (req, res) => {

    try {
        const questions = await Question.find();

        return res.json(questions);

    } catch (err) {
        return res.status(400).send({ error: "Question list failed" });
    }
});

router.delete("/:questionId", async (req, res) => {

    try {
        const question = await Question.findById(req.params.questionId);


        if (question == undefined)
            return res.status(400).send({ error: "Question not found" });

        console.log(question);

        await question.remove();

        return res.send({ message: "Question " + question.question + " removed succesfully!" });

    } catch (err) {
        return res.status(400).send({ error: "Question list failed" });
    }
});


//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/answer'
module.exports = app => app.use("/question", router);