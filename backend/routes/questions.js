const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { generateQuestions, getQuestions } = require('../controllers/questionController')

router.post('/generate', authMiddleware, generateQuestions)
router.get('/:candidateId', authMiddleware, getQuestions)

module.exports = router