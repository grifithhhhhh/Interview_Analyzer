const express = require('express')
const router = express.Router()
const multer = require('multer')
const { analyzeResume } = require('../controllers/resumeController')

// Store file in memory (not disk) so pdf-parse can read the buffer directly
const upload = multer({ storage: multer.memoryStorage() })

router.post('/analyze', upload.single('resume'), analyzeResume)

module.exports = router