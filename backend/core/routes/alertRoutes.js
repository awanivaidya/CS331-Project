/**
 * Alert routes
 */

const express = require("express");
const {
  getRiskDashboard,
  getCriticalAlerts,
} = require("../controllers/alertController");

const router = express.Router();

router.get("/dashboard", getRiskDashboard);
router.get("/critical", getCriticalAlerts);

module.exports = router;
