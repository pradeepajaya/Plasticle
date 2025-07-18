const express = require("express");
const { createBin, getDueLocations } = require("../controllers/binController"); 

const router = express.Router();

// Route for creating a bin & generating QR
router.post("/createBin", createBin);

router.get('/due-locations', getDueLocations);

module.exports = router;
