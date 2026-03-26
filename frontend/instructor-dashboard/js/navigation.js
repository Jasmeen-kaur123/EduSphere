// Section Navigation
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-item');

  // Hide all sections
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.add('active');
  }

  // Update navbar active state
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === sectionId) {
      item.classList.add('active');
    }
  });

  if (typeof window.logInstructorVisit === 'function') {
    window.logInstructorVisit(sectionId);
  }
}

// Initialize navigation
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.section;
      showSection(sectionId);
    });
  });
}

// Profile Nav Click - Go to Profile Section
document.getElementById('profileNav')?.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('profile');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
