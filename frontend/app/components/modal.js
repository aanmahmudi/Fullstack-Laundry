export function ensureModalRoot() {
  let root = document.getElementById('modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    root.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-box" role="dialog" aria-modal="true" aria-live="assertive">
        <div class="modal-content"></div>
        <div class="modal-actions">
          <button class="btn" data-close>Tutup</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    root.addEventListener('click', (e) => {
      if (e.target && e.target.hasAttribute('data-close')) hideModal();
    });
  }
  return root;
}

export function showModal(message) {
  const root = ensureModalRoot();
  root.querySelector('.modal-content').textContent = message;
  root.classList.add('visible');
}

export function hideModal() {
  const root = document.getElementById('modal-root');
  if (root) root.classList.remove('visible');
}