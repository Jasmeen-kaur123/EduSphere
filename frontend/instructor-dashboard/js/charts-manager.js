// Chart instance
let enrollmentChart = null;

// Chart.js - Performance Chart
async function initPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Compute last 6 months as labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth()
    });
  }

  // Fetch courses via backend and fallback to local storage
  let courses = [];
  try {
    courses = await fetchCourses();
  } catch (err) {
    courses = [];
  }

  const enrollmentsPerMonth = months.map(() => 0);

  courses.forEach(course => {
    const createdAt = course.createdAt ? new Date(course.createdAt) : null;
    if (!createdAt) return;

    const idx = months.findIndex(m => m.year === createdAt.getFullYear() && m.month === createdAt.getMonth());
    if (idx >= 0) {
      enrollmentsPerMonth[idx] += 1;
    }
  });

  // Destroy existing chart (if any) before rendering a new one
  if (enrollmentChart) {
    enrollmentChart.destroy();
    enrollmentChart = null;
  }

  enrollmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'New Enrollments',
          data: enrollmentsPerMonth,
          backgroundColor: '#6C4AB6',
          borderRadius: 5,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#8A8A8A',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#E8E4F0',
            drawBorder: false
          },
          ticks: {
            color: '#8A8A8A',
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#8A8A8A',
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}
