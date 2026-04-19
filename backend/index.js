require('dotenv').config()
const express = require("express");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;
const resumeRoutes = require('./routes/resume')
const mongoose = require("mongoose")
const questionRoutes = require('./routes/questions')
const interviewRoutes = require('./routes/interview.js');
const reportRoutes = require('./routes/report.js');
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');




//---------------middlewaresssss-----------------------
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log('GEMINI KEY:', process.env.GEMINI_API_KEY)

mongoose.connect('mongodb://127.0.0.1:27017/interview_analyzer')
    .then(() => {console.log("MongoDB connected")})
    .catch(err => console.log(err))

//---------------Routes-----------------------    

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/candidates', candidateRoutes);
app.listen(PORT, ()=> {console.log(`Server started at port: ${PORT}`)});