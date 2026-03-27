// Check authentication and role
window.addEventListener('load', function() {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  if (!token || role !== 'instructor') {
    window.location.href = '/pages/login.html';
  }
});

// Global user role (set to 'instructor' for this dashboard)
const currentUserRole = 'instructor';

// Main App Initialization
function initializeApp() {
    // Ensure Add Question button in exam modal works
    setTimeout(() => {
      if (typeof initExamQuestionControls === 'function') {
        initExamQuestionControls();
      }
    }, 500);
  // Remove duplicate #examModal if present
  const allExamModals = document.querySelectorAll('#examModal');
  if (allExamModals.length > 1) {
    // Keep the first, remove the rest
    for (let i = 1; i < allExamModals.length; i++) {
      allExamModals[i].parentNode.removeChild(allExamModals[i]);
    }
  }
  
  // Initialize navigation
  initializeNavigation();

  // Modal Event Listeners
  const createCourseBtn = document.getElementById('createCourseBtn');
  if (createCourseBtn) {
    createCourseBtn.addEventListener('click', () => {
      openCourseModal('create');
    });
  }
  const createAssignmentBtn = document.getElementById('createAssignmentBtn');
  if (createAssignmentBtn) {
    createAssignmentBtn.addEventListener('click', () => {
      openAssignmentModal('create');
    });
  }
  const createExamBtn = document.getElementById('createExamBtn');
  if (createExamBtn) {
    createExamBtn.addEventListener('click', () => {
      openExamModal('create');
    });
  }

  // Set default section
  showSection('dashboard');

  // Render dashboard stats and chart after modular load
  if (typeof window.renderDashboardStats === 'function') {
    window.renderDashboardStats();
  }
  if (typeof window.renderCourses === 'function') {
    window.renderCourses();
  }

  // Initialize all managers
  setupGlobalSearch();
  initializeCourseForm();
  initializeAssignmentForm();
  initializeExamForm();
  initializeProfileForm();
  initNotificationBell();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Set dashboard as default view
  showSection('dashboard');

  // Load stored data
  await loadCoursesFromStorage();
  await loadStudentsFromStorage();
  await loadAssignmentsFromStorage();
  await loadExamsFromStorage();

  // Initialize the app
  initializeApp();

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape key to close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  console.log('Dashboard initialized successfully!');
});

// Responsive sidebar toggle for mobile (optional enhancement)
function createMobileMenuToggle() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (window.innerWidth <= 768) {
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '☰';
    toggleBtn.className = 'mobile-menu-toggle';
    
    const style = document.createElement('style');
    style.textContent = `
      .mobile-menu-toggle {
        display: none;
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 999;
        background: #6C4AB6;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 18px;
      }

      @media (max-width: 768px) {
        .mobile-menu-toggle {
          display: block;
        }
      }
    `;
    
    if (!document.querySelector('style[data-mobile-menu]')) {
      style.setAttribute('data-mobile-menu', 'true');
      document.head.appendChild(style);
    }
  }
}

createMobileMenuToggle();
