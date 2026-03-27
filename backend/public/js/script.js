// ================= COMMON SCRIPT =================

document.addEventListener('DOMContentLoaded', function () {

  const token = localStorage.getItem("token");
  const currentStudentName = localStorage.getItem('username') || 'Student';
  const currentStudentEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function hasStudentSubmitted(assignment) {
    if (!currentStudentEmail || !Array.isArray(assignment?.submissions)) return false;
    return assignment.submissions.some((s) => s?.studentEmail === currentStudentEmail);
  }

  function ensureAssignmentStartModal() {
    if (document.getElementById('assignmentStartModal')) return;

    const style = document.createElement('style');
    style.textContent = `
      .assignment-modal-backdrop { position: fixed; inset: 0; background: rgba(10,10,10,0.45); display: none; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
      .assignment-modal-backdrop.open { display: flex; }
      .assignment-modal { width: min(760px, 100%); max-height: 90vh; overflow: auto; background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
      .assignment-modal-head { padding: 16px 20px; border-bottom: 1px solid #ececec; display: flex; justify-content: space-between; align-items: center; }
      .assignment-modal-body { padding: 16px 20px; }
      .assignment-question { margin-bottom: 14px; }
      .assignment-question label { display: block; font-weight: 600; margin-bottom: 6px; }
      .assignment-question textarea { width: 100%; min-height: 90px; padding: 10px; border: 1px solid #d6d6d6; border-radius: 8px; font-family: inherit; }
      .assignment-modal-actions { padding: 16px 20px; border-top: 1px solid #ececec; display: flex; gap: 10px; justify-content: flex-end; }
      .assignment-close-btn { border: 0; background: transparent; font-size: 22px; cursor: pointer; }
      .assignment-secondary-btn { background: #efefef; color: #333; border: 0; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'assignmentStartModal';
    modal.className = 'assignment-modal-backdrop';
    modal.innerHTML = `
      <div class="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignmentStartTitle">
        <div class="assignment-modal-head">
          <h3 id="assignmentStartTitle">Start Assignment</h3>
          <button type="button" class="assignment-close-btn" id="assignmentStartClose">&times;</button>
        </div>
        <form id="assignmentStartForm">
          <div class="assignment-modal-body" id="assignmentStartBody"></div>
          <div class="assignment-modal-actions">
            <button type="button" class="assignment-secondary-btn" id="assignmentStartCancel">Cancel</button>
            <button type="submit" class="btn">Submit Assignment</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.classList.remove('open');
    document.getElementById('assignmentStartClose').addEventListener('click', close);
    document.getElementById('assignmentStartCancel').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  function renderStudentAssignments(container, assignments, emptyMessage) {
    if (!Array.isArray(assignments) || assignments.length === 0) {
      container.innerHTML = `<p>${emptyMessage}</p>`;
      return;
    }

    const assignmentsById = {};

    const html = assignments.map((a) => {
      const assignmentId = a._id || a.id;
      assignmentsById[assignmentId] = a;

      const alreadySubmitted = hasStudentSubmitted(a);
      const statusLabel = alreadySubmitted
        ? '<span style="color: #2E8B57;">Completed</span>'
        : '<span style="color: #FF6B81;">Pending</span>';
      const buttonLabel = alreadySubmitted ? 'Submitted' : 'Start Assignment';
      const buttonDisabled = alreadySubmitted ? 'disabled' : '';

      return `
        <div class="course-card">
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.description)}</p>
          <p><strong>Course:</strong> ${escapeHtml(a.courseName)}</p>
          <p><strong>Instructor:</strong> ${escapeHtml(a.instructor)}</p>
          <p><strong>Due Date:</strong> ${new Date(a.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${statusLabel}</p>
          <button class="btn start-assignment-btn" data-assignment-id="${assignmentId}" ${buttonDisabled}>${buttonLabel}</button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.start-assignment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const assignment = assignmentsById[btn.dataset.assignmentId];
        if (!assignment) return;

        openAssignmentStartModal(assignment, async () => {
          const studentEmail = currentStudentEmail;
          const assignmentsUrl = studentEmail
            ? `/api/assignments?studentEmail=${encodeURIComponent(studentEmail)}`
            : '/api/assignments';

          const refreshed = await fetch(assignmentsUrl).then((res) => res.json());
          renderStudentAssignments(container, refreshed, emptyMessage);
        });
      });
    });
  }

  function openAssignmentStartModal(assignment, onSubmitted) {
    ensureAssignmentStartModal();

    if (!currentStudentEmail) {
      alert('Please login again to submit this assignment.');
      return;
    }

    const modal = document.getElementById('assignmentStartModal');
    const titleEl = document.getElementById('assignmentStartTitle');
    const bodyEl = document.getElementById('assignmentStartBody');
    const formEl = document.getElementById('assignmentStartForm');

    const questions = Array.isArray(assignment.questions) && assignment.questions.length > 0
      ? assignment.questions
      : [{ questionText: 'Write your response for this assignment based on the description.' }];

    titleEl.textContent = assignment.title || 'Start Assignment';
    bodyEl.innerHTML = `
      <p style="margin: 0 0 10px 0;"><strong>Description:</strong> ${escapeHtml(assignment.description)}</p>
      ${questions.map((q, idx) => `
        <div class="assignment-question">
          <label for="assignmentAnswer_${idx}">Q${idx + 1}. ${escapeHtml(q.questionText || q)}</label>
          <textarea id="assignmentAnswer_${idx}" data-question="${escapeHtml(q.questionText || q)}" required></textarea>
        </div>
      `).join('')}
    `;

    formEl.onsubmit = async function (e) {
      e.preventDefault();

      const answerInputs = bodyEl.querySelectorAll('textarea[data-question]');
      const answers = Array.from(answerInputs).map((el) => ({
        questionText: el.getAttribute('data-question') || '',
        answerText: (el.value || '').trim()
      }));

      if (answers.some((a) => !a.answerText)) {
        alert('Please answer all questions before submitting.');
        return;
      }

      try {
        const response = await fetch(`/api/assignments/${assignment._id || assignment.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: currentStudentName,
            studentEmail: currentStudentEmail,
            answers
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit assignment');
        }

        modal.classList.remove('open');
        alert('Assignment submitted successfully!');
        if (typeof onSubmitted === 'function') {
          await onSubmitted();
        }
      } catch (err) {
        console.error('Assignment submit error', err);
        alert(err.message || 'Error submitting assignment');
      }
    };

    modal.classList.add('open');
  }

  // ================= MY ASSIGNMENTS PAGE (STUDENT) =================

  const assignmentsContainer = document.getElementById('assignmentsContainer');

  if (assignmentsContainer) {
    const studentEmail = currentStudentEmail;
    const assignmentsUrl = studentEmail
      ? `/api/assignments?studentEmail=${encodeURIComponent(studentEmail)}`
      : '/api/assignments';

    fetch(assignmentsUrl)
      .then(res => res.json())
      .then(assignments => {

        renderStudentAssignments(assignmentsContainer, assignments, 'No assignments available.');

      })
      .catch(err => {
        console.error('Failed to load assignments', err);
        assignmentsContainer.innerHTML = '<p>Error loading assignments.</p>';
      });
  }


  // ================= MY COURSES PAGE (STUDENT) =================

  const coursesContainer = document.getElementById('coursesContainer');

  if (coursesContainer) {

    fetch('/api/courses')
      .then(res => res.json())
      .then(courses => {

        if (!Array.isArray(courses) || courses.length === 0) {
          coursesContainer.innerHTML = '<p>No courses available.</p>';
          return;
        }

        const studentEmail = localStorage.getItem('userEmail');
        
        const html = courses.map(c => {
          const isEnrolled = studentEmail && c.enrolledStudents && c.enrolledStudents.some(s => s.studentEmail === studentEmail);
          const buttonHTML = isEnrolled 
            ? `<button class="btn" disabled style="background-color: #ccc; cursor: not-allowed;">✓ Enrolled</button>`
            : `<button class="btn" onclick="enrollInCourse('${c._id}', '${c.name}')">Enroll Now</button>`;
          
          return `
            <div class="course-card">
              <h3>${c.name}</h3>
              <p>${c.description}</p>
              <p><strong>Instructor:</strong> ${c.instructor}</p>
              <p><strong>Duration:</strong> ${c.duration} weeks</p>
              <p><strong>Students Enrolled:</strong> ${c.students}</p>
              ${buttonHTML}
            </div>
          `;
        }).join('');

        coursesContainer.innerHTML = html;

      })
      .catch(err => {
        console.error('Failed to load courses', err);
        coursesContainer.innerHTML = '<p>Error loading courses.</p>';
      });
  }

  // ================= AVAILABLE COURSES ON DASHBOARD =================

  const availableCoursesContainer = document.getElementById('availableCoursesContainer');

  if (availableCoursesContainer) {

    fetch('/api/courses')
      .then(res => res.json())
      .then(courses => {

        if (!Array.isArray(courses) || courses.length === 0) {
          availableCoursesContainer.innerHTML = '<p>No courses available at the moment.</p>';
          return;
        }

        const studentEmail = localStorage.getItem('userEmail');
        
        const html = courses.map(c => {
          const isEnrolled = studentEmail && c.enrolledStudents && c.enrolledStudents.some(s => s.studentEmail === studentEmail);
          const buttonHTML = isEnrolled 
            ? `<button class="btn" disabled style="background-color: #ccc; cursor: not-allowed;">✓ Enrolled</button>`
            : `<button class="btn" onclick="enrollInCourse('${c._id}', '${c.name}')">Enroll Now</button>`;
          
          return `
            <div class="course-card">
              <h3>${c.name}</h3>
              <p>${c.description}</p>
              <p><strong>Instructor:</strong> ${c.instructor}</p>
              <p><strong>Duration:</strong> ${c.duration} weeks</p>
              <p><strong>Students Enrolled:</strong> ${c.students}</p>
              ${buttonHTML}
            </div>
          `;
        }).join('');

        availableCoursesContainer.innerHTML = html;

      })
      .catch(err => {
        console.error('Failed to load courses', err);
        availableCoursesContainer.innerHTML = '<p>Error loading courses.</p>';
      });
  }


  // ================= AVAILABLE ASSIGNMENTS ON DASHBOARD =================

  const availableAssignmentsContainer = document.getElementById('availableAssignmentsContainer');

  if (availableAssignmentsContainer) {
    const studentEmail = currentStudentEmail;
    const assignmentsUrl = studentEmail
      ? `/api/assignments?studentEmail=${encodeURIComponent(studentEmail)}`
      : '/api/assignments';

    fetch(assignmentsUrl)
      .then(res => res.json())
      .then(assignments => {

        renderStudentAssignments(
          availableAssignmentsContainer,
          assignments,
          'No assignments available at the moment.'
        );

      })
      .catch(err => {
        console.error('Failed to load assignments', err);
        availableAssignmentsContainer.innerHTML = '<p>Error loading assignments.</p>';
      });
  }


  // ================= DASHBOARD (INSTRUCTOR COURSES) =================

  const instructorWrap = document.getElementById('instructorCourses');

  if (instructorWrap) {

    fetch('/api/courses', {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(courses => {

        if (!Array.isArray(courses) || courses.length === 0) {
          instructorWrap.innerHTML = '<p>No instructor courses available.</p>';
          return;
        }

        // Group by instructor
        const grouped = courses.reduce((acc, c) => {
          const key = c.instructor || 'Unknown';
          if (!acc[key]) acc[key] = [];
          acc[key].push(c);
          return acc;
        }, {});

        const html = Object.entries(grouped).map(([instructor, list]) => `
          <div class="instructor-card" style="margin-bottom:12px;padding:12px;border-radius:8px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <h4>${instructor}</h4>
            <ul>
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


  // ================= TESTIMONIALS =================

  fetch("/api/testimonials")
    .then(res => res.json())
    .then(data => {
      const container = document.querySelector(".testimonial-container");

      if (container) {
        container.innerHTML = data.map(t => `
          <div class="testimonial-card">
            <h3>${t.name}</h3>
            <p>${t.message}</p>
          </div>
        `).join("");
      }
    })
    .catch(err => console.error("Testimonials error:", err));


  // ================= FAQ =================

  fetch("/api/faqs")
    .then(res => res.json())
    .then(data => {

      const container = document.querySelector(".faq-container");

      if (container) {

        container.innerHTML = data.map(f => `
          <div class="faq-item">
            <button class="faq-question">
              ${f.question} <span>+</span>
            </button>
            <div class="faq-answer" style="max-height:0;overflow:hidden;transition:0.3s;">
              <p>${f.answer}</p>
            </div>
          </div>
        `).join("");

        // ✅ Attach click events AFTER rendering
        document.querySelectorAll(".faq-question").forEach((q) => {
          q.addEventListener("click", () => {

            const answer = q.nextElementSibling;
            const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";

            // Close all
            document.querySelectorAll(".faq-answer").forEach(a => {
              a.style.maxHeight = "0px";
            });

            document.querySelectorAll(".faq-question span").forEach(s => {
              s.textContent = "+";
            });

            // Open current
            if (!isOpen) {
              answer.style.maxHeight = answer.scrollHeight + "px";
              q.querySelector("span").textContent = "−";
            }

          });
        });

      }

    })
    .catch(err => console.error("FAQ error:", err));

});


// ================= OPTIONAL LOGIN FUNCTION =================

function loginUser() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        window.location.href = "/pages/dashboard.html";
      } else {
        alert(data.message);
      }

    });
}

// ================= COURSE ENROLLMENT FUNCTION =================

function enrollInCourse(courseId, courseName) {
  const studentName = localStorage.getItem('username') || prompt('Enter your name:');
  const studentEmail = localStorage.getItem('userEmail') || prompt('Enter your email:');

  if (!studentName || !studentEmail) {
    alert('Student name and email are required');
    return;
  }

  fetch(`/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentName: studentName,
      studentEmail: studentEmail
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success || data.course) {
        alert(`✓ Successfully enrolled in "${courseName}"!`);
        // Reload the page to refresh course counts and button states
        setTimeout(() => {
          location.reload();
        }, 500);
      } else {
        alert(data.error || 'Failed to enroll in course');
      }
    })
    .catch(err => {
      console.error('Enrollment error:', err);
      alert('Error enrolling in course');
    });
}



// ================= SIGNUP FUNCTION =================

function signupUser() {

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  })
    .then(res => res.json())
    .then(data => {

      if (data.success) {
        alert("Signup successful!");
        window.location.href = "/pages/login.html";
      } else {
        alert(data.message);
      }

    });
}