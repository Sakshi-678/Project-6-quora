const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({

    description: {type: String, required:true, trim: true},
    tag: [{type: String, required:true}],
    askedBy: {type:String, ref:'myUser'},
    deletedAt:{type:Date}, 
    isDeleted: {type:Boolean, default:false},
},{timestamps:true});
    module.exports = mongoose.model('question',questionSchema)