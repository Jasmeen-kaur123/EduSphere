// mycourses.js - Handles dynamic rendering of courses using localStorage


// Helper to call backend APIs (copied from main.js if not already present)
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

async function fetchCourses() {
    try {
        return await apiFetch('/api/courses');
    } catch (err) {
        // fallback to localStorage for offline/demo mode
        return JSON.parse(localStorage.getItem('courses') || '[]');
    }
}

async function renderCourses() {
    const container = document.getElementById('coursesContainer');
    if (!container) return;
    container.innerHTML = '';
    let courses = await fetchCourses();
    if (!Array.isArray(courses)) courses = [];
    if (courses.length === 0) {
        container.innerHTML = '<p class="muted">No courses available. Click "+ Create New Course" to add one.</p>';
        return;
    }
    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <div class="course-header">
                <h3>${course.name || course.title || 'Untitled Course'}</h3>
                <div class="course-actions">
                    <button class="btn-icon edit-course" title="Edit">✏️</button>
                    <button class="btn-icon delete-course" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="course-info">
                <p>${course.description || ''}</p>
                <span class="course-duration">Duration: ${course.duration || '?'} weeks</span>
            </div>
        `;
        // Add event listeners for edit/delete
        card.querySelector('.edit-course').addEventListener('click', () => {
            if (window.openCourseModal) window.openCourseModal('edit', course);
        });
        card.querySelector('.delete-course').addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete "${course.name || course.title}"?`)) {
                // Optionally call backend to delete
                try {
                    await apiFetch(`/api/courses/${course._id || course.id}`, { method: 'DELETE' });
                } catch (err) {
                    // fallback: remove from localStorage
                    let allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
                    allCourses = allCourses.filter(c => (c._id || c.id) !== (course._id || course.id));
                    localStorage.setItem('courses', JSON.stringify(allCourses));
                }
                renderCourses();
            }
        });
        container.appendChild(card);
    });
}

// Expose for global use
window.renderCourses = renderCourses;
// Optionally auto-render on DOMContentLoaded
document.addEventListener('DOMContentLoaded', renderCourses);
