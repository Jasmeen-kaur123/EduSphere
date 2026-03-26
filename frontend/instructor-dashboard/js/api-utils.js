// API base (used to call backend endpoints)
const API_BASE = '';

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
