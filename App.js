import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from 'react-router-dom';

import Table from "./components/Table/Table";
import Filters from "./components/Filters/Filters";
import Charts from "./components/Charts/Charts";
import Alerts from "./components/Alerts/Alerts";
import Insights from "./components/Insights/Insights";
import AIAssistant from './components/AI/AIAssistant';

import Papa from "papaparse";
import { generateAlerts } from "./utils/ruleEngine";
import { predictSLABreach } from "./utils/predict";
import html2canvas from "html2canvas";
import { jsPDF } from 'jspdf';

function App() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    package: "",
    station: "",
    status: ""
  });
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // AI assistant control
  const [openAssistant, setOpenAssistant] = useState(false);

  const applySuggestion = (action) => {
    if (!action) return;
    if (action.type === 'filter') {
      setFilters((f) => ({ ...f, [action.key]: action.value }));
    }
    if (action.type === 'search') {
      setSearchTerm(action.value);
    }
    if (action.type === 'summary') {
      // simple summary action: open assistant with a prefilled prompt
      setOpenAssistant(true);
    }
  };

  // =========================
  // 🔥 EXPORT FUNCTION
  // =========================
  const exportDashboard = () => {
    // Capture the full page (including header/footer) by rendering the documentElement
    const element = document.documentElement;
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    html2canvas(element, { scale: 2, useCORS: true, windowWidth: width, windowHeight: height }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "rfi-dashboard.png";
      link.href = canvas.toDataURL();
      link.click();
    }).catch((err) => {
      console.error('PNG export failed', err);
      alert('PNG export failed. See console for details.');
    });
  };

  // =========================
  // 📄 EXPORT AS PDF (print-to-pdf fallback)
  // Uses html2canvas to capture the main element, opens a new window with the image
  // and triggers the browser print dialog — user can then choose "Save as PDF".
  // This avoids adding additional dependencies like jsPDF.
  // =========================
  const exportDashboardPDF = async () => {
    // Capture the whole document (header + main + footer)
    const element = document.documentElement;
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (!element) return;

    try {
      // capture at higher scale for clarity
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: width, windowHeight: height, allowTaint: false });

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate scale between canvas pixels and PDF points
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pxPerPt = canvasWidth / pdfWidth; // pixels per PDF point
      const pageHeightPx = Math.floor(pdfHeight * pxPerPt);

      let y = 0;
      let pageCount = 0;

      while (y < canvasHeight) {
        const chunkHeight = Math.min(pageHeightPx, canvasHeight - y);

        // create a temporary canvas to hold the page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = chunkHeight;
        const pageCtx = pageCanvas.getContext('2d');

        // draw the portion of the full canvas we need for this page
        pageCtx.drawImage(canvas, 0, y, canvasWidth, chunkHeight, 0, 0, canvasWidth, chunkHeight);

        // convert slice to image
        const imgData = pageCanvas.toDataURL('image/png');

        // calculate PDF height for this slice in points
        const pdfSliceHeight = chunkHeight / pxPerPt;

        if (pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfSliceHeight);

        y += chunkHeight;
        pageCount += 1;
      }

      pdf.save('rfi-dashboard.pdf');
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to prepare PDF. If the page contains cross-origin images, try running on a server or enable CORS for those resources.');
    }
  };

  // =========================
  // Load + Clean CSV Data
  // =========================
  useEffect(() => {
    fetch("/hackathon_rfi_dataset.csv")
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            let parsedData = result.data;

            // 🔥 DATA CLEANING
            parsedData = parsedData.filter((rfi) => {
              return (
                rfi.remarks &&
                rfi.remarks.length > 30 &&
                !rfi.remarks.toLowerCase().includes("template") &&
                !rfi.remarks.toLowerCase().includes("auto-generated") &&
                !rfi.remarks.toLowerCase().includes("stamp")
              );
            });

            setData(parsedData);
            setFilteredData(parsedData);

            // =========================
            // 🚨 RULE ENGINE
            // =========================
            let alertResults = generateAlerts(parsedData);

            let combined = [];

            // Handle both array and object outputs
            if (Array.isArray(alertResults)) {
              combined = alertResults;
            } else if (alertResults && typeof alertResults === "object") {
              if (Array.isArray(alertResults.slaAlerts))
                combined = combined.concat(alertResults.slaAlerts);

              if (Array.isArray(alertResults.rejAlerts))
                combined = combined.concat(alertResults.rejAlerts);

              if (Array.isArray(alertResults.summary))
                combined = combined.concat(alertResults.summary);
            }

            // =========================
            // 🔮 PREDICTION ALERT
            // =========================
            const risky = predictSLABreach(parsedData);

            if (risky.length > 0) {
              combined.push({
                severity: "WARNING",
                type: "prediction",
                message: `${risky.length} RFIs likely to breach SLA soon`,
                rfis: risky.map((r) => r.rfi_id),
                action: "Prioritize inspection before deadline"
              });
            }

            setAlerts(combined);
          }
        });
      });
  }, []);

  // =========================
  // Apply Filters
  // =========================
  useEffect(() => {
    let temp = [...data];

    if (filters.package) {
      temp = temp.filter((d) => d.package === filters.package);
    }

    if (filters.station) {
      temp = temp.filter((d) => d.station === filters.station);
    }

    if (filters.status) {
      temp = temp.filter((d) => d.result === filters.status);
    }

    // free text search across common fields
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      temp = temp.filter((d) => {
        return (
          (d.activity_name || '').toString().toLowerCase().includes(q) ||
          (d.remarks || '').toString().toLowerCase().includes(q) ||
          (d.rfi_id || '').toString().toLowerCase().includes(q)
        );
      });
    }

    setFilteredData(temp);
  }, [filters, data, searchTerm]);

  // =========================
  // Extract Unique Values
  // =========================
  const uniquePackages = [...new Set(data.map((d) => d.package))];
  const uniqueStations = [...new Set(data.map((d) => d.station))];
  const uniqueStatus = [...new Set(data.map((d) => d.result))];

  // =========================
  // Render
  // =========================
  return (
    <div>
      <header className="header">
        <div className="brand">
          <div className="logo" />
          <h1>RFI Dashboard</h1>
        </div>

        <div className="header-controls">
          <input
            className="search"
            type="search"
            placeholder="Search RFIs, activity or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="action-btn" onClick={exportDashboard}>📥 Export</button>
          <button className="action-btn" onClick={exportDashboardPDF} style={{ marginLeft: 8 }}>📄 Download PDF</button>

          <button className="action-btn" onClick={() => navigate('/assistant')} style={{ marginLeft: 8 }}>🤖 Assistant</button>

          <div style={{ width:34, height:34, borderRadius:8, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)', fontWeight:700 }}>JD</div>
        </div>
      </header>

      <div className="app-root">

        {/* Single-column Main Content */}
        <main className="main container">

          {/* 1. KPI Summary (Insights) */}
          <section className="section">
            <div className="card">
              <div className="section-header">
                <div className="section-title"><span className="icon-round">📊</span><div>Key Metrics</div></div>
              </div>
              <Insights data={filteredData} />
            </div>
          </section>

          {/* 2. Filters (keep as a full-width card) */}
          <section className="section">
            <div className="card">
              <div className="section-header">
                <div className="section-title"><span className="icon-round">⚙️</span><div>Filters</div></div>
              </div>
              <Filters
                filters={filters}
                setFilters={setFilters}
                packages={uniquePackages}
                stations={uniqueStations}
                statuses={uniqueStatus}
              />
            </div>
          </section>

          {/* 3. Alerts */}
          <section className="section">
            <div className="card">
              <div className="section-header">
                <div className="section-title"><span className="icon-round">🚨</span><div>Alerts</div></div>
              </div>

              <Alerts alerts={alerts} />
            </div>
          </section>

          {/* 4. Charts - each chart rendered inside its own card by Charts component */}
          <section className="section">
            <div className="section-header">
              <div className="section-title"><span className="icon-round">📈</span><div>Charts</div></div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <Charts data={filteredData} />
            </div>
          </section>

          {/* 5. Table */}
          <section className="section">
            <div className="card">
              <div className="section-header">
                <div className="section-title"><span className="icon-round">📋</span><div>Data Table</div></div>
              </div>
              <Table data={filteredData} aiAssistantControl={{ openAssistant, setOpenAssistant, applySuggestion }} />
            </div>
          </section>

        </main>
      </div>
     <AIAssistant open={openAssistant} onClose={() => setOpenAssistant(false)} data={data} applySuggestion={applySuggestion} />
    </div>
  );
}

export default App;