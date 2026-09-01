import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LeadProvider } from './context/LeadContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LeadProvider>
          <App />
        </LeadProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
