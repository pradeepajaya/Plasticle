const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Original buyer stats
router.get('/bottle-summary', statsController.getBottleStats);

// New buyer bottle collection stats
router.get('/buyer-bottle-stats', statsController.getBuyerBottleStats);
router.get('/buyer-summary-stats', statsController.getBuyerSummaryStats);

// Bottle disposal and recycling stats
router.get('/bottle-disposal', statsController.getBottleDisposalStats);
router.get('/monthly-disposal', statsController.getMonthlyDisposalStats);
router.get('/yearly-disposal', statsController.getYearlyDisposalStats);
router.get('/manufacturer-stats', statsController.getManufacturerStats);

// Collection analytics by different dimensions
router.get('/collected-by-month', statsController.getCollectedByMonth);
router.get('/collected-by-year', statsController.getCollectedByYear);
router.get('/collected-by-manufacturer', statsController.getCollectedByManufacturer);
router.get('/collected-by-province', statsController.getCollectedByProvince);

// Comprehensive bottle summary
router.get('/bottle-summary-detailed', statsController.getBottleSummary);

module.exports = router; 
