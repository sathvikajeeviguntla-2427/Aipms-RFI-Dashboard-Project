import React from 'react';
import './Filters.css';

const Filters = ({ filters = {}, setFilters = () => {}, packages = [], stations = [], statuses = [] }) => {
  const update = (changes) => setFilters({ ...filters, ...changes });

  return (
    <div className="filters-card">
      <h3>Filters</h3>

      <div className="filter-row">
        <label>Package</label>
        <select value={filters.package || ''} onChange={(e) => update({ package: e.target.value })}>
          <option value="">All</option>
          {packages.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label>Station</label>
        <select value={filters.station || ''} onChange={(e) => update({ station: e.target.value })}>
          <option value="">All</option>
          {stations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label>Status</label>
        <select value={filters.status || ''} onChange={(e) => update({ status: e.target.value })}>
          <option value="">All</option>
          {statuses.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => setFilters({ package: '', station: '', status: '' })}>Reset</button>
      </div>
    </div>
  );
};

export default Filters;
