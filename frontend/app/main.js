import { initRouter, navigate } from './core/router.js?v=fix3';
import { renderHeader } from './components/header.js?v=fix3';

function bootstrap() {
  renderHeader(document.getElementById('app-header'));
  initRouter({ outlet: document.getElementById('app-main') });
}

window.addEventListener('DOMContentLoaded', bootstrap);
// Navigasi awal ditangani oleh router
window.addEventListener('load', () => {
  // if (!location.hash) navigate('#/'); 
});