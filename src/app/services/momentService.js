const Room = require("../models/room");
const Answer = require("../models/answer");
const User = require("../models/user");
const Moment = require("../models/moment");
const { mean, std, variance } = require('mathjs')


class MomentService {
    static populateData = async ({ momentId, roomId }) => {
        const room = await Room.findById(roomId)
        const moment = await Moment.findById(momentId)

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
        const momentData = []
        const questionsIds = [...new Set(
            answers
                .map(answer => answer.questionId)
        )]

        questionsIds.sort().map(async questionId => {
            const answersForThisQuestion = answers
                .filter(answer => answer.questionId === questionId)
            const onlyAnswers = [...new Set(
                answersForThisQuestion
                    .map(answer => answer.answer)
            )]

            momentData.push({
                questionId,
                avg: mean(onlyAnswers),
                std: std(onlyAnswers),
                variance: variance(onlyAnswers)
            })

            answersForThisQuestion.map(async ans => {
                ans.zScore = (ans.answer - momentData[questionId].avg) / momentData[questionId].std
                await ans.save()
            })
        })

        moment.questions = momentData
        await moment.save()
        return { message: `Update ${answers.length} respostas` }
    }

    static getFields = ({ array, indexesToSearch, maxQuestions }) => {
        const total = 0
        const sum = 0

        array.forEach((item, index) => {
            
        })

        return sum / total
    }
}

module.exports = MomentService