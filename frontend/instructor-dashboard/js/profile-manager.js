// Profile Form Submission
function initializeProfileForm() {
  document.querySelectorAll('.profile-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const phone = document.querySelector('.profile-form input[type="tel"]')?.value;
      const bio = document.querySelector('.profile-form textarea')?.value;
      
      // Save to localStorage for persistence (simulated backend)
      const profileData = {
        name: 'Jasmeen',
        email: 'jasmeen@edusphere.com',
        phone: phone,
        bio: bio,
        lastUpdated: new Date().toLocaleString()
      };
      
      localStorage.setItem('instructorProfile', JSON.stringify(profileData));
      
      showNotification('✓ Profile updated successfully! Changes saved.', 'success');
      e.target.reset();
    });
  });
}

// Edit Profile Button - Make it functional
document.getElementById('editProfileModal')?.addEventListener('click', () => {
  showNotification('Profile edit form is now visible below. Update your information and click Save Changes.', 'info');
  
  // Scroll to the form
  const formSection = document.querySelector('.profile-form');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    formSection.style.border = '2px solid #6C4AB6';
    formSection.style.padding = '20px';
    formSection.style.borderRadius = '8px';
    formSection.style.backgroundColor = '#F6F3FB';
    
    setTimeout(() => {
      formSection.style.border = '';
      formSection.style.backgroundColor = '';
      formSection.style.padding = '';
      formSection.style.borderRadius = '';
    }, 3000);
  }
});

// Logout
document.querySelector('.footer-link.logout')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    showNotification('Logging out...', 'info');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
});
