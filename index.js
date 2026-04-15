import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AIAssistant from './components/AI/AIAssistant';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/assistant" element={<AIAssistant embedded={true} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
