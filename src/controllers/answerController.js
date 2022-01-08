const answerModel = require('../models/answerModel')
const ObjectId = require('mongoose').Types.ObjectId;
const userModel = require("../models/userModel")
const questionModel = require("../models/questionModel")


const createanswer = async (req, res) => {
    try {
        let userBody = req.body
        let { answeredBy, questionId } = userBody
        let checkid = ObjectId.isValid(answeredBy);
        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        let checkque = ObjectId.isValid(questionId);
        if (!checkque) {
            return res.status(400).send({ status: false, message: "Please provide a valid questionId " })
        }
        if (req.userId != answeredBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const questionDetail = await questionModel.findOne({_id:questionId}).lean()
        console.log(questionDetail)
        if(questionDetail.askedBy==answeredBy){
            return res.status(400).send({ status: false, message: "YOu cannot create answer for ur own question" })
        }
        const userDetail = await userModel.findOne({_id:answeredBy})
        userDetail.creditScore = userDetail.creditScore+200
        await userModel.findOneAndUpdate({_id:answeredBy},userDetail)
        
        const data = await answerModel.create(req.body)
        return res.status(201).send({ status: true, message: "successfully", data })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//---------------------------------------------------------------------------------------------------------

const getdetails = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        checkId = ObjectId.isValid(questionId)
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please provide a valid questionId " })
        }
        const answer = await answerModel.find({ questionId: questionId }).sort({createdAt:-1});
        if (!answer) {
            return res.status(404).send({ status: false, message: `answer does not exit` })
        }
        return res.status(200).send({ status: true, message: 'Success', data: answer })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//--------------------------------------------------------------------------------------------------------


const updateanswer = async (req, res) => {
    try {
        const answerId = req.params.answerId;
        let userBody = req.body
        let { text } = userBody
        let checkid = ObjectId.isValid(answerId);
        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid answerId " })
        }
        const findanswer = await answerModel.findOne({ _id: answerId })
        if (!findanswer) {
            return res.status(404).send({ status: false, message: `No answer found ` })

        }
        if (req.userId!= findanswer.answeredBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        
        const upatedanswer = await answerModel.findOneAndUpdate({ _id:answerId }, { text:text }, { new: true })
        res.status(200).send({ status: true, message: 'answer updated successfully', data: upatedanswer });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//----------------------------------------------------------------------------------------------------------

const deleteanswer = async (req, res) => {
    try {
        const params = req.params.answerId
        let userbody = req.body
        let { userId, questionId } = userbody
        checkId = ObjectId.isValid(params)
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please provide a valid answerId " })
        }
        let checkuser = ObjectId.isValid(userId);
        if (!checkuser) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        let checkque = ObjectId.isValid(questionId);
        if (!checkque) {
            return res.status(400).send({ status: false, message: "Please provide a valid questionId " })
        }

        const answerDetails = await answerModel.findOne({_id:params})
        if(!answerDetails){
            return res.status(400).send({ status: false, message: " the answer is not posted" })
        } 
        
        if(answerDetails.questionId != questionId){
            return res.status(400).send({ status: false, message: "Sorry you are not able to delete the answer" })
        } 
        
        if (req.userId!=userId ) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const deleteData = await answerModel.findOneAndUpdate({_id: params }, { isDeleted: true }, { new: true });
        return res.status(200).send({ status: true, message: "answer deleted successfullly.", data: deleteData })

    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }

}

module.exports = { createanswer, getdetails, updateanswer, deleteanswer }