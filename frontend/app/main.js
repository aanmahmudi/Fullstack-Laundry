import { initRouter, navigate } from './core/router.js';
import { renderHeader } from './components/header.js';

function bootstrap() {
  renderHeader(document.getElementById('app-header'));
  initRouter({ outlet: document.getElementById('app-main') });
}

window.addEventListener('DOMContentLoaded', bootstrap);
// Navigasi awal ditangani oleh router
window.addEventListener('load', () => {
  // if (!location.hash) navigate('#/'); 
});