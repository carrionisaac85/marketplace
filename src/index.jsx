import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Privacy from './pages/Privacy';

const path = window.location.pathname.replace(/\/+$/, '');
const isPrivacy = path === '/privacy' || path.endsWith('/privacy.html');

ReactDOM.createRoot(document.getElementById('root')).render(
  isPrivacy ? <Privacy /> : <App />
);
