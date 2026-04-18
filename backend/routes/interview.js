const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { submitAnswer, getInterview } = require('../controllers/interviewController.js');

fs.mkdirSync('uploads/audio', { recursive: true });

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/audio/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/answer', upload.single('audio'), submitAnswer);
router.get('/:candidateId', getInterview);

module.exports = router;