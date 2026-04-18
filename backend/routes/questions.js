const express = require('express')
const router = express.Router()
const { generateQuestions, getQuestions } = require('../controllers/questionController')

router.post('/generate', generateQuestions)
router.get('/:candidateId', getQuestions)  // ← add this

module.exports = router