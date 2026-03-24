// dashboard.js - Handles dynamic dashboard stats rendering using localStorage

// Helper to call backend APIs
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
        return [];
    }
}

async function renderDashboardStats() {
    // Fetch counts from backend
    const [courses, assignments, exams, students] = await Promise.all([
        apiFetch('/api/courses'),
        apiFetch('/api/assignments'),
        apiFetch('/api/exams'),
        apiFetch('/api/students')
    ]);
    const safeCourses = Array.isArray(courses) ? courses : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];
    const safeExams = Array.isArray(exams) ? exams : [];
    const safeStudents = Array.isArray(students) ? students : [];

    document.getElementById('statCourses').textContent = safeCourses.length;
    document.getElementById('statAssignments').textContent = safeAssignments.length;
    document.getElementById('statExams').textContent = safeExams.length;
    document.getElementById('statStudents').textContent = safeStudents.length;

    initQuickActions();

    // Render chart if canvas exists
    const ctx = document.getElementById('performanceChart');
    if (ctx && window.Chart) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Enrollments',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#6C4AB6',
                    backgroundColor: 'rgba(108,74,182,0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function initQuickActions() {
    const grid = document.getElementById('quickActionsGrid');
    if (!grid || grid.dataset.bound === 'true') return;

    grid.dataset.bound = 'true';
    grid.addEventListener('click', (event) => {
        const button = event.target.closest('.quick-action-btn');
        if (!button) return;

        const action = button.dataset.action;
        if (action === 'create-course') {
            if (typeof window.openCourseModal === 'function') {
                window.openCourseModal('create');
            }
            return;
        }

        if (action === 'create-exam') {
            if (typeof window.openExamModal === 'function') {
                window.openExamModal('create');
            }
            return;
        }

        if (action === 'create-assignment') {
            if (typeof window.openAssignmentModal === 'function') {
                window.openAssignmentModal('create');
            }
            return;
        }

        if (action === 'view-courses') {
            if (typeof showSection === 'function') showSection('mycourses');
            return;
        }

        if (action === 'view-students') {
            if (typeof showSection === 'function') showSection('students');
            return;
        }

        if (action === 'view-assignments') {
            if (typeof showSection === 'function') showSection('assignments');
        }
    });
}

function renderLatestSubmissions(assignments, exams) {
    const container = document.getElementById('latestSubmissionsList');
    if (!container) return;

    const assignmentSubmissions = (Array.isArray(assignments) ? assignments : []).flatMap(assignment =>
        (Array.isArray(assignment.submissions) ? assignment.submissions : []).map(submission => ({
            type: 'assignment',
            icon: '📝',
            title: submission.studentName || 'Unknown student',
            subtitle: `${assignment.title || 'Untitled assignment'} • ${submission.status || 'Submitted'}`,
            extra: submission.score == null ? 'Assignment submitted' : `Score: ${submission.score}`,
            submittedAt: submission.submittedAt
        }))
    );

    const examSubmissions = (Array.isArray(exams) ? exams : []).flatMap(exam =>
        (Array.isArray(exam.results) ? exam.results : []).map(result => ({
            type: 'exam',
            icon: '🧪',
            title: result.studentName || 'Unknown student',
            subtitle: `${exam.title || 'Untitled exam'} • ${result.status || 'Completed'}`,
            extra: `Score: ${result.score}/${exam.totalMarks || 0} (${result.percentage || 0}%)`,
            submittedAt: result.submittedAt
        }))
    );

    const sorted = [...assignmentSubmissions, ...examSubmissions]
        .map(item => ({
            ...item,
            parsedDate: item.submittedAt ? new Date(item.submittedAt) : null
        }))
        .sort((a, b) => {
            const aTime = a.parsedDate && !isNaN(a.parsedDate.getTime()) ? a.parsedDate.getTime() : 0;
            const bTime = b.parsedDate && !isNaN(b.parsedDate.getTime()) ? b.parsedDate.getTime() : 0;
            return bTime - aTime;
        })
        .slice(0, 6);

    if (sorted.length === 0) {
        container.innerHTML = '<p class="submissions-empty">No student submissions yet.</p>';
        return;
    }

    container.innerHTML = sorted.map(item => `
        <div class="submission-item">
            <span class="submission-icon">${item.icon}</span>
            <div class="submission-content">
                <span class="submission-title">${escapeHtml(item.title)}</span>
                <span class="submission-meta">${escapeHtml(item.subtitle)}</span>
                <span class="submission-meta">${escapeHtml(item.extra)} • ${formatRelativeDate(item.parsedDate)}</span>
            </div>
        </div>
    `).join('');
}

function formatRelativeDate(date) {
    if (!date || isNaN(date.getTime())) return 'Date not available';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// For modular load, call from initializeApp if present
if (typeof window.initializeApp === 'function') {
    // do nothing, will be called after load
} else {
    document.addEventListener('DOMContentLoaded', renderDashboardStats);
}
// Expose for initializeApp
window.renderDashboardStats = renderDashboardStats;
