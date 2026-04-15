# 🚀 RFI Dashboard – Intelligent Project Monitoring System

## 📊 Overview
The **RFI Dashboard** is a modern web-based analytics platform designed to monitor, analyze, and predict project performance using RFI (Request for Inspection) data.

It transforms raw CSV data into **actionable insights**, enabling engineers and project managers to identify risks, track performance, and improve decision-making.

---

## ✨ Key Features

### 📈 Data Visualization
- Closure Rate by Package
- SLA Breach Analysis by Station
- Approval vs Rejection Trends
- Contractor Rejection Rates

---

### 🚨 Smart Alerts Engine
- Detects SLA breaches (open & delayed RFIs)
- Identifies high rejection rates
- Flags repeated rejection patterns
- Displays categorized alerts (Critical, Warning, Info)

---

### 🔮 Predictive Analytics
- Predicts RFIs likely to breach SLA
- Helps prioritize critical tasks proactively

---

### 🤖 AI Insights Panel
- Provides project-level summaries
- Highlights key risks and delays
- Generates human-readable insights

---

### 🧠 Text Analysis
- Extracts frequent keywords from remarks
- Identifies recurring defects/issues

---

### 🔍 Filters & Search
- Filter by Package, Station, Status
- Easy data exploration

---

### 📥 Export Feature
- Export full dashboard as image (PNG)
- Enables reporting and sharing

---

### 🎨 Modern UI
- Clean vertical layout
- Card-based design
- Responsive and user-friendly interface

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Charts:** Chart.js, react-chartjs-2
- **CSV Parsing:** PapaParse
- **Export:** html2canvas
- **Styling:** CSS (custom modern UI)

---

## 📂 Project Structure


src/
│
├── components/
│ ├── Table/
│ ├── Filters/
│ ├── Charts/
│ ├── Alerts/
│ ├── Insights/
│
├── utils/
│ ├── ruleEngine.js
│ ├── predict.js
│ ├── textAnalysis.js
│
├── App.js
├── App.css


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone <your-repo-link>
cd rfi-dashboard
2️⃣ Install dependencies
npm install
3️⃣ Run the application
npm start
4️⃣ Open in browser
http://localhost:3000
📊 Dataset
Input: CSV file (hackathon_rfi_dataset.csv)
Contains RFI records including:
ID
Package
Station
Dates
Status
Remarks


## 🧠 How It Works
CSV data is loaded and parsed using PapaParse
Data is cleaned and filtered
Rule engine analyzes patterns and generates alerts
Prediction module identifies upcoming risks
Charts and insights visualize key metrics


## 🚀 Future Enhancements
AI Chat Assistant for querying data
Dark mode toggle
Real-time data integration
Drill-down analytics
Role-based access control

## 📌 Conclusion

The RFI Dashboard is not just a visualization tool, but a decision-support system that enhances project monitoring through data intelligence and predictive insights.