const express = require("express");
const app = express();
const PORT = 6000;
const userRouter = require("./routes/user");
const mongoose = require("mongoose")

//---------------middlewaresssss-----------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//---------------mongoDB connection-----------------------

mongoose.connect('mongodb://127.0.0.1:27017/interview_analyzer')
    .then(() => {console.log("MongoDB connected")})
    .catch(err => console.log(err))

//---------------Routes-----------------------    
    
app.use('/', userRouter);

app.listen(PORT, ()=> {console.log(`Server started at port: ${PORT}`)});