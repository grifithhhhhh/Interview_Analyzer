const express = require('express');
const { getReport } = require('../controllers/reportController.js');

const router = express.Router();
router.get('/:candidateId', getReport);

module.exports = router;