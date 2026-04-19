const express = require('express')
const router = express.Router()
const multer = require('multer')
const { analyzeResume } = require('../controllers/resumeController')
const authMiddleware = require('../middleware/authMiddleware')

const upload = multer({ storage: multer.memoryStorage() })

router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume)

module.exports = router