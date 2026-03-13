/**
 * Alert/Notification Controller
 * Provides endpoints to retrieve risk alerts and notifications.
 */

const Customer = require("../models/Customer");
const Project = require("../models/Project");

const isStaff = (req) => (req.user?.type || req.user?.role) === "Staff";

const staffDomainFilter = (req) => {
  if (!isStaff(req)) return null;
  const domains = req.user?.assignedDomains || [];
  return domains.map((id) => id.toString());
};

/**
 * Get all customers with their current risk status
 */
const getRiskDashboard = async (req, res) => {
  try {
    const filter = {};
    const allowedDomains = staffDomainFilter(req);
    if (allowedDomains) {
      filter.domainId = { $in: allowedDomains };
    }

    const customers = await Customer.find(filter)
      .select("name priority sentimentScore riskStatus sentimentHistory")
      .lean();

    const alerts = customers
      .filter((c) => c.riskStatus === "critical" || c.riskStatus === "warning")
      .map((c) => ({
        type: "RISK_ALERT",
        severity: c.riskStatus === "critical" ? "CRITICAL" : "WARNING",
        customer: {
          id: c._id,
          name: c.name,
          sentimentScore: c.sentimentScore,
          riskStatus: c.riskStatus,
        },
        timestamp:
          c.sentimentHistory.length > 0
            ? c.sentimentHistory[c.sentimentHistory.length - 1].timestamp
            : c.updatedAt,
      }));

    res.json({
      totalCustomers: customers.length,
      criticalCount: customers.filter((c) => c.riskStatus === "critical")
        .length,
      warningCount: customers.filter((c) => c.riskStatus === "warning").length,
      stableCount: customers.filter(
        (c) => c.riskStatus === "stable" || !c.riskStatus,
      ).length,
      alerts: alerts,
      customers: customers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get critical alerts only
 */
const getCriticalAlerts = async (req, res) => {
  try {
    const filter = { riskStatus: "critical" };
    const allowedDomains = staffDomainFilter(req);
    if (allowedDomains) {
      filter.domainId = { $in: allowedDomains };
    }

    const criticalCustomers = await Customer.find(filter)
      .select("name priority sentimentScore riskStatus sentimentHistory")
      .lean();

    const alerts = [];

    for (const customer of criticalCustomers) {
      const projects = await Project.find({ customerId: customer._id })
        .select("name status")
        .lean();

      for (const project of projects) {
        alerts.push({
          type: "RISK_ALERT",
          severity: "CRITICAL",
          timestamp:
            customer.sentimentHistory.length > 0
              ? customer.sentimentHistory[customer.sentimentHistory.length - 1]
                  .timestamp
              : customer.updatedAt,
          customer: {
            id: customer._id,
            name: customer.name,
            sentimentScore: customer.sentimentScore,
            riskStatus: customer.riskStatus,
          },
          project: {
            id: project._id,
            name: project.name,
            status: project.status,
          },
          message: `CRITICAL: Customer "${customer.name}" - Project "${project.name}" requires immediate attention. Sentiment score: ${customer.sentimentScore.toFixed(2)}`,
        });
      }
    }

    res.json({
      count: alerts.length,
      alerts: alerts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRiskDashboard,
  getCriticalAlerts,
};
