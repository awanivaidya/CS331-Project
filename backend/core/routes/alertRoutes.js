/**
 * Alert routes
 */

const express = require("express");
const {
  getRiskDashboard,
  getCriticalAlerts,
} = require("../controllers/alertController");
const { authenticateToken } = require("../middlewares/authenticate");

const router = express.Router();

router.use(authenticateToken);
router.get("/dashboard", getRiskDashboard);
router.get("/critical", getCriticalAlerts);

module.exports = router;
