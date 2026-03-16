// Common front-end script for pages
document.addEventListener('DOMContentLoaded', function() {
	// Render courses on courses page
	const container = document.getElementById('coursesContainer');
	if (container) {
		fetch('/api/courses')
			.then(res => res.json())
			.then(courses => {
				if (!Array.isArray(courses) || courses.length === 0) {
					container.innerHTML = '<p>No courses available.</p>';
					return;
				}

				const html = courses.map(c => `
					<div class="course-card">
						<h3>${c.title}</h3>
						<p>Instructor: ${c.instructor}</p>
					</div>
				`).join('');

				container.innerHTML = html;
			})
			.catch(err => {
				console.error('Failed to load courses', err);
				container.innerHTML = '<p>Error loading courses.</p>';
			});
	}

			// Render courses grouped by instructor on dashboard (if present)
			const instructorWrap = document.getElementById('instructorCourses');
			if (instructorWrap) {
				fetch('/api/courses')
					.then(res => res.json())
					.then(courses => {
						if (!Array.isArray(courses) || courses.length === 0) {
							instructorWrap.innerHTML = '<p>No instructor courses available.</p>';
							return;
						}

						// Group courses by instructor
						const grouped = courses.reduce((acc, c) => {
							const key = c.instructor || 'Unknown';
							if (!acc[key]) acc[key] = [];
							acc[key].push(c);
							return acc;
						}, {});

						const html = Object.entries(grouped).map(([instructor, list]) => `
							<div class="instructor-card" style="margin-bottom:12px;padding:12px;border-radius:8px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
								<h4 style="margin:0 0 8px 0">${instructor}</h4>
								<ul style="margin:0;padding-left:18px;">
									${list.map(c => `<li>${c.title}</li>`).join('')}
								</ul>
							</div>
						`).join('');

						instructorWrap.innerHTML = html;
					})
					.catch(err => {
						console.error('Failed to load instructor courses', err);
						instructorWrap.innerHTML = '<p>Error loading instructor courses.</p>';
					});
			}
});
