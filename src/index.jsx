import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

if ('serviceWorker' in navigator) {
  if (isNative) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister().catch(() => {}));
    }).catch(() => {});
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k).catch(() => {}))).catch(() => {});
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    });
  }
}

const path = window.location.pathname.replace(/\/+$/, '');
const isPrivacy = path === '/privacy' || path.endsWith('/privacy.html');
const isTerms = path === '/terms' || path.endsWith('/terms.html');

ReactDOM.createRoot(document.getElementById('root')).render(
  isPrivacy ? <Privacy /> : isTerms ? <Terms /> : <App />
);
