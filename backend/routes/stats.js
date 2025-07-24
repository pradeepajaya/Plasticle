const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/bottle-summary', statsController.getBottleStats);

module.exports = router; 
