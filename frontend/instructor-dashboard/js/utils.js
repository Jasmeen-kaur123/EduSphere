// HTML Escape
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// File Upload
document.getElementById('assignmentFile')?.addEventListener('change', (e) => {
  const fileName = e.target.files[0]?.name || 'No file chosen';
  console.log('File selected:', fileName);
});
