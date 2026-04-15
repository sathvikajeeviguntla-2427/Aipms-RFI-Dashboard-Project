import { useState, useCallback } from 'react';
import Papa from 'papaparse';

/**
 * useCsvParser - a small hook to parse CSV files with PapaParse and keep rows in state.
 * Returns: { data, setData, loading, error, parseFile, handleFileChange }
 */
export function useCsvParser() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseFile = useCallback((file, options = {}) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const { header = true, skipEmptyLines = true, dynamicTyping = false } = options;

    Papa.parse(file, {
      header,
      skipEmptyLines,
      dynamicTyping,
      complete: (results) => {
        // results.data is an array of objects when `header: true`
        setData(results.data || []);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e?.target?.files && e.target.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  return { data, setData, loading, error, parseFile, handleFileChange };
}

/**
 * CSVUpload - a tiny component that renders a file input and uses the hook to parse CSV.
 * Props:
 *  - onData(rows) optional callback when parsing completes
 */
export function CSVUpload({ onData }) {
  const { data, loading, error, handleFileChange } = useCsvParser();

  // notify parent when data changes
  if (onData && data && data.length) {
    // call onData asynchronously to avoid render-loop issues
    setTimeout(() => onData(data), 0);
  }

  return (
    // Note: this file contains no JSX import because this file may be imported into other files that already have React in scope.
    // If using in environments that require React in scope, ensure React is imported where you use <CSVUpload />.
    <div style={{ marginBottom: 12 }}>
      <label style={{ marginRight: 8 }}>Upload CSV:</label>
      <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
      {loading && <div style={{ color: '#666', marginTop: 8 }}>Parsing...</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>Error parsing CSV</div>}
    </div>
  );
}
