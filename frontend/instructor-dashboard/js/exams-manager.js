// Exam Modal
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
}

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

// Expose to global for dynamic event handlers
window.openExamModal = openExamModal;

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
      openExamModal('edit', { id: examId, ...data });
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
    submitBtn2.textContent = 'Close';
  }

  setTimeout(() => {
    closeModal('takeExamModal');
    currentExamForTaking = null;
  }, 1500);
}

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

// Placeholder functions that are called but not defined - add them here
function openEditExamModal(examData) {
  openExamModal('edit', examData);
}

function deleteExam(examId) {
  if (confirm('Are you sure you want to delete this exam?')) {
    removeExamFromStorage(examId);
    loadExamsFromStorage();
    showNotification('Exam deleted successfully!', 'success');
  }
}

// Exam Form Submission
function initializeExamForm() {
  const examForm = document.getElementById('examForm');
  if (!examForm) return;

  examForm.addEventListener('submit', (e) => {
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
}

// Toggle Exam Active/Inactive
document.querySelectorAll('.toggle-checkbox').forEach((checkbox) => {
  checkbox.addEventListener('change', (e) => {
    const status = e.target.checked ? 'Active' : 'Inactive';
    showNotification(`Exam ${status}d successfully!`, 'success');
  });
});

// Initialize question controls once the DOM is ready
initExamQuestionControls();

const takeExamForm = document.getElementById('takeExamForm');
if (takeExamForm) {
  takeExamForm.addEventListener('submit', handleTakeExamSubmit);
}
