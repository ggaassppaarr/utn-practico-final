// src/main.jsx
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.jsx';
import { initTheme } from './theme'; // 👈 nuevo

// Aplica dark/light al <html> antes de renderizar React
initTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
