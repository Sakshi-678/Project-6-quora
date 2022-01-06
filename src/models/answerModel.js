const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const answerSchema = new mongoose.Schema({

    answeredBy: { type:ObjectId, ref:'myUser', required:'answerd required'},
    questionId: {type:ObjectId, ref:'question', required:'questionId required'},
    text: [{type: String, required:'text is required'}],
    isDeleted:{type:Boolean, default:false}

},{timestamps:true});
    module.exports = mongoose.model('answer',answerSchema)