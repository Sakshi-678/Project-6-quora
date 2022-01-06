const express = require('express');
var bodyParser = require('body-parser');
const multer = require('multer')

const route = require('./routes/routes.js');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(multer().any())

const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://users-open-to-all:hiPassword123@cluster0.uh35t.mongodb.net/PROJECT6-SAKSHI?retryWrites=true&w=majority",{UseNewUrlParser:true})
.then(()=> console.log('mongodb is running and connected'))
.catch(err => console.log(err))

app.use('/',route)
app.listen(process.env.PORT || 3000, function(){
   console.log('Express app running on port' + (process.env.PORT || 3000))
});