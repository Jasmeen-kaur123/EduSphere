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
    const [courses, assignments, exams] = await Promise.all([
        apiFetch('/api/courses'),
        apiFetch('/api/assignments'),
        apiFetch('/api/exams')
    ]);
    document.getElementById('statCourses').textContent = Array.isArray(courses) ? courses.length : 0;
    document.getElementById('statAssignments').textContent = Array.isArray(assignments) ? assignments.length : 0;
    document.getElementById('statExams').textContent = Array.isArray(exams) ? exams.length : 0;
    // Students count is not implemented, keep as 0
    document.getElementById('statStudents').textContent = 0;

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

// For modular load, call from initializeApp if present
if (typeof window.initializeApp === 'function') {
    // do nothing, will be called after load
} else {
    document.addEventListener('DOMContentLoaded', renderDashboardStats);
}
// Expose for initializeApp
window.renderDashboardStats = renderDashboardStats;
