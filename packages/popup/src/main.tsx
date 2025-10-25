import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import dev mocks only in development
if (import.meta.env.DEV) {
  import('./dev-mock');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
