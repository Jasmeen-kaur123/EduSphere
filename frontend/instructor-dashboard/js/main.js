let navItems = [];
let sections = [];
let modals = [];
// API base (used to call backend endpoints)
const API_BASE = '';

// Chart instance
let enrollmentChart = null;

// Helper to call backend APIs
async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || response.statusText;
      throw new Error(message);
    }

    return await response.json();
  } catch (err) {
    console.warn('API request failed', path, err.message);
    throw err;
  }
}

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

// Main initialization function to be called after all components are loaded
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
  // DOM Elements (must be re-queried after dynamic load)
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const modals = document.querySelectorAll('.modal');

  // Section Navigation
  function showSection(sectionId) {
    sections.forEach(section => {
      section.classList.remove('active');
    });
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      selectedSection.classList.add('active');
    }
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

  // Navigation Event Listeners
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.section;
      showSection(sectionId);
    });
  });

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

  // (Optional) Set default section
  showSection('dashboard');

  // Render dashboard stats and chart after modular load
  if (typeof window.renderDashboardStats === 'function') {
    window.renderDashboardStats();
  }
  if (typeof window.renderCourses === 'function') {
    window.renderCourses();
  }

  setupGlobalSearch();

  // --- Course Creation Logic ---
  const courseForm = document.getElementById('courseForm');
  // Removed duplicate courseForm submit handler. Only the async handler at the bottom of the file is used.
}

function setupGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchIcon = document.getElementById('globalSearchIcon');
  const resultsPanel = document.getElementById('globalSearchResults');
  if (!searchInput || !searchIcon || !resultsPanel || searchInput.dataset.bound === 'true') {
    return;
  }

  searchInput.dataset.bound = 'true';

  const runSearch = async () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      resultsPanel.innerHTML = '';
      resultsPanel.classList.remove('active');
      return;
    }

    const results = await getGlobalSearchResults(query);
    renderGlobalSearchResults(results, resultsPanel);
  };

  searchInput.addEventListener('input', runSearch);
  searchInput.addEventListener('focus', runSearch);
  searchIcon.addEventListener('click', runSearch);

  document.addEventListener('click', (event) => {
    if (!resultsPanel.contains(event.target) && event.target !== searchInput && event.target !== searchIcon) {
      resultsPanel.classList.remove('active');
    }
  });
}

async function getGlobalSearchResults(query) {
  const [courses, students, assignments, exams] = await Promise.all([
    fetchCourses().catch(() => []),
    fetchStudents().catch(() => []),
    apiFetch('/api/assignments').catch(() => []),
    apiFetch('/api/exams').catch(() => [])
  ]);

  const results = [];

  (Array.isArray(courses) ? courses : []).forEach((course) => {
    const title = course.name || course.title || 'Untitled Course';
    const description = course.description || '';
    if (`${title} ${description}`.toLowerCase().includes(query)) {
      results.push({
        title,
        meta: 'Course • My Courses',
        sectionId: 'mycourses'
      });
    }
  });

  (Array.isArray(students) ? students : []).forEach((student) => {
    const name = student.name || 'Unknown Student';
    const email = student.email || '';
    if (`${name} ${email}`.toLowerCase().includes(query)) {
      results.push({
        title: name,
        meta: `Student • ${email || 'Student Enrollment'}`,
        sectionId: 'students'
      });
    }
  });

  (Array.isArray(assignments) ? assignments : []).forEach((assignment) => {
    const title = assignment.title || 'Untitled Assignment';
    const description = assignment.description || '';
    if (`${title} ${description}`.toLowerCase().includes(query)) {
      results.push({
        title,
        meta: 'Assignment • Assignments',
        sectionId: 'assignments'
      });
    }
  });

  (Array.isArray(exams) ? exams : []).forEach((exam) => {
    const title = exam.title || 'Untitled Exam';
    const time = exam.time || '';
    if (`${title} ${time}`.toLowerCase().includes(query)) {
      results.push({
        title,
        meta: 'Exam • Exams',
        sectionId: 'exams'
      });
    }
  });

  return results.slice(0, 8);
}

function renderGlobalSearchResults(results, resultsPanel) {
  if (!Array.isArray(results) || results.length === 0) {
    resultsPanel.innerHTML = '<div class="search-result-empty">No matching results found.</div>';
    resultsPanel.classList.add('active');
    return;
  }

  resultsPanel.innerHTML = results.map((result, index) => `
    <div class="search-result-item" data-result-index="${index}">
      <span class="search-result-title">${escapeHtml(result.title)}</span>
      <span class="search-result-meta">${escapeHtml(result.meta)}</span>
    </div>
  `).join('');

  resultsPanel.classList.add('active');

  resultsPanel.querySelectorAll('.search-result-item').forEach((item) => {
    item.addEventListener('click', () => {
      const result = results[Number(item.dataset.resultIndex)];
      if (!result) return;

      showSection(result.sectionId);
      resultsPanel.classList.remove('active');
      const searchInput = document.getElementById('globalSearchInput');
      if (searchInput) {
        searchInput.value = result.title;
      }
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Section Navigation
function showSection(sectionId) {
  // Get all sections and nav items dynamically
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

    // Update profile statistics when profile section is shown
    if (sectionId === 'profile' && typeof window.updateProfileStatistics === 'function') {
      window.updateProfileStatistics();
    }
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

// Navigation Event Listeners
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = item.dataset.section;
    showSection(sectionId);
  });
});

// Modal Event Listeners
function openCourseModal(mode = 'create', courseData = null) {
  const modalTitle = document.getElementById('courseModalTitle');
  const submitButton = document.getElementById('courseModalSubmit');
  const courseIdInput = document.getElementById('courseId');

  if (mode === 'edit' && courseData) {
    modalTitle.textContent = 'Edit Course';
    submitButton.textContent = 'Save Changes';
    courseIdInput.value = courseData._id || courseData.id || '';
    document.getElementById('courseName').value = courseData.name || '';
    document.getElementById('courseDescription').value = courseData.description || '';
    document.getElementById('courseDuration').value = courseData.duration || '';
  } else {
    modalTitle.textContent = 'Create New Course';
    submitButton.textContent = 'Create Course';
    courseIdInput.value = '';
    document.getElementById('courseForm').reset();
  }

  openModal('courseModal');
}

// (Removed duplicate event listener, now handled in initializeApp)

function openAssignmentModal(mode = 'create', assignmentData = null) {
  const modalTitle = document.querySelector('#assignmentModal h2');
  const submitButton = document.querySelector('#assignmentForm button[type="submit"]');
  const assignmentIdInput = document.getElementById('assignmentId');

  if (mode === 'edit' && assignmentData) {
    modalTitle.textContent = 'Edit Assignment';
    submitButton.textContent = 'Save Changes';
    assignmentIdInput.value = assignmentData.id;
    document.getElementById('assignmentTitle').value = assignmentData.title;
    document.getElementById('assignmentDescription').value = assignmentData.description;
    document.getElementById('assignmentDueDate').value = assignmentData.dueDate;
    document.getElementById('assignmentCourse').value = assignmentData.courseId;
  } else {
    modalTitle.textContent = 'Create Assignment';
    submitButton.textContent = 'Create Assignment';
    assignmentIdInput.value = '';
    document.getElementById('assignmentForm').reset();
  }

  openModal('assignmentModal');
}

// (Removed duplicate event listener, now handled in initializeApp)

function openExamModal(mode = 'create', examData = null) {
  const modalTitle = document.querySelector('#examModal h2');
  const submitButton = document.querySelector('#examForm button[type="submit"]');
  const examIdInput = document.getElementById('examId');

  // Always populate the course dropdown
  populateExamCourseDropdown().then(() => {
    if (mode === 'edit' && examData) {
      modalTitle.textContent = 'Edit Exam';
      submitButton.textContent = 'Save Changes';
      examIdInput.value = examData._id || examData.id || '';
      document.getElementById('examTitle').value = examData.title;
      document.getElementById('examDate').value = examData.date;
      document.getElementById('examTime').value = examData.time;
      document.getElementById('examDuration').value = examData.duration;
      document.getElementById('examTotalMarks').value = examData.totalMarks;
      document.getElementById('passingScore').value = examData.passingScore;
      document.getElementById('examCourse').value = examData.courseId;
      renderExamQuestions(examData.questions || []);
    } else {
      modalTitle.textContent = 'Create Exam';
      submitButton.textContent = 'Create Exam';
      examIdInput.value = '';
      document.getElementById('examForm').reset();
      renderExamQuestions([]);
    }
    // Ensure question controls are initialized every time modal opens
    if (typeof initExamQuestionControls === 'function') {
      initExamQuestionControls();
    }
    openModal('examModal');
  });
// Populate the course dropdown in the exam modal
async function populateExamCourseDropdown() {
  // Always use only the first #examModal in DOM
  const select = document.querySelector('#examModal #examCourse');
  if (!select) return;
  // Remove all options (including duplicates)
  while (select.firstChild) select.removeChild(select.firstChild);
  // Add the default option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- None --';
  select.appendChild(defaultOpt);
  try {
    const courses = await apiFetch('/api/courses');
    if (Array.isArray(courses)) {
      // Use a Set to avoid duplicates by id
      const seen = new Set();
      courses.forEach(course => {
        const id = course._id || course.id || '';
        if (!id || seen.has(id)) return;
        seen.add(id);
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = course.name || course.title || id;
        select.appendChild(opt);
      });
    }
  } catch {}
}
}

// Expose to global for dynamic event handlers
window.openExamModal = openExamModal;

// (Removed duplicate event listener, now handled in initializeApp)

async function openEnrollmentModal(courseId) {
  const modal = document.getElementById('enrollmentModal');
  const body = document.getElementById('enrollmentModalBody');

  let course;
  try {
    course = await apiFetch(`/api/courses/${courseId}`);
  } catch (err) {
    const storedCourses = JSON.parse(localStorage.getItem('courses')) || {};
    course = storedCourses[courseId];
  }

  if (!course) {
    body.innerHTML = '<p>No course data available.</p>';
  } else {
    const students = course.students || 0;
    const fakeList = Array.from({ length: Math.min(students, 10) }, (_, idx) => ({
      name: `Student ${idx + 1}`,
      progress: Math.floor(Math.random() * 100)
    }));

    body.innerHTML = `
      <h3>${course.name} - Enrolled Students</h3>
      <p>Total students: <strong>${students}</strong></p>
      <div class="enrollments-list">
        ${fakeList.map(s => `
          <div class="enrollment-row">
            <span>${s.name}</span>
            <span>${s.progress}%</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  openModal('enrollmentModal');
}

function closeEnrollmentModal() {
  const modal = document.getElementById('enrollmentModal');
  if (modal) closeModal('enrollmentModal');
}

// Close modal buttons
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});

// Close modal by close button
document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});

// Close modal when clicking outside
modals.forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});

// Form Submissions
document.getElementById('courseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const courseId = document.getElementById('courseId').value;
  const isEditMode = courseId && courseId.trim().length > 0;
  const courseData = {
    name: document.getElementById('courseName').value,
    description: document.getElementById('courseDescription').value,
    duration: Number(document.getElementById('courseDuration').value),
    students: Math.floor(Math.random() * 200) + 50,
    published: true
  };
  try {
    const result = await saveCourseToBackend(courseId, courseData, isEditMode);
    // Ensure My Courses section is loaded before showing and rendering
    const ensureMyCoursesLoaded = async () => {
      if (!document.getElementById('mycourses')) {
        // Load the component if not present
        const container = document.getElementById('mycourses-container');
        if (container) {
          const res = await fetch('components/mycourses.html');
          container.innerHTML = await res.text();
        }
      }
    };
    await ensureMyCoursesLoaded();
    if (typeof showSection === 'function') {
      showSection('mycourses');
    }
    if (typeof window.renderCourses === 'function') {
      window.renderCourses();
    }
    // Update profile statistics after course changes
    if (typeof window.updateProfileStatistics === 'function') {
      window.updateProfileStatistics();
    }
    showNotification(isEditMode ? '✓ Course updated successfully!' : '✓ Course created successfully!', 'success');
  } catch (err) {
    showNotification('⚠️ Unable to sync with backend. Saved locally.', 'error');
    console.error('[DEBUG] Course creation error:', err);
  }
  // Reset form and close modal
  e.target.reset();
  closeModal('courseModal');
});


// Function to attach event listeners to course cards
function attachCourseEventListeners(courseCard) {
  const deleteBtn = courseCard.querySelector('.delete-course');
  const editBtn = courseCard.querySelector('.edit-course');
  const manageBtn = courseCard.querySelector('.manage-course');
  const publishBtn = courseCard.querySelector('.btn-publish, .btn-unpublish');

  // Delete course
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const courseName = courseCard.querySelector('h3').innerText;
      if (confirm(`Are you sure you want to delete "${courseName}"?`)) {
        const courseId = courseCard.id;
        
        // Add fade-out animation
        courseCard.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(async () => {
          courseCard.remove();
          await deleteCourseFromBackend(courseId);
          showNotification(`✓ "${courseName}" deleted successfully!`, 'success');
          await initPerformanceChart();
        }, 300);
      }
    });
  }

  // Edit course
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const courseId = courseCard.id;
      const storedCourses = JSON.parse(localStorage.getItem('courses')) || {};
      const courseData = storedCourses[courseId];
      if (!courseData) return;

      openCourseModal('edit', { id: courseId, ...courseData });
    });
  }

  // Manage enrollments
  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      const courseId = courseCard.id;
      openEnrollmentModal(courseId);
    });
  }

  // View enrollments (button in footer)
  const viewEnrollmentsBtn = courseCard.querySelector('.view-enrollments');
  if (viewEnrollmentsBtn) {
    viewEnrollmentsBtn.addEventListener('click', () => {
      const courseId = courseCard.id;
      openEnrollmentModal(courseId);
    });
  }

  // Publish/Unpublish toggle
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      const courseId = courseCard.id;
      const isCurrentlyPublished = publishBtn.classList.contains('btn-publish');

      const newPublishedState = isCurrentlyPublished ? false : true;

      if (isCurrentlyPublished) {
        publishBtn.classList.remove('btn-publish');
        publishBtn.classList.add('btn-unpublish');
        publishBtn.innerText = 'Unpublished';
        showNotification('Course unpublished', 'info');
      } else {
        publishBtn.classList.remove('btn-unpublish');
        publishBtn.classList.add('btn-publish');
        publishBtn.innerText = 'Published';
        showNotification('Course published', 'info');
      }

      await saveCourseToBackend(courseId, { published: newPublishedState }, true);
      await initPerformanceChart();
    });
  }
}

// Courses API access (backend)
async function fetchCourses() {
  try {
    return await apiFetch('/api/courses');
  } catch (err) {
    // fallback to local storage data for offline/demo mode (array version)
    return JSON.parse(localStorage.getItem('courses')) || [];
  }
}

async function fetchStudents() {
  try {
    return await apiFetch('/api/students');
  } catch (err) {
    // fallback to some static demo values
    return [
      {
        name: 'Brenda M. Stroman',
        email: 'brenda@example.com',
        progress: 75,
        completedLessons: 6,
        lastActive: new Date().toISOString(),
        status: 'Active'
      },
      {
        name: 'Mark J. Lopez',
        email: 'mark@example.com',
        progress: 50,
        completedLessons: 4,
        lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Inactive'
      },
      {
        name: 'Doris J. Bartlett',
        email: 'doris@example.com',
        progress: 90,
        completedLessons: 7,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
      }
    ];
  }
}

async function saveCourseToBackend(courseId, courseData, isEdit = false) {
  try {
    const payload = {
      name: courseData.name,
      description: courseData.description,
      duration: Number(courseData.duration),
      students: courseData.students ?? 0,
      published: courseData.published ?? true
    };

    if (isEdit && courseId) {
      return await apiFetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    }

    return await apiFetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Save locally as fallback (array version)
    let courses = [];
    try { courses = JSON.parse(localStorage.getItem('courses')) || []; } catch {}
    if (isEdit && courseId) {
      // Update existing
      courses = courses.map(c => (c.id === courseId ? { ...c, ...courseData, createdAt: c.createdAt || Date.now() } : c));
    } else {
      // Add new
      courses.push({ id: Date.now(), ...courseData, createdAt: Date.now() });
    }
    localStorage.setItem('courses', JSON.stringify(courses));
    return courses[courses.length - 1];
  }
}

async function deleteCourseFromBackend(courseId) {
  try {
    await apiFetch(`/api/courses/${courseId}`, { method: 'DELETE' });
  } catch (err) {
    const courses = JSON.parse(localStorage.getItem('courses')) || {};
    delete courses[courseId];
    localStorage.setItem('courses', JSON.stringify(courses));
  }
}

async function loadCoursesFromStorage() {
  const courses = await fetchCourses();
  const coursesContainer = document.querySelector('.courses-container');
  console.log('[DEBUG] loadCoursesFromStorage: courses:', courses);
  if (!coursesContainer) {
    console.warn('[DEBUG] .courses-container not found in DOM');
    return;
  }
  coursesContainer.querySelectorAll('.course-card').forEach(card => card.remove());

  courses.forEach(course => {
    const courseId = course._id || course.id;
    const card = document.createElement('div');
    card.className = 'course-card';
    card.id = courseId;
    card.innerHTML = `
      <div class="course-header">
        <h3>${course.name}</h3>
        <div class="course-actions">
          <button class="btn-icon edit-course" title="Edit">✏️</button>
          <button class="btn-icon manage-course" title="Manage">👥</button>
          <button class="btn-icon delete-course" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="course-info">
        <p>${course.description}</p>
        <div class="course-meta">
          <span>👥 ${course.students ?? 0} Students</span>
          <span>📚 ${course.duration} Lessons</span>
        </div>
      </div>
      <div class="course-footer">
        <button class="btn-secondary view-enrollments">View Enrollments</button>
        <button class="${course.published ? 'btn-publish' : 'btn-unpublish'}">
          ${course.published ? 'Published' : 'Unpublished'}
        </button>
      </div>
    `;
    coursesContainer.appendChild(card);
    attachCourseEventListeners(card);
  });

  // Ensure the chart reflects the latest stored data
  await initPerformanceChart();
  console.log('[DEBUG] loadCoursesFromStorage: rendered', courses.length, 'courses');
}

// Assignment persistence and rendering
function saveAssignmentToStorage(assignmentId, assignmentData) {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
  assignments[assignmentId] = assignmentData;
  localStorage.setItem('assignments', JSON.stringify(assignments));
}

function removeAssignmentFromStorage(assignmentId) {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
  delete assignments[assignmentId];
  localStorage.setItem('assignments', JSON.stringify(assignments));
}

function loadAssignmentsFromStorage() {
  const storedAssignments = JSON.parse(localStorage.getItem('assignments')) || {};
  const container = document.querySelector('.assignments-container');

  // Seed default assignments if none exist
  if (Object.keys(storedAssignments).length === 0) {
    const defaultAssignments = [
      {
        title: 'HTML & CSS Basics',
        description: 'Create a responsive website layout using HTML5 and modern CSS3 techniques',
        dueDate: '2026-03-15',
        courseId: 'course_1',
        submitted: 45,
        total: 50,
        late: 5,
        notSubmitted: 0
      },
      {
        title: 'JavaScript Functions',
        description: 'Write JavaScript functions to solve complex problems and demonstrate understanding',
        dueDate: '2026-03-20',
        courseId: 'course_2',
        submitted: 38,
        total: 50,
        late: 2,
        notSubmitted: 10
      }
    ];

    defaultAssignments.forEach((assignment) => {
      const id = 'assignment_' + Date.now() + Math.random().toString(16).slice(2);
      storedAssignments[id] = assignment;
    });
    localStorage.setItem('assignments', JSON.stringify(storedAssignments));
  }

  // Rebuild the list
  container.querySelectorAll('.assignment-card').forEach(card => card.remove());

  Object.entries(storedAssignments).forEach(([assignmentId, data]) => {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.id = assignmentId;
    card.innerHTML = `
      <div class="assignment-header">
        <h3>${data.title}</h3>
        <span class="due-date">Due: ${data.dueDate}</span>
      </div>
      <div class="assignment-info">
        <p>${data.description}</p>
        <div class="assignment-stats">
          <span>📤 ${data.submitted}/${data.total} Submitted</span>
          <span>⏰ ${data.late} Late</span>
          <span>❌ ${data.notSubmitted} Not Submitted</span>
        </div>
      </div>
      <div class="assignment-actions">
        <button class="btn-secondary view-submissions">View Submissions</button>
        <button class="btn-icon edit-assignment">✏️</button>
        <button class="btn-icon delete-assignment">🗑️</button>
      </div>
    `;

    container.appendChild(card);

    card.querySelector('.view-submissions')?.addEventListener('click', () => {
      openSubmissionsModal({ id: assignmentId, ...data });
    });

    card.querySelector('.edit-assignment')?.addEventListener('click', () => {
      openAssignmentModal('edit', { id: assignmentId, ...data });
    });

    card.querySelector('.delete-assignment')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this assignment?')) {
        removeAssignmentFromStorage(assignmentId);
        loadAssignmentsFromStorage();
        showNotification('Assignment deleted successfully!', 'success');
      }
    });
  });
}

function openSubmissionsModal(assignment) {
  const modal = document.getElementById('submissionsModal');
  const header = modal.querySelector('.modal-header h2');

  if (header) {
    header.textContent = `${assignment.title} - Submissions`;
  }

  openModal('submissionsModal');
}

// Exam persistence and rendering
function saveExamToStorage(examId, examData) {
  const exams = JSON.parse(localStorage.getItem('exams')) || {};
  exams[examId] = examData;
  localStorage.setItem('exams', JSON.stringify(exams));
}

function removeExamFromStorage(examId) {
  const exams = JSON.parse(localStorage.getItem('exams')) || {};
  delete exams[examId];
  localStorage.setItem('exams', JSON.stringify(exams));
}

function loadExamsFromStorage() {
  const examGrid = document.getElementById("examGrid");
  if (!examGrid) return;

  examGrid.innerHTML = "";

  const storedExams = JSON.parse(localStorage.getItem("exams")) || {};

  Object.entries(storedExams).forEach(([examId, data]) => {
    const card = document.createElement("div");
    card.className = "exam-card";

    const buttonHTML =
      currentUserRole === "instructor"
        ? `<button class="btn-secondary view-submissions">View Submissions</button>`
        : `<button class="btn-secondary take-exam">Take Exam</button>`;

    card.innerHTML = `
      <div class="exam-header">
        <h3>${data.title}</h3>
      </div>

      <div class="exam-info">
        <p><strong>Schedule:</strong> ${new Date(
          data.date + " " + data.time
        ).toLocaleString()}</p>
        <p><strong>Total Questions:</strong> ${data.questions?.length || 0}</p>
        <p><strong>Total Points:</strong> ${data.totalMarks}</p>
        <p><strong>Passing Score:</strong> ${data.passingScore}</p>
      </div>

      <hr/>

      <div class="exam-stats">
        <span>✔ ${data.completed || 0} Completed</span>
        <span>⏳ ${data.inProgress || 0} In Progress</span>
        <span>✖ ${data.notAttended || 0} Not Attended</span>
      </div>

      <div class="exam-actions">
        ${buttonHTML}
        <button class="btn-icon edit-exam">✏️</button>
        <button class="btn-icon delete-exam">🗑️</button>
      </div>
    `;

    examGrid.appendChild(card);

    // STUDENT BUTTON
    card.querySelector(".take-exam")?.addEventListener("click", () => {
      openTakeExamModal({ id: examId, ...data });
    });

    // INSTRUCTOR BUTTON
    card.querySelector(".view-submissions")?.addEventListener("click", () => {
      openExamResultsModal({ id: examId, ...data });
    });

    // EDIT
    card.querySelector(".edit-exam")?.addEventListener("click", () => {
      openEditExamModal({ id: examId, ...data });
    });

    // DELETE
    card.querySelector(".delete-exam")?.addEventListener("click", () => {
      deleteExam(examId);
    });
  });
}

function openExamResultsModal(exam) {
  const modal = document.getElementById("submissionsModal");
  if (!modal) return;

  const header = modal.querySelector(".modal-header h2");
  const body = modal.querySelector(".modal-body");

  if (header) {
    header.textContent = exam.title + " - Submissions";
  }

  if (body) {
    body.innerHTML = `
      <div class="exam-results">
        <p><strong>Completed:</strong> ${exam.completed || 0}</p>
        <p><strong>In Progress:</strong> ${exam.inProgress || 0}</p>
        <p><strong>Not Attended:</strong> ${exam.notAttended || 0}</p>
      </div>
    `;
  }

  openModal("submissionsModal");
}
let currentExamForTaking = null;

function openTakeExamModal(exam) {
  currentExamForTaking = exam;

  const modal = document.getElementById('takeExamModal');
  const header = modal.querySelector('.modal-header h2');
  const body = modal.querySelector('#takeExamBody');

  if (header) {
    header.textContent = `${exam.title} - Take Exam`;
  }

  renderTakeExamQuestions(exam);

  // Reset results view
  const questionsContainer = document.getElementById('takeExamQuestions');
  const resultsContainer = document.getElementById('takeExamResults');
  const submitBtn = document.querySelector('#takeExamForm button[type="submit"]');

  if (questionsContainer) questionsContainer.style.display = 'block';
  if (resultsContainer) resultsContainer.style.display = 'none';
  if (submitBtn) submitBtn.textContent = 'Submit Exam';

  // Track in-progress attempt
  const storedExams = JSON.parse(localStorage.getItem('exams')) || {};
  const storedExam = storedExams[exam.id] || {};
  storedExam.inProgress = (storedExam.inProgress ?? 0) + 1;
  saveExamToStorage(exam.id, storedExam);
  loadExamsFromStorage();

  openModal('takeExamModal');
}

function renderTakeExamQuestions(exam) {
  const container = document.getElementById('takeExamQuestions');
  if (!container) return;

  const questions = normalizeExamQuestions(exam.questions || []);
  container.innerHTML = '';

  if (questions.length === 0) {
    container.innerHTML = '<p class="muted">No questions configured for this exam.</p>';
    return;
  }

  questions.forEach((q, qi) => {
    const questionBlock = document.createElement('div');
    questionBlock.className = 'take-exam-question';

    questionBlock.innerHTML = `
      <div class="take-exam-question-title">
        <strong>Q${qi + 1}.</strong> ${q.text}
        <span class="take-exam-question-points">(${q.points} pts)</span>
      </div>
      <textarea class="take-exam-answer" placeholder="Type your answer here..."></textarea>
    `;

    container.appendChild(questionBlock);
  });
}

function handleTakeExamSubmit(e) {
  e.preventDefault();

  const submitBtn = document.querySelector('#takeExamForm button[type="submit"]');
  if (submitBtn && submitBtn.textContent.trim() === 'Close') {
    closeModal('takeExamModal');
    if (currentExamForTaking) {
      renderTakeExamQuestions(currentExamForTaking);
      currentExamForTaking = null;
    }
    if (submitBtn) submitBtn.textContent = 'Submit Exam';
    return;
  }

  if (!currentExamForTaking) return;

  const examId = currentExamForTaking.id;
  const storedExams = JSON.parse(localStorage.getItem('exams')) || {};
  const exam = storedExams[examId];
  if (!exam) return;

  const questions = normalizeExamQuestions(exam.questions || []);
  let score = 0;
  let maxScore = 0;

  questions.forEach((q, qi) => {
    const answerInput = document.querySelectorAll('#takeExamQuestions textarea')[qi];
    const answer = answerInput ? answerInput.value.trim().toLowerCase() : '';
    const correct = (q.correctAnswer || '').trim().toLowerCase();

    if (answer && correct && answer === correct) {
      score += q.points;
    }
    maxScore += q.points;
  });

  const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= (exam.passingScore ?? 0);

  // Update stats
  exam.completed = (exam.completed ?? 0) + 1;
  exam.inProgress = Math.max(0, (exam.inProgress ?? 0) - 1);
  saveExamToStorage(examId, exam);
  loadExamsFromStorage();

  // Show results
  const questionsContainer = document.getElementById('takeExamQuestions');
  const resultsContainer = document.getElementById('takeExamResults');
  const submitBtn2 = document.querySelector('#takeExamForm button[type="submit"]');

  if (questionsContainer) questionsContainer.style.display = 'none';

  if (resultsContainer) {
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
      <div class="exam-results">
        <h3>Your Score</h3>
        <p><strong>${score}/${maxScore}</strong> (${percentage}%)</p>
        <p>Status: <strong>${passed ? 'Passed' : 'Failed'}</strong></p>
      </div>
    `;
  }

  if (submitBtn2) {
    submitBtn2.textContent = 'Close'; // modal can be closed by clicking the Close button
  }

  setTimeout(() => {
    closeModal('takeExamModal');
    currentExamForTaking = null;
  }, 1500);
}

const takeExamForm = document.getElementById('takeExamForm');
if (takeExamForm) {
  takeExamForm.addEventListener('submit', handleTakeExamSubmit);
}

document.getElementById('assignmentForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const assignmentId = document.getElementById('assignmentId').value;
  const isEdit = assignmentId && assignmentId.trim().length > 0;

  const title = document.getElementById('assignmentTitle').value;
  const description = document.getElementById('assignmentDescription').value;
  const dueDate = document.getElementById('assignmentDueDate').value;
  const courseId = document.getElementById('assignmentCourse').value;

  const storedAssignments = JSON.parse(localStorage.getItem('assignments')) || {};
  const existing = storedAssignments[assignmentId] || {};

  const assignmentData = {
    title,
    description,
    dueDate,
    courseId,
    submitted: existing.submitted ?? Math.floor(Math.random() * 40) + 10,
    total: existing.total ?? 50,
    late: existing.late ?? Math.floor(Math.random() * 10),
    notSubmitted: existing.notSubmitted ?? Math.floor(Math.random() * 10)
  };

  const id = isEdit ? assignmentId : 'assignment_' + Date.now();
  saveAssignmentToStorage(id, assignmentData);
  loadAssignmentsFromStorage();

  // Reset form
  e.target.reset();
  closeModal('assignmentModal');

  showNotification(isEdit ? '✓ Assignment updated successfully!' : '✓ Assignment created successfully!', 'success');
});

document.getElementById('examForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const examId = document.getElementById('examId').value;
  const isEdit = examId && examId.trim().length > 0;

  const title = document.getElementById('examTitle').value;
  const date = document.getElementById('examDate').value;
  const time = document.getElementById('examTime').value;
  const duration = document.getElementById('examDuration').value;
  const totalMarks = document.getElementById('examTotalMarks').value;
  const passingScore = document.getElementById('passingScore').value;
  const courseId = document.getElementById('examCourse').value;

  const storedExams = JSON.parse(localStorage.getItem('exams')) || {};
  const existing = storedExams[examId] || {};

  const examData = {
    title,
    date,
    time,
    duration: Number(duration),
    totalMarks: Number(totalMarks),
    passingScore: Number(passingScore),
    courseId,
    questions: getExamQuestionsFromModal(),
    completed: existing.completed ?? Math.floor(Math.random() * 50),
    inProgress: existing.inProgress ?? Math.floor(Math.random() * 10),
    notAttended: existing.notAttended ?? Math.floor(Math.random() * 10),
    active: existing.active ?? true
  };

  const id = isEdit ? examId : 'exam_' + Date.now();
  saveExamToStorage(id, examData);
  loadExamsFromStorage();

  // Reset form
  e.target.reset();
  closeModal('examModal');

  showNotification(isEdit ? '✓ Exam updated successfully!' : '✓ Exam created successfully!', 'success');
});

function normalizeExamQuestions(questions = []) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => {
    // Legacy MCQ compatibility (options/correctIndex)
    if (q && Array.isArray(q.options) && typeof q.correctIndex === 'number') {
      return {
        text: q.text || '',
        points: Number(q.points) || 1,
        correctAnswer: q.options[q.correctIndex] || '',
      };
    }

    // New format: text + correctAnswer
    return {
      text: q.text || '',
      points: Number(q.points) || 1,
      correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : ''
    };
  });
}

function getExamQuestionsFromModal() {
  const container = document.getElementById('examQuestionsContainer');
  if (!container) return [];

  const rows = Array.from(container.querySelectorAll('.exam-question-row'));
  return rows.map((row) => {
    const text = row.querySelector('.exam-question-text')?.value.trim() || '';
    const points = Number(row.querySelector('.exam-question-points')?.value) || 1;
    const correctAnswer = row.querySelector('.exam-correct-answer')?.value.trim() || '';

    return {
      text,
      points,
      correctAnswer
    };
  }).filter(q => q.text && q.correctAnswer);
}

function renderExamQuestions(questions = []) {
  const container = document.getElementById('examQuestionsContainer');
  if (!container) return;

  const normalized = normalizeExamQuestions(questions);

  container.innerHTML = '';

  if (normalized.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.className = 'muted';
    placeholder.textContent = 'Add questions for students to answer during the exam.';
    container.appendChild(placeholder);
    return;
  }

  normalized.forEach((question, index) => {
    const questionIndex = index;
    const row = document.createElement('div');
    row.className = 'exam-question-row';
    row.dataset.index = questionIndex;

    row.innerHTML = `
      <div class="exam-question-header">
        <span>Question ${questionIndex + 1}</span>
        <button type="button" class="btn-icon remove-question" title="Remove question">×</button>
      </div>
      <textarea class="exam-question-text" placeholder="Enter the question...">${question.text}</textarea>
      <div class="exam-question-meta">
        <label>Points: <input type="number" class="exam-question-points" min="1" value="${question.points}"></label>
      </div>
      <div class="exam-answer">
        <label>Correct Answer:</label>
        <input type="text" class="exam-correct-answer" value="${question.correctAnswer}" placeholder="Enter correct answer">
      </div>
    `;

    container.appendChild(row);
  });
}

function initExamQuestionControls() {
  const addBtn = document.getElementById('addExamQuestionBtn');
  const container = document.getElementById('examQuestionsContainer');
  if (!addBtn || !container) return;

  addBtn.addEventListener('click', () => {
    const currentQuestions = getExamQuestionsFromModal();
    currentQuestions.push({
      text: '',
      points: 1,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0
    });
    renderExamQuestions(currentQuestions);
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-question')) {
      const row = e.target.closest('.exam-question-row');
      if (row) {
        row.remove();
        const remaining = getExamQuestionsFromModal();
        renderExamQuestions(remaining);
      }
      return;
    }

    if (e.target.classList.contains('add-option-btn')) {
      const row = e.target.closest('.exam-question-row');
      if (!row) return;

      const optionsContainer = row.querySelector('.exam-options');
      if (!optionsContainer) return;

      const questionIndex = row.dataset.index;
      const optionCount = optionsContainer.querySelectorAll('.exam-option-row').length;
      const optionHtml = `
        <div class="exam-option-row">
          <label>
            <input type="radio" name="correct-${questionIndex}" value="${optionCount}">
            <input type="text" class="exam-option-text" placeholder="Option ${optionCount + 1}">
          </label>
        </div>
      `;
      optionsContainer.insertAdjacentHTML('beforeend', optionHtml);
    }
  });
}

// Initialize question controls once the DOM is ready
initExamQuestionControls();

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    </div>
  `;

  // Add styles for notification
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      z-index: 3000;
      animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      background-color: rgba(126, 217, 87, 0.1);
      color: #7ED957;
      border-left: 4px solid #7ED957;
    }

    .notification-error {
      background-color: rgba(255, 107, 129, 0.1);
      color: #FF6B81;
      border-left: 4px solid #FF6B81;
    }

    .notification-info {
      background-color: rgba(108, 74, 182, 0.1);
      color: #6C4AB6;
      border-left: 4px solid #6C4AB6;
    }

    .notification-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }
  `;

  if (!document.querySelector('style[data-notification]')) {
    style.setAttribute('data-notification', 'true');
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Close button functionality
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// File Upload
document.getElementById('assignmentFile')?.addEventListener('change', (e) => {
  const fileName = e.target.files[0]?.name || 'No file chosen';
  console.log('File selected:', fileName);
});

// Chart.js - Performance Chart
async function initPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Compute last 6 months as labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth()
    });
  }

  // Fetch courses via backend and fallback to local storage
  let courses = [];
  try {
    courses = await fetchCourses();
  } catch (err) {
    courses = [];
  }

  const enrollmentsPerMonth = months.map(() => 0);

  courses.forEach(course => {
    const createdAt = course.createdAt ? new Date(course.createdAt) : null;
    if (!createdAt) return;

    const idx = months.findIndex(m => m.year === createdAt.getFullYear() && m.month === createdAt.getMonth());
    if (idx >= 0) {
      enrollmentsPerMonth[idx] += 1;
    }
  });

  // Destroy existing chart (if any) before rendering a new one
  if (enrollmentChart) {
    enrollmentChart.destroy();
    enrollmentChart = null;
  }

  enrollmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'New Enrollments',
          data: enrollmentsPerMonth,
          backgroundColor: '#6C4AB6',
          borderRadius: 5,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#8A8A8A',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#E8E4F0',
            drawBorder: false
          },
          ticks: {
            color: '#8A8A8A',
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#8A8A8A',
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}


// Toggle Exam Active/Inactive
document.querySelectorAll('.toggle-checkbox').forEach((checkbox) => {
  checkbox.addEventListener('change', (e) => {
    const status = e.target.checked ? 'Active' : 'Inactive';
    showNotification(`Exam ${status}d successfully!`, 'success');
  });
});

// Student View Button
async function loadStudentsFromStorage() {
  const students = await fetchStudents();
  const tbody = document.querySelector('.student-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  students.forEach((student) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${student.progress}%"></div>
        </div>
        <span class="progress-text">${student.progress}%</span>
      </td>
      <td>${student.completedLessons}</td>
      <td>${new Date(student.lastActive).toLocaleString()}</td>
      <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
      <td><button class="btn-view">View</button></td>
    `;

    const viewBtn = tr.querySelector('.btn-view');
    viewBtn.addEventListener('click', () => {
      openStudentModal(student);
    });

    tbody.appendChild(tr);
  });
}

function openStudentModal(student) {
  const body = document.getElementById('studentModalBody');
  body.innerHTML = `
    <div class="student-profile">
      <div class="student-profile-header">
        <div>
          <h3>${student.name}</h3>
          <p>${student.email}</p>
        </div>
        <span class="status-badge ${student.status.toLowerCase()}">${student.status}</span>
      </div>
      <div class="student-details">
        <p><strong>Progress:</strong> ${student.progress}%</p>
        <p><strong>Completed Lessons:</strong> ${student.completedLessons}</p>
        <p><strong>Last Active:</strong> ${new Date(student.lastActive).toLocaleString()}</p>
      </div>
    </div>
  `;

  openModal('studentModal');
}


// Profile Form Submission
document.querySelectorAll('.profile-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const phone = document.querySelector('.profile-form input[type="tel"]').value;
    const bio = document.querySelector('.profile-form textarea').value;
    
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

// Search Functionality
document.querySelector('.search-input')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const tableRows = document.querySelectorAll('.student-table tbody tr');
  
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
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

// Notification Bell Click - Show All Notifications
document.getElementById('notificationBell')?.addEventListener('click', () => {
  const notifications = [
    { type: 'success', message: 'New student enrolled in Web Development course' },
    { type: 'success', message: 'Assignment "JavaScript Basics" has been submitted by 45 students' },
    { type: 'info', message: 'Exam "Mid Term - Web Development" will start in 2 hours' }
  ];

  // Create notification panel
  const notificationPanel = document.createElement('div');
  notificationPanel.className = 'notification-panel';
  notificationPanel.innerHTML = `
    <div class="notification-panel-header">
      <h3>Notifications</h3>
      <button class="close-panel">&times;</button>
    </div>
    <div class="notification-list">
      ${notifications.map(notif => `
        <div class="notification-item notification-item-${notif.type}">
          <span class="notification-icon">
            ${notif.type === 'success' ? '✓' : 'ℹ'}
          </span>
          <span class="notification-text">${notif.message}</span>
          <span class="notification-time">just now</span>
        </div>
      `).join('')}
    </div>
  `;

  // Remove existing panel if open
  const existingPanel = document.querySelector('.notification-panel');
  if (existingPanel) {
    existingPanel.remove();
    return;
  }

  document.body.appendChild(notificationPanel);

  // Add styles if not already added
  if (!document.querySelector('style[data-notification-panel]')) {
    const style = document.createElement('style');
    style.setAttribute('data-notification-panel', 'true');
    style.textContent = `
      .notification-panel {
        position: fixed;
        top: 70px;
        right: 20px;
        width: 350px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 2500;
        animation: slideDown 0.3s ease;
        max-height: 500px;
        display: flex;
        flex-direction: column;
      }

      @keyframes slideDown {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .notification-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #E8E4F0;
      }

      .notification-panel-header h3 {
        margin: 0;
        color: #2E2E2E;
        font-size: 16px;
        font-weight: 600;
      }

      .close-panel {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #8A8A8A;
        padding: 0;
      }

      .close-panel:hover {
        color: #2E2E2E;
      }

      .notification-list {
        overflow-y: auto;
        max-height: 420px;
      }

      .notification-item {
        display: flex;
        gap: 12px;
        padding: 15px 20px;
        border-bottom: 1px solid #F0F0F0;
        align-items: flex-start;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .notification-item:hover {
        background-color: #F6F3FB;
      }

      .notification-item-success {
        border-left: 4px solid #7ED957;
      }

      .notification-item-info {
        border-left: 4px solid #6C4AB6;
      }

      .notification-icon {
        font-weight: 600;
        font-size: 16px;
      }

      .notification-item-success .notification-icon {
        color: #7ED957;
      }

      .notification-item-info .notification-icon {
        color: #6C4AB6;
      }

      .notification-text {
        flex: 1;
        color: #2E2E2E;
        font-size: 13px;
        line-height: 1.4;
      }

      .notification-time {
        color: #8A8A8A;
        font-size: 11px;
        white-space: nowrap;
        margin-left: 10px;
      }

      @media (max-width: 480px) {
        .notification-panel {
          width: calc(100vw - 40px);
          right: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Close panel functionality
  notificationPanel.querySelector('.close-panel').addEventListener('click', () => {
    notificationPanel.remove();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!notificationPanel.contains(e.target) && !document.getElementById('notificationBell').contains(e.target)) {
      notificationPanel.remove();
    }
  });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Set dashboard as default view
  showSection('dashboard');

  // Load stored data
  await loadCoursesFromStorage();
  await loadStudentsFromStorage();
  await loadAssignmentsFromStorage();
  await loadExamsFromStorage();

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape key to close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  console.log('Dashboard initialized successfully!');
});

// Update profile statistics dynamically
window.updateProfileStatistics = async function() {
  try {
    // Fetch current data from backend and localStorage
    const [courses, students] = await Promise.all([
      apiFetch('/api/courses').catch(() => []),
      apiFetch('/api/students').catch(() => [])
    ]);

    const safeCourses = Array.isArray(courses) ? courses : [];
    const safeStudents = Array.isArray(students) ? students : [];

    // Calculate total students across all courses
    let totalStudents = safeStudents.length;

    // If we have course data with enrolled students, use that
    if (safeCourses.length > 0) {
      const enrolledStudents = safeCourses.reduce((total, course) => {
        return total + (course.students ? course.students.length : 0);
      }, 0);
      if (enrolledStudents > 0) {
        totalStudents = enrolledStudents;
      }
    }

    // Update statistics in profile
    const statElements = {
      courses: document.querySelector('.stat-item:nth-child(1) .stat-number'),
      students: document.querySelector('.stat-item:nth-child(2) .stat-number'),
      rating: document.querySelector('.stat-item:nth-child(3) .stat-number'),
      reviews: document.querySelector('.stat-item:nth-child(4) .stat-number')
    };

    if (statElements.courses) {
      statElements.courses.textContent = safeCourses.length;
    }

    if (statElements.students) {
      statElements.students.textContent = totalStudents;
    }

    // Rating and reviews could be calculated from course ratings or stored separately
    // For now, we'll keep them as dynamic placeholders or fetch from a rating system
    if (statElements.rating) {
      // Calculate average rating from courses if available
      const coursesWithRating = safeCourses.filter(course => course.rating);
      if (coursesWithRating.length > 0) {
        const avgRating = coursesWithRating.reduce((sum, course) => sum + course.rating, 0) / coursesWithRating.length;
        statElements.rating.textContent = avgRating.toFixed(1);
      } else {
        // Default rating if no course ratings available
        statElements.rating.textContent = '4.8';
      }
    }

    if (statElements.reviews) {
      // Calculate total reviews from courses
      const totalReviews = safeCourses.reduce((total, course) => {
        return total + (course.reviews ? course.reviews.length : 0);
      }, 0);

      if (totalReviews > 0) {
        statElements.reviews.textContent = totalReviews > 1000 ? '1000+' : totalReviews.toString();
      } else {
        // Default reviews count
        statElements.reviews.textContent = '1250+';
      }
    }

  } catch (error) {
    console.log('Error updating profile statistics:', error);
    // Fallback to default values if API fails
    const statElements = {
      courses: document.querySelector('.stat-item:nth-child(1) .stat-number'),
      students: document.querySelector('.stat-item:nth-child(2) .stat-number'),
      rating: document.querySelector('.stat-item:nth-child(3) .stat-number'),
      reviews: document.querySelector('.stat-item:nth-child(4) .stat-number')
    };

    if (statElements.courses) statElements.courses.textContent = '12';
    if (statElements.students) statElements.students.textContent = '450';
    if (statElements.rating) statElements.rating.textContent = '4.8';
    if (statElements.reviews) statElements.reviews.textContent = '1250+';
  }
}

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
initializeApp();