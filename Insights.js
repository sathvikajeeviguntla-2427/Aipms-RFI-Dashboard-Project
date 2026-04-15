import React from "react";
import "./Insights.css";

const Insights = ({ data = [] }) => {
  if (!data || data.length === 0)
    return (
      <div className="card">
        <div className="section-title">
          <span className="icon">💡</span>
          <div>Insights</div>
        </div>
        <div className="section-sub">No data available</div>
      </div>
    );

  const total = data.length;
  const rejected = data.filter(
    (d) => (d.result || "").toUpperCase() === "REJECTED"
  ).length;
  const open = data.filter((d) => !d.closed_date).length;
  const breach = data.filter(
    (d) =>
      d.sla_deadline &&
      !d.closed_date &&
      new Date(d.sla_deadline) < Date.now()
  ).length;

  return (
    <div className="insights-grid">
      <div className="insights-card card">
        <h3>Key Metrics</h3>
        <div className="kpi-grid">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon">📦</div>
            <div>
              <div className="kpi-title">Total RFIs</div>
              <div className="kpi-value">{total}</div>
            </div>
          </div>

          <div className="kpi-card kpi-green">
            <div className="kpi-icon">🟢</div>
            <div>
              <div className="kpi-title">Open</div>
              <div className="kpi-value">{open}</div>
            </div>
          </div>

          <div className="kpi-card kpi-red">
            <div className="kpi-icon">❌</div>
            <div>
              <div className="kpi-title">Rejected</div>
              <div className="kpi-value">{rejected}</div>
            </div>
          </div>

          <div className="kpi-card kpi-amber">
            <div className="kpi-icon">⏰</div>
            <div>
              <div className="kpi-title">SLA Breach</div>
              <div className="kpi-value">{breach}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;