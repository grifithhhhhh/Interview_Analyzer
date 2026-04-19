const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getReport } = require('../controllers/reportController.js');

const router = express.Router();

router.get('/:interviewId', authMiddleware, getReport);

module.exports = router;