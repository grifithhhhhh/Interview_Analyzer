const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { submitAnswer, getInterview, flagInterview, voidInterview } = require('../controllers/interviewController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

fs.mkdirSync('uploads/audio', { recursive: true });

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/audio/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// specific routes first
router.post('/answer', authMiddleware, upload.single('audio'), submitAnswer);
router.post('/flag', authMiddleware, flagInterview);
router.post('/void', authMiddleware, voidInterview);

// dynamic route last
router.get('/:candidateId', authMiddleware, getInterview);

module.exports = router;