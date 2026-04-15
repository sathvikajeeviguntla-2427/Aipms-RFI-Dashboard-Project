import React, { useMemo, useState, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Papa from 'papaparse';

// Lightweight AI Assistant that works offline (mock suggestions) and can optionally call an API
const safeText = (s) => (s ? String(s) : '');

const extractTop = (arr, key, n = 3) => {
  const counts = {};
  arr.forEach((r) => {
    const v = safeText(r[key]);
    if (!v) return;
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map((a) => a[0]);
};

const makeSuggestions = (data) => {
  if (!data || !data.length) {
    return [
      { id: 'no-data', title: 'No data available', desc: 'Upload or load dataset to get contextual suggestions.' },
    ];
  }

  const topPackages = extractTop(data, 'package', 3);
  const topStations = extractTop(data, 'station', 3);

  const suggestions = [];

  if (topPackages.length) {
    topPackages.forEach((p, i) =>
      suggestions.push({
        id: `pkg-${i}`,
        title: `Filter to package: ${p}`,
        desc: `Show RFIs for package ${p}`,
        action: { type: 'filter', key: 'package', value: p },
      })
    );
  }

  if (topStations.length) {
    topStations.forEach((s, i) =>
      suggestions.push({
        id: `st-${i}`,
        title: `Filter to station: ${s}`,
        desc: `Show RFIs for station ${s}`,
        action: { type: 'filter', key: 'station', value: s },
      })
    );
  }

  suggestions.push({
    id: 'search-remarks',
    title: 'Search remarks for common issues',
    desc: 'Run a global search across remarks for likely causes',
    action: { type: 'search', value: 'leak OR contamination OR misalignment' },
  });

  suggestions.push({
    id: 'summarize',
    title: 'Summarize recent remarks',
    desc: 'Generate a short summary of common themes in the remarks',
    action: { type: 'summary' },
  });

  suggestions.push({
    id: 'predict',
    title: 'Show potential SLA breaches',
    desc: 'Filter RFIs that are likely to breach SLA according to current predictions',
    action: { type: 'search', value: 'likely to breach' },
  });

  return suggestions;
};

const AssistantBody = ({ data, prompt, setPrompt, loading, response, handleSend, suggestions, handleApply, handleUploadClick, uploadedName, clearUpload }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, height: '100%' }}>
    <Box sx={{ overflow: 'auto', p: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--muted)' }}>Recommended questions</Typography>
      <List dense>
        <ListItem button onClick={() => handleSend('Summarize recent remarks')} sx={{ borderRadius: 1, '&:hover': { background: 'rgba(15,23,42,0.03)' } }}>
          <ListItemText primary="Summarize recent remarks" secondary="Short summary of common themes in the remarks" />
        </ListItem>
        <ListItem button onClick={() => handleSend('Which packages have the most RFIs?')} sx={{ borderRadius: 1, '&:hover': { background: 'rgba(15,23,42,0.03)' } }}>
          <ListItemText primary="Which packages have the most RFIs?" secondary="Top packages by count" />
        </ListItem>
        <ListItem button onClick={() => handleSend('Show stations with highest rejection rates')} sx={{ borderRadius: 1, '&:hover': { background: 'rgba(15,23,42,0.03)' } }}>
          <ListItemText primary="Stations with highest rejection rates" secondary="Identify hotspots by station" />
        </ListItem>
        <ListItem button onClick={() => handleSend('List top keywords in remarks')} sx={{ borderRadius: 1, '&:hover': { background: 'rgba(15,23,42,0.03)' } }}>
          <ListItemText primary="Top keywords in remarks" secondary="Find frequent remark keywords" />
        </ListItem>
      </List>

      <Divider sx={{ my: 1 }} />

      <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--muted)' }}>Quick suggestions</Typography>
      <List dense>
        {suggestions.map((s) => (
          <ListItem key={s.id} button onClick={() => handleApply(s)} sx={{ borderRadius: 1, '&:hover': { background: 'rgba(15,23,42,0.03)' } }}>
            <ListItemText primary={s.title} secondary={s.desc} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button variant="outlined" onClick={handleUploadClick} size="small" sx={{ borderRadius: 1, textTransform: 'none' }}>
          Upload CSV for assistant
        </Button>
        {uploadedName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'var(--muted)' }}>{uploadedName}</Typography>
            <Button size="small" onClick={clearUpload} sx={{ textTransform: 'none' }}>Clear</Button>
          </Box>
        )}
      </Box>
    </Box>

    <Box sx={{ borderLeft: '1px solid rgba(0,0,0,0.06)', pl: 2, overflow: 'auto' }}>
      <Typography variant="subtitle2" sx={{ color: 'var(--muted)' }}>Response</Typography>
      <Box sx={{ mt: 1, minHeight: 120, whiteSpace: 'pre-wrap' }}>
        {loading && <Typography variant="body2" color="text.secondary">Thinking…</Typography>}
        {!loading && !response && (
          <Typography variant="body2" color="text.secondary">No response yet — send a prompt or click a suggestion.</Typography>
        )}
        {response && (
          <Box sx={{ background: 'linear-gradient(180deg,#fff,#fbfdff)', p: 2, borderRadius: 1, boxShadow: 'var(--shadow-1)' }}>
            <Typography variant="body2">{response}</Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  navigator.clipboard?.writeText(response).catch(() => {});
                }}
              >
                Copy
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  </Box>
);

const AIAssistant = ({ open = false, onClose = () => {}, data = [], applySuggestion = () => {}, embedded = false }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [uploadedName, setUploadedName] = useState('');
  const combinedData = useMemo(() => (uploadedData && uploadedData.length ? uploadedData : data), [uploadedData, data]);
  const suggestions = useMemo(() => makeSuggestions(combinedData), [combinedData]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const drawerInputRef = useRef(null);
  const embedInputRef = useRef(null);

  const handleApply = (sugg) => {
    if (!sugg) return;
    if (sugg.action) applySuggestion(sugg.action);
  };

  const handleUploadClick = (inputRef) => {
    // inputRef is a React ref to the hidden file input; clicking it opens file picker
    const el = (inputRef && inputRef.current) || null;
    if (!el) return;
    el.click();
  };

  // single onChange handler used by both hidden file inputs
  const handleFileSelected = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setUploadedData(res.data || []);
        setUploadedName(file.name || 'Uploaded dataset');
        setResponse(`Loaded ${res.data ? res.data.length : 0} rows into assistant`);
      },
    });
    // clear the input so same file can be re-selected if needed
    e.target.value = null;
  };

  const clearUpload = () => {
    setUploadedData([]);
    setUploadedName('');
    setResponse(null);
  };

  const handleSend = async (overridePrompt) => {
    const usePrompt = overridePrompt || prompt;
    if (!usePrompt || !usePrompt.trim()) return;
    setLoading(true);
    setResponse(null);

    // Try to call external API only if env key present (set REACT_APP_OPENAI_KEY at build time)
    const key = process.env.REACT_APP_OPENAI_KEY;
    try {
      if (key) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: usePrompt }],
            max_tokens: 400,
          }),
        });
        const json = await res.json();
        const txt = json?.choices?.[0]?.message?.content || JSON.stringify(json);
        setResponse(txt);
      } else {
        // Fallback: simple local mock responses using combinedData
        const p = (usePrompt || '').toLowerCase();
        if (p.includes('summarize')) {
          const sample = combinedData.slice(0, 8).map((d) => safeText(d.remarks)).join(' ');
          setResponse('Short summary: ' + sample.slice(0, 600) + (sample.length > 600 ? '…' : ''));
        } else if (p.includes('which packages') || p.includes('packages have the most')) {
          const tops = extractTop(combinedData, 'package', 8);
          setResponse('Top packages: ' + tops.join(', '));
        } else if (p.includes('stations') || p.includes('station')) {
          const tops = extractTop(combinedData, 'station', 8);
          setResponse('Top stations: ' + tops.join(', '));
        } else if (p.includes('keywords') || p.includes('keywords in remarks') || p.includes('top keywords')) {
          // quick keyword extraction from remarks
          const txt = combinedData.map((d) => safeText(d.remarks)).join(' ').toLowerCase();
          const words = txt.split(/[^a-zA-Z]+/).filter((w) => w.length > 4);
          const freq = {};
          words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
          const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map((a) => a[0]);
          setResponse('Top keywords: ' + top.join(', '));
        } else {
          setResponse('Mock reply: try one of the recommended questions or upload a dataset for richer suggestions.');
        }
      }
    } catch (err) {
      setResponse('Error: ' + (err.message || String(err)));
    }

    setLoading(false);
  };

  // If embedded, render as an inline Card
  if (embedded) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">AI Assistant</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Local-only" size="small" />
              <IconButton size="small" onClick={onClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ my: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask about the data, e.g. 'Summarize recent remarks'"
              size="small"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ background: 'var(--surface)', borderRadius: 1 }}
            />
            <Button variant="contained" onClick={() => handleSend()} disabled={loading} sx={{ background: 'linear-gradient(90deg,var(--primary),var(--accent))', color: '#fff', textTransform: 'none' }}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Send'}
            </Button>
            <input id="ai-upload-input-embed" ref={embedInputRef} onChange={handleFileSelected} type="file" accept=".csv,text/csv" style={{ display: 'none' }} />
            <Button size="small" onClick={() => handleUploadClick(embedInputRef)} sx={{ textTransform: 'none' }}>Upload</Button>
          </Stack>

          <AssistantBody data={combinedData} prompt={prompt} setPrompt={setPrompt} loading={loading} response={response} handleSend={handleSend} suggestions={suggestions} handleApply={handleApply} handleUploadClick={() => embedInputRef.current?.click()} uploadedName={uploadedName} clearUpload={clearUpload} />
        </CardContent>
      </Card>
    );
  }

  // default to Drawer behavior
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '92%', sm: 520 }, p: 3, background: 'var(--surface)', borderRadius: 2, boxShadow: 'var(--shadow-2)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">AI Assistant</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField
          fullWidth
          placeholder="Ask about the data, e.g. 'Summarize recent remarks'"
          size="small"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ background: 'var(--surface)', borderRadius: 1 }}
        />
        <Button variant="contained" onClick={() => handleSend()} disabled={loading} sx={{ background: 'linear-gradient(90deg,var(--primary),var(--accent))', color: '#fff', textTransform: 'none' }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Send'}
        </Button>
        <input id="ai-upload-input" ref={drawerInputRef} onChange={handleFileSelected} type="file" accept=".csv,text/csv" style={{ display: 'none' }} />
        <Button size="small" onClick={() => handleUploadClick(drawerInputRef)} sx={{ textTransform: 'none' }}>Upload CSV</Button>
      </Stack>

      <AssistantBody data={combinedData} prompt={prompt} setPrompt={setPrompt} loading={loading} response={response} handleSend={handleSend} suggestions={suggestions} handleApply={handleApply} handleUploadClick={() => drawerInputRef.current?.click()} uploadedName={uploadedName} clearUpload={clearUpload} />

      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Chip label="Local-only" size="small" />
        <Button size="small" onClick={onClose}>Close</Button>
      </Box>
    </Drawer>
  );
};

export default AIAssistant;
