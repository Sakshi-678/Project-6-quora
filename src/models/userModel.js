const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    fname: {type: String, required: "First name is Required",trim: true},
    lname: {type: String, required: "Last name is Required",trim: true},
    email: {type: String, required: "Email is Required", unique:true, trim:true,lowercase:true},
    phone: {type: String,  trim:true}, 
    password: {type: String, required: "Password is Required"},
    creditScore:{type:Number, required:"credit score is Required"}
},{timestamps:true});

    module.exports = mongoose.model('myUser',userSchema)
