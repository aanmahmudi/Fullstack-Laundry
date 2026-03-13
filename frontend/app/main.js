import { initRouter, navigate } from './core/router.js?v=remon118';
import { renderHeader } from './components/header.js?v=remon120';

console.log('Main App v120 Loaded - FORCE UPDATE');

function bootstrap() {
  renderHeader(document.getElementById('app-header'));
  initRouter({ outlet: document.getElementById('app-main') });
}

window.addEventListener('DOMContentLoaded', bootstrap);
// Navigasi awal ditangani oleh router
window.addEventListener('load', () => {});
