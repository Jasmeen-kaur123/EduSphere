// Global Search
async function getGlobalSearchResults(query) {
  const [courses, students, assignments, exams] = await Promise.all([
    fetchCourses().catch(() => []),
    fetchStudents().catch(() => []),
    apiFetch('/api/assignments').catch(() => []),
    apiFetch('/api/exams').catch(() => [])
  ]);

  const results = [];

  (Array.isArray(courses) ? courses : []).forEach((course) => {
    const title = course.name || course.title || 'Untitled Course';
    const description = course.description || '';
    if (`${title} ${description}`.toLowerCase().includes(query)) {
      results.push({
        title,
        meta: 'Course • My Courses',
        sectionId: 'mycourses'
      });
    }
  });

  (Array.isArray(students) ? students : []).forEach((student) => {
    const name = student.name || 'Unknown Student';
    const email = student.email || '';
    if (`${name} ${email}`.toLowerCase().includes(query)) {
      results.push({
        title: name,
        meta: `Student • ${email || 'Student Enrollment'}`,
        sectionId: 'students'
      });
    }
  });

  (Array.isArray(assignments) ? assignments : []).forEach((assignment) => {
    const title = assignment.title || 'Untitled Assignment';
    const description = assignment.description || '';
    if (`${title} ${description}`.toLowerCase().includes(query)) {
      results.push({
        title,
        meta: 'Assignment • Assignments',
        sectionId: 'assignments'
      });
    }
  });

  (Array.isArray(exams) ? exams : []).forEach((exam) => {
    const title = exam.title || 'Untitled Exam';
    const time = exam.time || '';
    if (`${title} ${time}`.toLowerCase().includes(query)) {
      results.push({
        title,
        meta: 'Exam • Exams',
        sectionId: 'exams'
      });
    }
  });

  return results.slice(0, 8);
}

function renderGlobalSearchResults(results, resultsPanel) {
  if (!Array.isArray(results) || results.length === 0) {
    resultsPanel.innerHTML = '<div class="search-result-empty">No matching results found.</div>';
    resultsPanel.classList.add('active');
    return;
  }

  resultsPanel.innerHTML = results.map((result, index) => `
    <div class="search-result-item" data-result-index="${index}">
      <span class="search-result-title">${escapeHtml(result.title)}</span>
      <span class="search-result-meta">${escapeHtml(result.meta)}</span>
    </div>
  `).join('');

  resultsPanel.classList.add('active');

  resultsPanel.querySelectorAll('.search-result-item').forEach((item) => {
    item.addEventListener('click', () => {
      const result = results[Number(item.dataset.resultIndex)];
      if (!result) return;

      showSection(result.sectionId);
      resultsPanel.classList.remove('active');
      const searchInput = document.getElementById('globalSearchInput');
      if (searchInput) {
        searchInput.value = result.title;
      }
    });
  });
}

function setupGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchIcon = document.getElementById('globalSearchIcon');
  const resultsPanel = document.getElementById('globalSearchResults');
  if (!searchInput || !searchIcon || !resultsPanel || searchInput.dataset.bound === 'true') {
    return;
  }

  searchInput.dataset.bound = 'true';

  const runSearch = async () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      resultsPanel.innerHTML = '';
      resultsPanel.classList.remove('active');
      return;
    }

    const results = await getGlobalSearchResults(query);
    renderGlobalSearchResults(results, resultsPanel);
  };

  searchInput.addEventListener('input', runSearch);
  searchInput.addEventListener('focus', runSearch);
  searchIcon.addEventListener('click', runSearch);

  document.addEventListener('click', (event) => {
    if (!resultsPanel.contains(event.target) && event.target !== searchInput && event.target !== searchIcon) {
      resultsPanel.classList.remove('active');
    }
  });
}

// Search Functionality
document.querySelector('.search-input')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const tableRows = document.querySelectorAll('.student-table tbody tr');
  
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
});
