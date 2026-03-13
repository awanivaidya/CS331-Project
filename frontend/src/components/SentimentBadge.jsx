export default function SentimentBadge({ score = 0, riskStatus }) {
  let cls = "neutral";
  let label = "Neutral";

  if (riskStatus === "critical" || score <= -0.6) {
    cls = "critical";
    label = "Critical";
  } else if (riskStatus === "warning" || score <= -0.3) {
    cls = "warning";
    label = "Warning";
  } else if (score >= 0.5) {
    cls = "positive";
    label = "Positive";
  }

  return (
    <span className={`badge ${cls}`}>
      {label} ({Number(score).toFixed(2)})
    </span>
  );
}
