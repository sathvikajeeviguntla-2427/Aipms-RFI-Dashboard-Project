import React from "react";

const Alerts = ({ alerts }) => {

  if (!alerts) return null;

  const { slaAlerts = [], rejAlerts = [], summary = [] } = alerts;

  return (
    <div>
      <h3>Alerts</h3>

      {/* ========================= */}
      {/* SUMMARY */}
      {/* ========================= */}
      {summary.length > 0 && (
        <div>
          {summary.map((s, i) => (
            <div key={i} style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              background: "#f9f9f9"
            }}>
              <strong>INFO</strong>
              <p>{s.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* SLA ALERTS */}
      {/* ========================= */}
      {slaAlerts.map((a, i) => (
        <div key={i} style={{
          border: "1px solid red",
          padding: "10px",
          marginBottom: "10px"
        }}>
          <strong>CRITICAL</strong>
          <p>{a.message}</p>

          <small>
            Station: {a.station} <br />
            RFI: {a.id}
          </small>

          <p><strong>Action:</strong> Escalate and close immediately</p>
        </div>
      ))}

      {/* ========================= */}
      {/* REJECTION ALERTS */}
      {/* ========================= */}
      {rejAlerts.map((a, i) => (
        <div key={i} style={{
          border: "1px solid orange",
          padding: "10px",
          marginBottom: "10px"
        }}>
          <strong>WARNING</strong>
          <p>{a.message}</p>

          <small>
            Contractor: {a.key} <br />
            Rejected: {a.rejected} / {a.total}
          </small>

          <p><strong>Action:</strong> Review contractor performance</p>
        </div>
      ))}

      {/* ========================= */}
      {/* NO ALERTS */}
      {/* ========================= */}
      {slaAlerts.length === 0 && rejAlerts.length === 0 && summary.length === 0 && (
        <p>No alerts</p>
      )}

    </div>
  );
};

export default Alerts;