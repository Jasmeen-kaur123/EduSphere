// ================= COMMON SCRIPT =================

document.addEventListener('DOMContentLoaded', function () {

  const token = localStorage.getItem("token");

  // ================= COURSES PAGE =================

  const container = document.getElementById('coursesContainer');

  if (container) {

    fetch('/api/courses', {
      headers: {
        Authorization: "Bearer " + token
      }
    })
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