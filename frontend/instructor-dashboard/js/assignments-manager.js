// Assignment Modal
function openAssignmentModal(mode = 'create', assignmentData = null) {
  const modalTitle = document.querySelector('#assignmentModal h2');
  const submitButton = document.querySelector('#assignmentForm button[type="submit"]');
  const assignmentIdInput = document.getElementById('assignmentId');

  populateAssignmentCourseDropdown().then(() => {
    if (mode === 'edit' && assignmentData) {
      modalTitle.textContent = 'Edit Assignment';
      submitButton.textContent = 'Save Changes';
      assignmentIdInput.value = assignmentData._id || assignmentData.id || '';
      document.getElementById('assignmentTitle').value = assignmentData.title || '';
      document.getElementById('assignmentDescription').value = assignmentData.description || '';
      document.getElementById('assignmentDueDate').value = formatDateYMD(assignmentData.dueDate);
      document.getElementById('assignmentCourse').value = assignmentData.courseId ? String(assignmentData.courseId) : '';
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
  });
}

async function populateAssignmentCourseDropdown() {
  const select = document.getElementById('assignmentCourse');
  if (!select) return;

  while (select.firstChild) select.removeChild(select.firstChild);

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- None --';
  select.appendChild(defaultOpt);

  try {
    const courses = await fetchCourses();
    if (!Array.isArray(courses)) return;

    const seen = new Set();
    courses.forEach((course) => {
      const id = course?._id || course?.id;
      if (!id) return;

      const normalizedId = String(id);
      if (seen.has(normalizedId)) return;
      seen.add(normalizedId);

      const opt = document.createElement('option');
      opt.value = normalizedId;
      opt.textContent = course.name || course.title || normalizedId;
      select.appendChild(opt);
    });
  } catch (err) {
    console.warn('Unable to populate assignment course dropdown', err);
  }
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

function formatDateYMD(dateValue) {
  if (!dateValue) return '';

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    const text = String(dateValue);
    return text.length >= 10 ? text.slice(0, 10) : text;
  }

  return parsed.toISOString().slice(0, 10);
}

function loadAssignmentsFromStorage() {
  return (async () => {
  let backendAssignments = [];
  try {
    backendAssignments = await apiFetch('/api/assignments');
  } catch (err) {
    backendAssignments = [];
  }

  const storedAssignments = JSON.parse(localStorage.getItem('assignments')) || {};
  const container = document.querySelector('.assignments-container');

  const assignmentsList = Array.isArray(backendAssignments) && backendAssignments.length > 0
    ? backendAssignments
    : Object.entries(storedAssignments).map(([id, data]) => ({ id, ...data }));

  // Rebuild the list
  if (container) {
    container.querySelectorAll('.assignment-card').forEach(card => card.remove());

    assignmentsList.forEach((data) => {
      const assignmentId = data._id || data.id;
      if (!assignmentId) return;
      const card = document.createElement('div');
      card.className = 'assignment-card';
      card.id = assignmentId;
      card.innerHTML = `
        <div class="assignment-header">
          <h3>${data.title}</h3>
          <span class="due-date">Due: ${formatDateYMD(data.dueDate)}</span>
        </div>
        <div class="assignment-info">
          <p>${data.description}</p>
          <div class="assignment-stats">
            <span>📤 ${data.submitted || 0}/${data.total || 0} Submitted</span>
            <span>⏰ ${data.late || 0} Late</span>
            <span>❌ ${data.notSubmitted || 0} Not Submitted</span>
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
          (async () => {
            try {
              await apiFetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
            } catch (err) {
              removeAssignmentFromStorage(assignmentId);
            }
            await loadAssignmentsFromStorage();
            showNotification('Assignment deleted successfully!', 'success');
          })();
        }
      });
    });
  }
  })();
}

async function openSubmissionsModal(assignment) {
  const modal = document.getElementById('submissionsModal');
  if (!modal) return;

  const header = modal.querySelector('.modal-header h2');
  const body = document.getElementById('submissionsBody');
  const assignmentId = assignment?._id || assignment?.id;

  if (header) {
    header.textContent = `${assignment.title} - Submissions`;
  }

  if (body) {
    body.innerHTML = '<p>Loading latest submissions...</p>';
  }

  openModal('submissionsModal');

  try {
    const assignments = await apiFetch('/api/assignments');
    const latest = Array.isArray(assignments)
      ? assignments.find((item) => String(item._id || item.id) === String(assignmentId))
      : null;

    const activeAssignment = latest || assignment;
    const submissions = Array.isArray(activeAssignment?.submissions) ? activeAssignment.submissions : [];

    let enrolledEmails = new Set();
    if (activeAssignment?.courseId || activeAssignment?.courseName) {
      const courses = await apiFetch('/api/courses');
      const relatedCourse = Array.isArray(courses)
        ? courses.find((course) => {
            const courseId = String(course?._id || course?.id || '');
            const assignmentCourseId = String(activeAssignment?.courseId || '');
            if (courseId && assignmentCourseId && courseId === assignmentCourseId) return true;
            return String(course?.name || '') === String(activeAssignment?.courseName || '');
          })
        : null;

      if (relatedCourse) {
        enrolledEmails = new Set(
          (Array.isArray(relatedCourse.enrolledStudents) ? relatedCourse.enrolledStudents : [])
            .map((student) => String(student?.studentEmail || '').trim().toLowerCase())
            .filter(Boolean)
        );
      }
    }

    const filteredSubmissions = enrolledEmails.size > 0
      ? submissions.filter((submission) => enrolledEmails.has(String(submission?.studentEmail || '').trim().toLowerCase()))
      : submissions;

    const dueDate = activeAssignment?.dueDate ? new Date(activeAssignment.dueDate) : null;
    const hasDueDate = dueDate && !Number.isNaN(dueDate.getTime());

    const completed = filteredSubmissions.length;
    const late = filteredSubmissions.filter((submission) => {
      const submittedAt = submission?.submittedAt ? new Date(submission.submittedAt) : null;
      if (!hasDueDate || !submittedAt || Number.isNaN(submittedAt.getTime())) return false;
      return submittedAt > dueDate;
    }).length;
    const total = enrolledEmails.size > 0 ? enrolledEmails.size : Number(activeAssignment?.total || 0);
    const notSubmitted = Math.max(total - completed, 0);

    const latestSubmissions = filteredSubmissions
      .slice()
      .sort((a, b) => new Date(b?.submittedAt || 0) - new Date(a?.submittedAt || 0))
      .slice(0, 8);

    const escapeHtml = (value) => String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const submissionsHtml = latestSubmissions.length > 0
      ? latestSubmissions.map((submission, index) => {
          const submittedAt = submission?.submittedAt ? new Date(submission.submittedAt) : null;
          const submittedText = submittedAt && !Number.isNaN(submittedAt.getTime())
            ? submittedAt.toLocaleString()
            : 'N/A';

          const answers = Array.isArray(submission?.answers) ? submission.answers : [];
          const answersHtml = answers.length > 0
            ? answers.map((answer, answerIndex) => `
                <div style="margin-bottom:10px;padding:8px;border:1px solid #eee;border-radius:6px;">
                  <p style="margin:0 0 4px;"><strong>Q${answerIndex + 1}:</strong> ${escapeHtml(answer?.questionText)}</p>
                  <p style="margin:0;color:#444;"><strong>Answer:</strong> ${escapeHtml(answer?.answerText)}</p>
                </div>
              `).join('')
            : '<p style="margin:8px 0 0;color:#666;">No answers available for this submission.</p>';

          return `
            <div style="padding:10px 0;border-top:1px solid #eee;">
              <p style="margin:0;"><strong>${submission.studentName || 'Student'}</strong> (${submission.studentEmail || 'No email'})</p>
              <p style="margin:4px 0 0;color:#666;">Submitted: ${submittedText}</p>
              <button type="button" class="btn-secondary view-answers-btn" data-target="submissionAnswers_${index}" style="margin-top:8px;">View Answers</button>
              <div id="submissionAnswers_${index}" style="display:none;margin-top:10px;">
                ${answersHtml}
              </div>
            </div>
          `;
        }).join('')
      : '<p style="margin-top:12px;color:#666;">No submissions yet.</p>';

    if (body) {
      body.innerHTML = `
        <div class="exam-results">
          <p><strong>Completed:</strong> ${completed}${total > 0 ? ` / ${total}` : ''}</p>
          <p><strong>Late:</strong> ${late}</p>
          <p><strong>Not Submitted:</strong> ${notSubmitted}</p>
        </div>
        <div style="margin-top:12px;">
          <h4 style="margin:0 0 8px;">Recent Submission Activity</h4>
          ${submissionsHtml}
        </div>
      `;

      body.querySelectorAll('.view-answers-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const targetId = button.getAttribute('data-target');
          const detail = targetId ? body.querySelector(`#${targetId}`) : null;
          if (!detail) return;

          const isHidden = detail.style.display === 'none';
          detail.style.display = isHidden ? 'block' : 'none';
          button.textContent = isHidden ? 'Hide Answers' : 'View Answers';
        });
      });
    }
  } catch (err) {
    if (body) {
      body.innerHTML = '<p style="color:#c0392b;">Unable to load latest submissions right now.</p>';
    }
  }
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

    // Get course name for the assignment
    let courseName = 'Unknown Course';
    if (courseId) {
      try {
        const courses = await fetchCourses();
        const course = Array.isArray(courses)
          ? courses.find((c) => String(c.id || c._id) === String(courseId))
          : null;
        if (course?.name) courseName = course.name;
      } catch {}
    }

    const assignmentData = {
      title,
      description,
      dueDate,
      courseId,
      courseName,
      instructor: 'Jasmeen',
      questions,
      submitted: 0,
      total: 0,
      late: 0,
      notSubmitted: 0
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
        let savedAssignment = null;
        if (isEdit && assignmentId) {
          savedAssignment = await apiFetch(`/api/assignments/${assignmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
          });
        } else {
          savedAssignment = await apiFetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
          });
        }

        if (savedAssignment) {
          const savedId = savedAssignment._id || savedAssignment.id;
          if (savedId) {
            saveAssignmentToStorage(savedId, { ...assignmentData, ...savedAssignment });
          }
        }
      } catch (err) {
        console.warn('Backend save failed, saved locally', err);
        const offlineId = isEdit && assignmentId ? assignmentId : 'assignment_' + Date.now();
        saveAssignmentToStorage(offlineId, assignmentData);
      }

    await loadAssignmentsFromStorage();

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
