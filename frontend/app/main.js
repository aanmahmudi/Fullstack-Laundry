import { initRouter, navigate } from './core/router.js?v=remon102';
import { renderHeader } from './components/header.js?v=remon102';

console.log('Main App v101 Loaded - FORCE UPDATE');

function bootstrap() {
  renderHeader(document.getElementById('app-header'));
  initRouter({ outlet: document.getElementById('app-main') });
}

window.addEventListener('DOMContentLoaded', bootstrap);
// Navigasi awal ditangani oleh router
window.addEventListener('load', () => {
  // if (!location.hash) navigate('#/'); 
});