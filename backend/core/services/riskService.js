/**
 * Risk Assessment Service
 * Handles customer sentiment updates and risk status calculations.
 */

/**
 * Calculate risk status based on sentiment score
 * @param {number} sentimentScore - The sentiment score (-1 to +1)
 * @returns {string} - 'stable', 'warning', or 'critical'
 */
function calculateRiskStatus(sentimentScore) {
  if (sentimentScore === null || sentimentScore === undefined) {
    return "stable";
  }

  // Risk thresholds
  if (sentimentScore <= -0.6) {
    return "critical"; // Very negative sentiment
  } else if (sentimentScore <= -0.3) {
    return "warning"; // Moderately negative sentiment
  } else {
    return "stable"; // Neutral or positive sentiment
  }
}

/**
 * Update customer sentiment with new score (weighted average)
 * @param {Object} customer - Mongoose customer document
 * @param {number} newScore - New sentiment score to add
 */
function updateCustomerSentiment(customer, newScore) {
  // Add to history
  customer.sentimentHistory.push({
    score: newScore,
    timestamp: new Date(),
  });

  // Keep only last 10 entries for rolling average
  if (customer.sentimentHistory.length > 10) {
    customer.sentimentHistory = customer.sentimentHistory.slice(-10);
  }

  // Calculate weighted average (recent scores weighted more)
  let totalWeight = 0;
  let weightedSum = 0;

  customer.sentimentHistory.forEach((entry, index) => {
    const weight = index + 1; // Linear weighting: older = less weight
    weightedSum += entry.score * weight;
    totalWeight += weight;
  });

  customer.sentimentScore = weightedSum / totalWeight;
  customer.riskStatus = calculateRiskStatus(customer.sentimentScore);
}

/**
 * Generate alert if customer risk crosses threshold
 * @param {Object} customer - Customer document
 * @param {Object} project - Project document
 * @returns {Object|null} - Alert object or null
 */
function generateAlertIfNeeded(customer, project) {
  if (customer.riskStatus === "critical") {
    const alert = {
      type: "RISK_ALERT",
      severity: "CRITICAL",
      timestamp: new Date().toISOString(),
      customer: {
        id: customer._id,
        name: customer.name,
        sentimentScore: customer.sentimentScore,
        riskStatus: customer.riskStatus,
      },
      project: {
        id: project._id,
        name: project.name,
      },
      message: `CRITICAL: Customer "${customer.name}" - Project "${project.name}" requires immediate attention. Sentiment score: ${customer.sentimentScore.toFixed(2)}`,
    };

    console.log("\n🚨 RISK ALERT GENERATED:", JSON.stringify(alert, null, 2));
    return alert;
  } else if (customer.riskStatus === "warning") {
    const alert = {
      type: "RISK_ALERT",
      severity: "WARNING",
      timestamp: new Date().toISOString(),
      customer: {
        id: customer._id,
        name: customer.name,
        sentimentScore: customer.sentimentScore,
        riskStatus: customer.riskStatus,
      },
      project: {
        id: project._id,
        name: project.name,
      },
      message: `WARNING: Customer "${customer.name}" - Project "${project.name}" showing negative sentiment. Sentiment score: ${customer.sentimentScore.toFixed(2)}`,
    };

    console.log("\n⚠️  RISK ALERT GENERATED:", JSON.stringify(alert, null, 2));
    return alert;
  }

  return null;
}

module.exports = {
  calculateRiskStatus,
  updateCustomerSentiment,
  generateAlertIfNeeded,
};
