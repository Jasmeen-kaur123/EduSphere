// Assignment Modal
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
    document.getElementById('assignmentQuestions').value = Array.isArray(assignmentData.questions)
      ? assignmentData.questions.map((q) => q.questionText || q).join('\n')
      : '';
  } else {
    modalTitle.textContent = 'Create Assignment';
    submitButton.textContent = 'Create Assignment';
    assignmentIdInput.value = '';
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignmentQuestions').value = '';
  }

  openModal('assignmentModal');
}

// Expose to global for dynamic event handlers
window.openAssignmentModal = openAssignmentModal;

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
  if (container) {
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
}

function openSubmissionsModal(assignment) {
  const modal = document.getElementById('submissionsModal');
  const header = modal.querySelector('.modal-header h2');

  if (header) {
    header.textContent = `${assignment.title} - Submissions`;
  }

  openModal('submissionsModal');
}

// Assignment Form Submission
function initializeAssignmentForm() {
  const assignmentForm = document.getElementById('assignmentForm');
  if (!assignmentForm) return;
  if (assignmentForm.dataset.bound === 'true') return;
  assignmentForm.dataset.bound = 'true';

  assignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (assignmentForm.dataset.submitting === 'true') return;
    assignmentForm.dataset.submitting = 'true';

    const submitBtn = assignmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {

    const assignmentId = document.getElementById('assignmentId').value;
    const isEdit = assignmentId && assignmentId.trim().length > 0;

    const title = document.getElementById('assignmentTitle').value;
    const description = document.getElementById('assignmentDescription').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const courseId = document.getElementById('assignmentCourse').value;
    const questionsInput = document.getElementById('assignmentQuestions').value;
    const questions = questionsInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((questionText) => ({ questionText }));

    const storedAssignments = JSON.parse(localStorage.getItem('assignments')) || {};
    const existing = storedAssignments[assignmentId] || {};

    // Get course name for the assignment
    let courseName = 'Unknown Course';
    if (courseId) {
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      const course = Array.isArray(courses) ? courses.find(c => (c.id || c._id) === courseId) : null;
      if (course) courseName = course.name;
    }

    const assignmentData = {
      title,
      description,
      dueDate,
      courseId,
      courseName,
      instructor: 'Jasmeen',
      questions,
      submitted: existing.submitted ?? Math.floor(Math.random() * 40) + 10,
      total: existing.total ?? 50,
      late: existing.late ?? Math.floor(Math.random() * 10),
      notSubmitted: existing.notSubmitted ?? Math.floor(Math.random() * 10)
    };

    // Save to backend
    const apiPayload = {
      title,
      description,
      dueDate,
      courseId,
      courseName,
      instructor: 'Jasmeen',
      questions
    };

      try {
        if (isEdit && assignmentId) {
          await fetch(`/api/assignments/${assignmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
          });
        } else {
          await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
          });
        }
      } catch (err) {
        console.warn('Backend save failed, saved locally', err);
      }

    const id = isEdit ? assignmentId : 'assignment_' + Date.now();
    saveAssignmentToStorage(id, assignmentData);
    loadAssignmentsFromStorage();

    // Reset form
    e.target.reset();
    closeModal('assignmentModal');

      showNotification(isEdit ? '✓ Assignment updated successfully!' : '✓ Assignment created successfully!', 'success');
    } finally {
      assignmentForm.dataset.submitting = 'false';
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
