
// exams.js - Fetch and render exams from backend

async function apiFetch(path, options = {}) {
    try {
        const response = await fetch(path, {
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

async function fetchExams() {
    try {
        return await apiFetch('/api/exams');
    } catch (err) {
        return [];
    }
}

function formatExamSchedule(dateStr, timeStr, duration) {
    if (!dateStr || !timeStr) return '';
    const start = new Date(dateStr);
    if (isNaN(start)) return dateStr + ' ' + timeStr;
    // Parse time (HH:mm)
    const [h, m] = timeStr.split(':').map(Number);
    start.setHours(h || 0, m || 0);
    // End time
    const end = new Date(start.getTime() + (Number(duration) || 0) * 60000);
    const opts = { year: 'numeric', month: 'short', day: 'numeric' };
    const datePart = start.toLocaleDateString(undefined, opts);
    const startTime = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${datePart} at ${startTime} - ${endTime}`;
}

async function renderExams() {
    const container = document.getElementById('examsContainer');
    if (!container) return;
    container.innerHTML = '';
    let exams = await fetchExams();
    if (!Array.isArray(exams)) exams = [];
    if (exams.length === 0) {
        container.innerHTML = '<p class="muted">No exams available.</p>';
        return;
    }
    exams.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'exam-card';
        card.innerHTML = `
            <div class="exam-header">
                <h3>${exam.title || 'Untitled Exam'}</h3>
                <div class="exam-toggle">
                    <input type="checkbox" id="exam${exam._id || exam.id}" class="toggle-checkbox" ${exam.active ? 'checked' : ''}>
                    <label for="exam${exam._id || exam.id}" class="toggle-label"></label>
                </div>
            </div>
            <div class="exam-info">
                <p><strong>Schedule:</strong> ${formatExamSchedule(exam.date, exam.time, exam.duration)}</p>
                <p><strong>Total Marks:</strong> ${exam.totalMarks || 0}</p>
                <p><strong>Passing Score:</strong> ${exam.passingScore || 0}</p>
            </div>
            <div class="exam-stats">
                <span>✓ ${exam.completed || 0} Completed</span>
                <span>⏳ ${exam.inProgress || 0} In Progress</span>
                <span>✗ ${exam.notAttended || 0} Not Attended</span>
            </div>
            <div class="exam-actions">
                <button class="btn-secondary view-submissions">View Submissions</button>
                <button class="btn-icon edit-exam-btn">✏️</button>
                <button class="btn-icon delete-exam-btn">🗑️</button>
            </div>
        `;
        // View Submissions
        card.querySelector('.view-submissions').addEventListener('click', () => {
            showExamSubmissionsModal(exam);
        });
        // Edit Exam
        card.querySelector('.edit-exam-btn').addEventListener('click', () => {
            openExamModal('edit', {
                id: exam._id || exam.id || '',
                title: exam.title || '',
                date: exam.date || '',
                time: exam.time || '',
                duration: exam.duration || '',
                totalMarks: exam.totalMarks || '',
                passingScore: exam.passingScore || '',
                courseId: exam.courseId || '',
                questions: exam.questions || []
            });
        });
        // Delete Exam
        card.querySelector('.delete-exam-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this exam?')) {
                try {
                    await apiFetch(`/api/exams/${exam._id || exam.id}`, { method: 'DELETE' });
                    await renderExams();
                    if (window.showNotification) showNotification('✓ Exam deleted!', 'success');
                } catch (err) {
                    if (window.showNotification) showNotification('⚠️ Unable to delete exam.', 'error');
                }
            }
        });
        container.appendChild(card);
    });
// Show exam submissions modal (simple placeholder)
function showExamSubmissionsModal(exam) {
    let modal = document.getElementById('submissionsModal');
    if (!modal) return;
    document.getElementById('submissionsTitle').textContent = `Exam Submissions`;
    const body = document.getElementById('submissionsBody');
    body.innerHTML = `
        <div class="exam-results">
            <p><strong>Completed:</strong> ${exam.completed || 0}</p>
            <p><strong>In Progress:</strong> ${exam.inProgress || 0}</p>
            <p><strong>Not Attended:</strong> ${exam.notAttended || 0}</p>
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
// Exam form submit handler (create/edit)
document.addEventListener('DOMContentLoaded', () => {
    const examForm = document.getElementById('examForm');
    if (examForm) {
        examForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const examId = document.getElementById('examId').value;
            const isEdit = examId && examId.trim().length > 0;
            const payload = {
                title: document.getElementById('examTitle').value,
                date: document.getElementById('examDate').value,
                time: document.getElementById('examTime').value,
                duration: document.getElementById('examDuration').value,
                totalMarks: document.getElementById('examTotalMarks').value,
                passingScore: document.getElementById('passingScore').value,
                courseId: document.getElementById('examCourse').value
                // Add questions if needed
            };
            try {
                if (isEdit) {
                    await apiFetch(`/api/exams/${examId}`, { method: 'PUT', body: JSON.stringify(payload) });
                } else {
                    await apiFetch('/api/exams', { method: 'POST', body: JSON.stringify(payload) });
                }
                // Ensure Exams section is loaded and shown
                if (!document.getElementById('exams')) {
                    const container = document.getElementById('exams-container');
                    if (container) {
                        const res = await fetch('components/exams.html');
                        container.innerHTML = await res.text();
                    }
                }
                if (typeof showSection === 'function') {
                    showSection('exams');
                }
                await renderExams();
                examForm.reset();
                closeModal('examModal');
                if (window.showNotification) showNotification(isEdit ? '✓ Exam updated successfully!' : '✓ Exam created successfully!', 'success');
            } catch (err) {
                if (window.showNotification) showNotification('⚠️ Unable to save exam.', 'error');
            }
        });
    }
});
}

function initExamsSection() {
    const tryRender = () => {
        const container = document.getElementById('examsContainer');
        const createExamBtn = document.getElementById('createExamBtn');
        if (container && createExamBtn) {
            renderExams();
            // Always re-attach event listener after dynamic load
            createExamBtn.onclick = () => {
                if (typeof openExamModal === 'function') openExamModal('create');
            };
        } else {
            setTimeout(tryRender, 100);
        }
    };
    tryRender();
}

document.addEventListener('DOMContentLoaded', initExamsSection);
