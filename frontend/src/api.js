const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, opts = {}){
  const headers = opts.headers || {}

  headers['Content-Type'] = 'application/json'

  const token = getToken()

  if(token){

  headers['Authorization'] = `Bearer ${token}`

}



  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers
  })

  const text = await res.text()

  try{
    const data = JSON.parse(text)

    if(!res.ok) throw { status: res.status, data }

    return data

  }catch(e){

    if(!res.ok) throw { status: res.status, data: text }

    return text
  }
}

export async function fetchCourses(){
  return request('/api/courses', { method: 'GET' })
}
export async function fetchAssignments(){
  return request('/api/assignments', { method: 'GET' })
}
export async function fetchInstructorAssignments(){
  return request('/api/assignments', { method: 'GET' })
}
export async function createAssignment(payload){
  return request('/api/assignments', { method: 'POST', body: JSON.stringify(payload) })
}
export async function fetchProfile(){
  const token = getToken()
  if(!token) return null
  try{
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.id, role: payload.role }
  }catch(e){ return null }
}
export async function getProfile(){
  return request('/api/auth/me', { method: 'GET' })
}
export async function enrollCourse(courseId){
  return request('/api/enroll/enroll', { method: 'POST', body: JSON.stringify({ courseId }) })
}
export async function fetchMyCourses(){
  return request('/api/enroll/me', { method: 'GET' })
}
export async function fetchCourseById(id){
  return request(`/api/enroll/course/${id}`, { method: 'GET' })
}
export async function completeLesson(courseId, lessonIndex){
  return request('/api/enroll/complete', { method: 'POST', body: JSON.stringify({ courseId, lessonIndex }) })
}
export async function fetchInstructorStudents(){
  return request('/api/instructor/students', { method: 'GET' })
}
export async function submitAssignment(id, body){
  return request(`/api/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(body) })
}
export async function gradeAssignment(id, body){
  return request(`/api/assignments/${id}/grade`, { method: 'POST', body: JSON.stringify(body) })
}

export async function fetchInstructorCourses() {
  return request('/api/courses/instructor', {
    method: 'GET'
  })
}

export async function fetchInstructorCourseById(id) {

  return request(
    `/api/courses/${id}`,
    {
      method: "GET"
    }
  );

}

export async function updateCourse(id, data) {
  return request(`/api/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ✅ FIXED: submitAssignment & gradeAssignment added to default export
export default {
  fetchCourses,
  fetchInstructorCourses, // ✅ add this
  fetchInstructorCourseById,
  fetchAssignments,
  fetchInstructorAssignments,
  fetchProfile,
  getProfile,
  enrollCourse,
  fetchMyCourses,
  fetchCourseById,
  completeLesson,
  fetchInstructorStudents,
  createAssignment,
  submitAssignment,
  gradeAssignment
}