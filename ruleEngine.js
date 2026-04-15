export const generateAlerts = (data) => {
  const alerts = [];
  const today = new Date();

  // 🚨 Rule 1: Open RFIs beyond SLA
  const overdue = data.filter(rfi =>
    !rfi.closed_date &&
    new Date(rfi.sla_deadline) < today
  );

  if (overdue.length > 0) {
    alerts.push({
      severity: "CRITICAL",
      message: `${overdue.length} RFIs are overdue past SLA`,
      rfis: overdue.map(r => r.rfi_id)
    });
  }

  // ⚠️ Rule 2: Same activity rejected 3+ times
  const activityMap = {};

  data.forEach(rfi => {
    if (rfi.result === "REJECTED") {
      const key = rfi.activity_name + "_" + rfi.station;

      if (!activityMap[key]) {
        activityMap[key] = [];
      }

      activityMap[key].push(rfi.rfi_id);
    }
  });

  Object.entries(activityMap).forEach(([key, rfis]) => {
    if (rfis.length >= 3) {
      alerts.push({
        severity: "WARNING",
        message: `Repeated rejections for activity: ${key}`,
        rfis: rfis
      });
    }
  });

  // ⚠️ Rule 3: Station rejection rate > 30%
  const stationMap = {};

  data.forEach(rfi => {
    const station = rfi.station;

    if (!stationMap[station]) {
      stationMap[station] = { total: 0, rejected: 0 };
    }

    stationMap[station].total++;

    if (rfi.result === "REJECTED") {
      stationMap[station].rejected++;
    }
  });

  Object.entries(stationMap).forEach(([station, stats]) => {
    const rate = stats.rejected / stats.total;

    if (rate > 0.3) {
      alerts.push({
        severity: "WARNING",
        message: `${station} has high rejection rate (${(rate * 100).toFixed(1)}%)`,
        rfis: data
          .filter(r => r.station === station && r.result === "REJECTED")
          .map(r => r.rfi_id)
      });
    }
  });

  return alerts;
};