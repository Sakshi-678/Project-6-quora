const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController')
const questController = require('../controllers/questController')
const answerController = require('../controllers/answerController')
const middlewares = require('../middlewares/appMiddleware')

//Feature-1
router.post('/register',userController.registerUser)
router.post('/login',userController.Login)
router.get('/user/:userId/profile', middlewares.auth, userController.getUserData)
router.put('/user/:userId/profile', middlewares.auth, userController.updateUserData)

//Feature-2
router.post('/createquestion',middlewares.auth,questController.createquestion)
router.get('/questions',questController.getQuestions)
router.get('/questions/:questionId',questController.getquestionId)
router.put('/questions/:questionId',middlewares.auth,questController.updatequestion)
router.delete('/questions/:questionId',middlewares.auth,questController.deleteQuestion)


//Feature-3
router.post('/createanswer',middlewares.auth,answerController.createanswer)
router.get('/questions/:questionId/answer',answerController.getdetails)
router.put('/answer/:answerId',middlewares.auth,answerController.updateanswer)
router.delete('/answers/:answerId',middlewares.auth,answerController.deleteanswer)


module.exports = router
