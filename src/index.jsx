import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const path = window.location.pathname.replace(/\/+$/, '');
const isPrivacy = path === '/privacy' || path.endsWith('/privacy.html');
const isTerms = path === '/terms' || path.endsWith('/terms.html');

ReactDOM.createRoot(document.getElementById('root')).render(
  isPrivacy ? <Privacy /> : isTerms ? <Terms /> : <App />
);
