import { initRouter, navigate } from './core/router.js?v=20251228';
import { renderHeader } from './components/header.js?v=20251228';

function bootstrap() {
  renderHeader(document.getElementById('app-header'));
  initRouter({ outlet: document.getElementById('app-main') });
}

window.addEventListener('DOMContentLoaded', bootstrap);
// Navigasi awal ke hash saat ini atau beranda
window.addEventListener('load', () => {
  if (!location.hash) navigate('#/');
});