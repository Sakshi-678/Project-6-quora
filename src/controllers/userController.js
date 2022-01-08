const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const validNumber = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

const isValid = function (value) {
    if (typeof value === "undefined" || value === null || value === Number) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const registerUser = async (req, res) => {

    let data = req.body
    const { fname, lname, email, phone, password, creditScore } = data

    if (!isValidRequestBody(data)) {
        return res.status(400).send({ status: false, message: "Invalid request parameters.. Please Provide User Details" })
    }
    if (!isValid(fname)) {
        return res.status(400).send({ status: false, message: "Please Provide First Name" })
    }
    if (!isValid(lname)) {
        return res.status(400).send({ status: false, message: "Please Provide last Name" })
    }
    if (!isValid(email)) {
        return res.status(400).send({ status: false, message: "Please Provide email" })
    }
    if (!isValid(creditScore)) {
        return res.status(400).send({ status: false, message: "Please Provide creditScore" })
    }
    if(creditScore<1){
        return res.status(400).send({ status: false, message: "creditSCore cannot be negative or 0" })
    }
    if(creditScore<500){
        return res.status(400).send({ status: false, message: "creditSCore cannot be less than 500" })
    }
    if (phone) {
            if (!(validNumber.test(phone))) {
            return res.status(400).send({ status: false, message: "Please Provide validNumber " })
        }
    }
    if (!isValid(password)) {
        return res.status(400).send({ status: false, message: "Please Provide passsword" })
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
        return res.status(400).send({ status: false, message: `Enter a valid email address` })
    }

    if (!(password.length > 7 && password.length < 16)) {
        res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
        return

    }

    const isAlreadyUsed = await userModel.findOne({ email, phone })
    if (isAlreadyUsed) {
        return res.status(400).send({ status: false, message: `Email or phone is Already used` })
    }

    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    data.password = await bcrypt.hash(data.password, salt);

    const savedData = await userModel.create(data);
    return res.status(201).send({ status: true, message: "Successfully Created", data: savedData });

}

//--------------------------------------------------------------------------------------------------------------

const Login = async (req, res) => {

    const mEmail = req.body.email;
    const mPassword = req.body.password;

    if (!isValidRequestBody(req.body)) {
        return res.status(400).send({ status: false, message: "Invalid request parameters.. Please Provide User Details" })
    }
    if (!isValid(mEmail)) {
        return res.status(400).send({ status: false, message: "Please Provide Email id" })
    }

    if (!isValid(mPassword)) {
        return res.status(400).send({ status: false, message: "Please Provide Password" })
    }
    let user = await userModel.findOne({ email: mEmail })
    if (user) {

        const _id = user._id
        const name = user.fname
        const password = user.password

        const validPassword = await bcrypt.compare(mPassword, password)

        if (!validPassword) {
            return res.status(400).send({ status: false, message: " Invalid password" })
        }
        let payload = { userId: _id }
        const generatedToken = jwt.sign(payload, "Exodus", { expiresIn: '160m' })

        res.header('x-api-key', generatedToken)

        return res.status(200).send({ status: true, message: name + ", You have  logged in successfully", data: { userId: user._id, token: generatedToken } })
    } else {
        return res.status(400).send({ status: false, message: "Oops...Invalid Credentials" })
    }

}
//------------------------------------------------------------------------------------------------------------

const getUserData = async function (req, res) {

    const userId = req.params.userId


    if (!isValidObjectId(userId)) {
        res.status(400).send({ status: false, msg: `Invalid userId` })
        return
    }

    if (req.userId != userId) {
        res.status(400).send({ status: false, msg: `Unauthorised Access` })
        return
    }


    let userDetail = await userModel.findOne({ _id: userId, isDeleted: false })
    if (!userDetail) {
        res.status(400).send({ status: false, message: `No user exist with this ${userId}` })
    }

    res.status(200).send({ status: true, message: `Successlly fetched user details`, data: userDetail })
}

//--------------------------------------------------------------------------------------------------------

const updateUserData = async function (req, res) {


    const requestBody = req.body
    const userId = req.params.userId
    const { fname, lname, email, phone } = requestBody


    if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: `Invalid UserId` })
    }

    if (req.userId != userId) {
        return res.status(400).send({ status: false, msg: `Unauthorised Access` })
    }
    const userFound = await userModel.findOne({ _id: userId, isDeleted: false })


    if (!userFound) {
        return res.status(400).send({ status: false, message: `No user exist` })
    }

    let obj = {}
    if (requestBody) {
        if (fname) {
            obj.fname = fname
        }
        if (lname) {
            obj.lname = lname
        }
        if (email) {
            if (userFound.email === email) {
                return res.status(400).send({ status: false, msg: `email already reg` })
            }
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
                return res.status(400).send({ status: false, message: `Enter a valid email address` })
            }
            obj.email = email
        }
        if (phone) {
            if (userFound.phone === phone) {
                return res.status(400).send({ status: false, msg: `phone already reg` })
            }

            if (!(validNumber.test(phone))) {
                return res.status(400).send({ status: false, message: "Please Provide validNumber " })
            }

            obj.phone = phone
        }

        const updatedData = await userModel.findOneAndUpdate({ _id: userId }, obj, { new: true })

        return res.status(200).send({ status: true, message: `Successlly updated user details`, data: updatedData })
    }

}

module.exports = { registerUser, Login, getUserData, updateUserData }





