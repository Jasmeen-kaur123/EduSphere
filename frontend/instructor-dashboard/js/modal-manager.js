// Modal Management
function openModal(modalId) {
  closeAllModals();
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

// Use delegated modal close handling so dynamically injected modals work too.
document.addEventListener('click', (e) => {
  const closeTrigger = e.target.closest('.modal-close, .modal-close-btn');
  if (closeTrigger) {
    const modal = closeTrigger.closest('.modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
    return;
  }

  const cancelButton = e.target.closest('button');
  if (cancelButton) {
    const buttonText = (cancelButton.textContent || '').trim().toLowerCase();
    if (buttonText === 'cancel') {
      const modal = cancelButton.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        return;
      }
    }
  }

  const modal = e.target.classList && e.target.classList.contains('modal') ? e.target : null;
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});
