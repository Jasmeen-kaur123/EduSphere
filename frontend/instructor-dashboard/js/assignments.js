// assignments.js - Handles dynamic rendering of assignments

// Example: Replace with real data fetching logic


// Example: Replace with real data fetching logic
const assignmentsData = [
    {
        id: 1,
        title: "HTML & CSS Basics",
        dueDate: "Mar 15, 2026",
        description: "Create a responsive website layout using HTML5 and modern CSS3 techniques",
        submitted: 45,
        total: 50,
        late: 5,
        notSubmitted: 0
    },
    {
        id: 2,
        title: "JavaScript Functions",
        dueDate: "Mar 20, 2026",
        description: "Write JavaScript functions to solve complex problems and demonstrate understanding",
        submitted: 38,
        total: 50,
        late: 2,
        notSubmitted: 10
    }
];

// assignments.js - Fetch and render assignments from backend

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

async function fetchAssignments() {
    try {
        return await apiFetch('/api/assignments');
    } catch (err) {
        // fallback: no assignments
        return [];
    }
}


// Utility to format ISO date to readable string
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}


async function renderAssignments() {
    const container = document.getElementById('assignmentsContainer');
    if (!container) return;
    container.innerHTML = '';
    let assignments = await fetchAssignments();
    if (!Array.isArray(assignments)) assignments = [];
    if (assignments.length === 0) {
        container.innerHTML = '<p class="muted">No assignments available.</p>';
        return;
    }
    assignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'assignment-card';
        card.innerHTML = `
            <div class="assignment-header">
                <h3>${assignment.title || 'Untitled Assignment'}</h3>
                <span class="due-date">Due: ${formatDate(assignment.dueDate) || ''}</span>
            </div>
            <div class="assignment-info">
                <p>${assignment.description || ''}</p>
                <div class="assignment-stats">
                    <span>📤 ${assignment.submitted || 0}/${assignment.total || 0} Submitted</span>
                    <span>⏰ ${assignment.late || 0} Late</span>
                    <span>❌ ${assignment.notSubmitted || 0} Not Submitted</span>
                </div>
            </div>
            <div class="assignment-actions">
                <button class="btn-secondary view-submissions-btn">View Submissions</button>
                <button class="btn-icon edit-assignment-btn">✏️</button>
                <button class="btn-icon delete-assignment-btn">🗑️</button>
            </div>
        `;
        // View Submissions
        card.querySelector('.view-submissions-btn').addEventListener('click', () => {
            showAssignmentSubmissionsModal(assignment);
        });
        // Edit Assignment
        card.querySelector('.edit-assignment-btn').addEventListener('click', () => {
            openEditAssignmentModal(assignment);
        });
        // Delete Assignment
        card.querySelector('.delete-assignment-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this assignment?')) {
                try {
                    await apiFetch(`/api/assignments/${assignment._id || assignment.id}`, { method: 'DELETE' });
                    await renderAssignments();
                    if (window.showNotification) showNotification('✓ Assignment deleted!', 'success');
                } catch (err) {
                    if (window.showNotification) showNotification('⚠️ Unable to delete assignment.', 'error');
                }
            }
        });
        container.appendChild(card);
    });
// Open assignment modal for editing
function openEditAssignmentModal(assignment) {
    const modal = document.getElementById('assignmentModal');
    if (!modal) return;
    document.getElementById('assignmentModalTitle').textContent = 'Edit Assignment';
    document.getElementById('assignmentId').value = assignment._id || assignment.id || '';
    document.getElementById('assignmentTitle').value = assignment.title || '';
    document.getElementById('assignmentDescription').value = assignment.description || '';
    // Format date as yyyy-mm-dd for input
    let dateVal = '';
    if (assignment.dueDate) {
        const d = new Date(assignment.dueDate);
        if (!isNaN(d)) {
            dateVal = d.toISOString().slice(0, 10);
        }
    }
    document.getElementById('assignmentDueDate').value = dateVal;
    // Populate course dropdown and set value
    populateCourseDropdown().then(() => {
        if (assignment.courseId) {
            document.getElementById('assignmentCourse').value = assignment.courseId;
        }
    });
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
}

// Show assignment submissions modal
function showAssignmentSubmissionsModal(assignment) {
    let modal = document.getElementById('submissionsModal');
    if (!modal) return;
    document.getElementById('submissionsTitle').textContent = `Assignment Submissions`;
    const body = document.getElementById('submissionsBody');
    body.innerHTML = `
        <div class="exam-results">
            <p><strong>Submitted:</strong> ${assignment.submitted || 0}</p>
            <p><strong>Late:</strong> ${assignment.late || 0}</p>
            <p><strong>Not Submitted:</strong> ${assignment.notSubmitted || 0}</p>
            <p><strong>Total:</strong> ${assignment.total || 0}</p>
        </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}


// Assignment creation (backend) with course dropdown
async function populateCourseDropdown() {
    const select = document.getElementById('assignmentCourse');
    if (!select) return;
    select.innerHTML = '<option value="">-- None --</option>';
    try {
        const courses = await apiFetch('/api/courses');
        if (Array.isArray(courses)) {
            courses.forEach(course => {
                const opt = document.createElement('option');
                opt.value = course._id;
                opt.textContent = course.name || course.title || course._id;
                select.appendChild(opt);
            });
        }
    } catch {}
}

function setupAssignmentForm() {
    const form = document.getElementById('assignmentForm');
    if (!form) return;
    // Populate course dropdown when modal opens
    const assignmentModal = document.getElementById('assignmentModal');
    if (assignmentModal) {
        assignmentModal.addEventListener('show', populateCourseDropdown);
        // Fallback: also populate on DOMContentLoaded
        populateCourseDropdown();
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const assignmentId = document.getElementById('assignmentId').value;
        const isEdit = assignmentId && assignmentId.trim().length > 0;
        const title = document.getElementById('assignmentTitle').value;
        const description = document.getElementById('assignmentDescription').value;
        const dueDate = document.getElementById('assignmentDueDate').value;
        const courseId = document.getElementById('assignmentCourse').value;
        const payload = {
            title,
            description,
            dueDate
        };
        if (courseId && courseId.trim().length > 0) {
            payload.courseId = courseId;
        }
        try {
            if (isEdit) {
                await apiFetch(`/api/assignments/${assignmentId}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await apiFetch('/api/assignments', { method: 'POST', body: JSON.stringify(payload) });
            }
            await renderAssignments();
            form.reset();
            closeModal('assignmentModal');
            if (window.showNotification) showNotification(isEdit ? '✓ Assignment updated successfully!' : '✓ Assignment created successfully!', 'success');
        } catch (err) {
            if (window.showNotification) showNotification('⚠️ Unable to save assignment.', 'error');
        }
    });
}

// Ensure assignments render after section/component is loaded
function initAssignmentsSection() {
    // If using dynamic includes, wait for the section to exist
    const tryRender = () => {
        const container = document.getElementById('assignmentsContainer');
        const createBtn = document.getElementById('createAssignmentBtn');
        if (container && createBtn) {
            renderAssignments();
            // Always re-attach event listener after dynamic load
            createBtn.onclick = () => {
                // Reset modal to create mode
                document.getElementById('assignmentModalTitle').textContent = 'Create Assignment';
                document.getElementById('assignmentId').value = '';
                document.getElementById('assignmentForm').reset();
                populateCourseDropdown();
                document.getElementById('assignmentModal').classList.add('active');
                document.body.style.overflow = 'hidden';
            };
        } else {
            setTimeout(tryRender, 100); // Retry until loaded
        }
    };
    tryRender();
}

document.addEventListener('DOMContentLoaded', () => {
    initAssignmentsSection();
    setupAssignmentForm();
    // Add close handler for submissions modal X button
    const submissionsModal = document.getElementById('submissionsModal');
    if (submissionsModal) {
        const closeBtn = submissionsModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                submissionsModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    }

    // Add close handlers for assignment modal (X and Cancel)
    const assignmentModal = document.getElementById('assignmentModal');
    if (assignmentModal) {
        // X button
        const closeBtn = assignmentModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                assignmentModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        // Cancel button
        const cancelBtn = assignmentModal.querySelector('.modal-close-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                assignmentModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    }
});
