import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler to catch silent crashes
window.onerror = function(msg, url, line, col, error) {
  document.getElementById('root').innerHTML = `
    <div style="padding:20px;color:white;background:#05060f;min-height:100vh;font-family:monospace;">
      <h2 style="color:#ec4899;">App Error</h2>
      <pre style="color:#a855f7;white-space:pre-wrap;font-size:12px;">${msg}\n${url}:${line}:${col}</pre>
      <pre style="color:#6366f1;white-space:pre-wrap;font-size:11px;">${error?.stack || ''}</pre>
    </div>
  `;
  return false;
};

window.addEventListener('unhandledrejection', function(e) {
  document.getElementById('root').innerHTML = `
    <div style="padding:20px;color:white;background:#05060f;min-height:100vh;font-family:monospace;">
      <h2 style="color:#ec4899;">Promise Error</h2>
      <pre style="color:#a855f7;white-space:pre-wrap;font-size:12px;">${e.reason}</pre>
    </div>
  `;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
