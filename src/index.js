import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global styles (if any)
import App from './App'; // Import the App component

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
