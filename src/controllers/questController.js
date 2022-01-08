const questionModel = require('../models/questionModel')
const userModel = require('../models/userModel')
const ObjectId = require('mongoose').Types.ObjectId;
const answerModel = require('../models/answerModel')
const mongoose = require('mongoose');

const isValid = function (value) {
    if (typeof value === "undefined" || value === null || value === Number) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


const createquestion = async (req, res) => {
    try {
        const { askedBy } = req.body;
        let checkid = ObjectId.isValid(askedBy);
        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        if (req.userId != askedBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const checkUser = await userModel.findOne({ _id: askedBy })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'you are not a valid user' })
        }
        if(checkUser.creditScore<1){
            return res.status(400).send({ status: false, msg: 'you are not able to post the question becoz ur creditScore is 0 or -ve' })
        }
        checkUser.creditScore = checkUser.creditScore-100
        const creditScore = await userModel.findOneAndUpdate({_id:askedBy},checkUser,{new:true})
        
        const data = await questionModel.create(req.body)
        return res.status(201).send({ status: false, message: "successfully", data })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//------------------------------------------------------------------------------------------------------

const getQuestions = async (req, res) => {
    try {
        let filterQuery = { isDeleted: false }
        let querybody = req.query;

        let { tag, sort } = querybody;

        if (isValid(tag)) {
            const tagArr = tag.split(',')
            filterQuery['tag'] = { $all: tagArr }
        }

        if (isValid(sort)) {
            sort = sort.toLowerCase();
            if (!(["ascending", "descending"].includes(sort))) {
                return res.status(400).send({ message: "Please give either ascending or descending" })
            }
            if (sort == "ascending") {
                var data = await questionModel.find(filterQuery).lean().sort({ createdAt: 1 })
            }
            if (sort == "descending") {
                var data = await questionModel.find(filterQuery).lean().sort({ createdAt: -1 });
            }
        }

        if (!sort) {
            var data = await questionModel.find(filterQuery).lean();
        }

        for (let i = 0; i < data.length; i++) {
            let answer = await answerModel.find({ questionId: data[i]._id }).select({ text: 1, answeredBy: 1 })
            if (answer.length == 0) {
                continue;
            }
            data[i].answers = answer
        }

        if (data.length == 0) {
            return res.status(400).send({ status: false, message: "No Question found" })
        }

        return res.status(200).send({ status: true, Details: data });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//-----------------------------------------------------------------------------------------------------------


const getquestionId = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        if (!isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid product id` })
        }

        const Question = await questionModel.findOne({ _id: questionId, isDeleted: false }).lean();

        if (!Question) {
            return res.status(404).send({ status: false, message: `Question does not exit` })
        }
        let answer = await answerModel.find({ questionId: questionId }).select({ text: 1, answeredBy: 1 })
        Question.answers = answer;

        return res.status(200).send({ status: true, message: 'Success', data: Question })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//----------------------------------------------------------------------------------------------------------


const updatequestion = async (req, res) => {
    try {
        const params = req.params.questionId;
        const { askedBy } = req.body;
        let checkid = ObjectId.isValid(askedBy);
        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        let questionid = ObjectId.isValid(params);
        if (!questionid) {
            return res.status(400).send({ status: false, message: "Please provide a valid questionId " })
        }
        if (req.userId != askedBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const updateUser = await userModel.findOne({ _id: askedBy })
        if (!updateUser) {
            return res.status(400).send({ status: false, msg: 'you are not a valid user' })
        }

        const findquestion = await questionModel.findById({ _id: params, isDeleted: false })
        if (!findquestion) {

            return res.status(404).send({ status: false, message: `No question found ` })
        }
        const upatedquestion = await questionModel.findOneAndUpdate({ questionId: params }, { description: req.body.description, tag: req.body.tag }, { new: true })
        res.status(200).send({ status: true, message: 'questionupdated successfully', data: upatedquestion });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//--------------------------------------------------------------------------------------------------------------


const deleteQuestion = async (req, res) => {
    try {
        const params = req.params.questionId;
        let checkid = ObjectId.isValid(params);

        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        const findquestion = await questionModel.findById({ _id: params, isDeleted: false })
        if (!findquestion) {
            return res.status(404).send({ status: false, message: `No question found ` })
        }
        const askedBy = findquestion.askedBy
        if (req.userId != askedBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const deleteData = await questionModel.findOneAndUpdate({ questionId: params }, { isDeleted: true }, { new: true });
        return res.status(200).send({ status: true, message: "question deleted successfullly.", data: deleteData })

    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

module.exports = { createquestion, getQuestions, getquestionId, updatequestion, deleteQuestion }
