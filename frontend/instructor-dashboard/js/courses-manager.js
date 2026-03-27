// Course Modal
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

// Expose to global for dynamic event handlers
window.openCourseModal = openCourseModal;

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
    const enrolledStudents = course.enrolledStudents || [];
    const totalStudents = enrolledStudents.length;
    
    const studentsList = enrolledStudents.length > 0 
      ? enrolledStudents.map(s => `
          <div class="enrollment-row">
            <span><strong>${s.studentName}</strong></span>
            <span>${s.studentEmail}</span>
            <span style="font-size: 0.85em; color: #999;">${new Date(s.enrolledAt).toLocaleDateString()}</span>
          </div>
        `).join('')
      : '<p style="text-align: center; color: #999;">No students enrolled yet</p>';

    body.innerHTML = `
      <h3>${course.name} - Enrolled Students</h3>
      <p>Total students: <strong>${totalStudents}</strong></p>
      <div class="enrollments-list">
        ${studentsList}
      </div>
    `;
  }

  openModal('enrollmentModal');
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

// Course Form Submission
function initializeCourseForm() {
  const courseForm = document.getElementById('courseForm');
  if (!courseForm) return;

  courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const courseId = document.getElementById('courseId').value;
    const isEditMode = courseId && courseId.trim().length > 0;
    const courseData = {
      name: document.getElementById('courseName').value,
      description: document.getElementById('courseDescription').value,
      duration: Number(document.getElementById('courseDuration').value),
      instructor: 'Jasmeen',
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
      showNotification(isEditMode ? '✓ Course updated successfully!' : '✓ Course created successfully!', 'success');
    } catch (err) {
      showNotification('⚠️ Unable to sync with backend. Saved locally.', 'error');
      console.error('[DEBUG] Course creation error:', err);
    }
    // Reset form and close modal
    e.target.reset();
    closeModal('courseModal');
  });
}
