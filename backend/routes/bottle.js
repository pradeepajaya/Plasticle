const express = require("express");
const router = express.Router();
const bottleController = require("../controllers/bottleController");

// POST /api/task-handler/recycle-bottle
router.post("/recycle-bottle", bottleController.recycleBottle);

module.exports = router;