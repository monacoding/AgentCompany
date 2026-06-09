import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { bootstrapVoiceShortcutSync } from './voice-shortcut-sync';
import './styles.css';
import './dashboard/dashboard.css';

bootstrapVoiceShortcutSync();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
