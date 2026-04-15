import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Color palette for vibrant charts
const palette = [
  'rgba(37,99,235,0.85)', // blue
  'rgba(124,58,237,0.88)', // purple
  'rgba(6,182,212,0.85)', // teal
  'rgba(16,185,129,0.85)', // green
  'rgba(249,115,22,0.88)', // orange
  'rgba(239,68,68,0.88)',  // red
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { boxWidth: 12, padding: 12 } },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    x: { ticks: { color: '#475569' } },
    y: { ticks: { color: '#475569' } }
  }
};

const Charts = ({ data }) => {

  if (!data || data.length === 0) {
    return <div className="card">Loading charts...</div>;
  }

  // =========================
  // 1. Closure Rate by Package
  // =========================
  const closureMap = {};

  data.forEach(rfi => {
    const pkg = rfi.package;

    if (!closureMap[pkg]) {
      closureMap[pkg] = { total: 0, closed: 0 };
    }

    closureMap[pkg].total++;

    if (rfi.closed_date && rfi.closed_date !== "") {
      closureMap[pkg].closed++;
    }
  });

  const closureLabels = Object.keys(closureMap);
  const closureValues = Object.values(closureMap).map(v => (v.closed / v.total) * 100);

  const closureData = {
    labels: closureLabels,
    datasets: [
      {
        label: "Closure Rate (%)",
        data: closureValues,
        backgroundColor: closureLabels.map((_, i) => palette[i % palette.length]),
        borderColor: closureLabels.map((_, i) => palette[i % palette.length]),
        borderWidth: 1,
      }
    ]
  };

  // =========================
  // 2. SLA Breach by Station
  // =========================
  const slaMap = {};

  data.forEach(rfi => {
    const station = rfi.station;

    if (!slaMap[station]) {
      slaMap[station] = 0;
    }

    if (rfi.closed_date && rfi.sla_deadline) {
      if (new Date(rfi.closed_date) < new Date(rfi.sla_deadline)) {
        slaMap[station]++;
      }
    }
  });

  const slaLabels = Object.keys(slaMap);
  const slaValues = Object.values(slaMap);

  const slaData = {
    labels: slaLabels,
    datasets: [
      {
        label: "SLA Breaches",
        data: slaValues,
        backgroundColor: slaLabels.map((_, i) => palette[i % palette.length]),
        borderColor: slaLabels.map((_, i) => palette[i % palette.length]),
        borderWidth: 1,
      }
    ]
  };

  // =========================
  // 3. Approval vs Rejection (Monthly)
  // =========================
  const monthlyMap = {};

  data.forEach(rfi => {
    if (!rfi.raised_date) return;

    const month = rfi.raised_date.slice(0, 7); // YYYY-MM

    if (!monthlyMap[month]) {
      monthlyMap[month] = { approved: 0, rejected: 0 };
    }

    if (rfi.result === "APPROVED" || rfi.result === "APPROVED_WITH_COMMENTS") {
      monthlyMap[month].approved++;
    } else if (rfi.result === "REJECTED") {
      monthlyMap[month].rejected++;
    }
  });

  const months = Object.keys(monthlyMap).sort();

  const approvalData = {
    labels: months,
    datasets: [
      {
        label: "Approved",
        data: months.map(m => monthlyMap[m].approved),
        backgroundColor: 'rgba(16,185,129,0.85)',
        borderColor: 'rgba(16,185,129,0.95)',
        tension: 0.3,
      },
      {
        label: "Rejected",
        data: months.map(m => monthlyMap[m].rejected),
        backgroundColor: 'rgba(239,68,68,0.85)',
        borderColor: 'rgba(239,68,68,0.95)',
        tension: 0.3,
      }
    ]
  };

  // =========================
  // 4. Contractor Performance (Rejection Rate)
  // =========================
  const contractorMap = {};

  data.forEach(rfi => {
    const ctr = rfi.contractor_id;

    if (!contractorMap[ctr]) {
      contractorMap[ctr] = { total: 0, rejected: 0 };
    }

    contractorMap[ctr].total++;

    if (rfi.result === "REJECTED") {
      contractorMap[ctr].rejected++;
    }
  });

  const contractorLabels = Object.keys(contractorMap);
  const contractorValues = Object.values(contractorMap).map(v => (v.rejected / v.total) * 100);

  const contractorData = {
    labels: contractorLabels,
    datasets: [
      {
        label: "Rejection Rate (%)",
        data: contractorValues,
        backgroundColor: contractorLabels.map((_, i) => palette[i % palette.length]),
        borderColor: contractorLabels.map((_, i) => palette[i % palette.length]),
        borderWidth: 1,
      }
    ]
  };

  // Small summary metrics used in explanation bars
  const totalRFIs = data.length;
  const avgClosureRate = closureValues.length ? (closureValues.reduce((a, b) => a + b, 0) / closureValues.length).toFixed(1) : '—';
  const totalSLABreaches = slaValues.reduce((a, b) => a + b, 0);
  const totalApproved = months.reduce((acc, m) => acc + (monthlyMap[m]?.approved || 0), 0);
  const totalRejected = months.reduce((acc, m) => acc + (monthlyMap[m]?.rejected || 0), 0);
  const avgContractorRej = contractorValues.length ? contractorValues.reduce((a, b) => a + b, 0) / contractorValues.length : 0;

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ display: "grid", gap: "20px" }}>

      <div className="charts-card card">
        <div className="section-header"><div className="section-title"><span className="icon-round">📦</span><div>Closure Rate by Package</div></div></div>
        <div className="chart-container" style={{height:260}}>
          <Bar data={closureData} options={chartOptions} />
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: 13 }}>Shows percentage of RFIs closed per package. Higher values mean faster resolution.</div>
          <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>Avg closure: {avgClosureRate}% • Total RFIs: {totalRFIs}</div>
        </div>
      </div>

      <div className="charts-card card">
        <div className="section-header"><div className="section-title"><span className="icon-round">🕒</span><div>SLA Breach by Station</div></div></div>
        <div className="chart-container" style={{height:260}}>
          <Bar data={slaData} options={chartOptions} />
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: 13 }}>Counts of RFIs that breached SLA per station. Investigate hotspots with high counts.</div>
          <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{totalSLABreaches} breaches total</div>
        </div>
      </div>

      <div className="charts-card card">
        <div className="section-header"><div className="section-title"><span className="icon-round">✅</span><div>Approval vs Rejection (Monthly)</div></div></div>
        <div className="chart-container" style={{height:260}}>
          <Line data={approvalData} options={chartOptions} />
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: 13 }}>Monthly approved vs rejected RFIs — useful to spot trends and seasonal issues.</div>
          <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>Approved: {totalApproved} • Rejected: {totalRejected}</div>
        </div>
      </div>

      <div className="charts-card card">
        <div className="section-header"><div className="section-title"><span className="icon-round">👷</span><div>Contractor Rejection Rate</div></div></div>
        <div className="chart-container" style={{height:260}}>
          <Pie data={contractorData} options={chartOptions} />
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: 13 }}>Rejection percentage by contractor. Use to track contractor quality and training needs.</div>
          <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>Avg rejection: {avgContractorRej.toFixed(1)}%</div>
        </div>
      </div>

    </div>
  );
};

export default Charts;