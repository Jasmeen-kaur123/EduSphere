import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

function CourseCard({ course, enrolled=false, onEnrolled }){
  const [loading, setLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(Boolean(enrolled))
  const handleEnroll = async ()=>{
    if(isEnrolled) return
    setLoading(true)
    try{
      const res = await api.enrollCourse(course._id)
      // show server message when available
      if(res && res.message) alert(res.message)
      else alert('Enrolled successfully')
      setIsEnrolled(true)
      if(onEnrolled) await onEnrolled()
    }catch(err){
      console.error('Enroll failed', err)
      const msg = (err && err.data && err.data.message) || (err && err.message) || 'Failed to enroll'
      alert(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <p className="text-sm text-gray-500 mt-2">{course.description || 'No description provided.'}</p>
          <div className="text-xs text-gray-400 mt-3">Instructor: {course.instructor ? (typeof course.instructor === 'string' ? course.instructor : (course.instructor.name || course.instructor._id)) : 'TBA'}</div>
        </div>
        <div className="ml-4 flex flex-col gap-2">
          <button disabled={loading || isEnrolled} onClick={handleEnroll} className={`px-3 py-2 ${loading || isEnrolled ? 'bg-gray-300' : 'bg-blue-600 text-white'} rounded`}>{isEnrolled ? 'Enrolled' : (loading ? 'Enrolling...' : 'Enroll')}</button>
          <button onClick={()=>window.location.href = `/course/${course._id}`} className="px-3 py-2 border rounded">View</button>
        </div>
      </div>
    </div>
  )
}

export default function Browse(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const [cs, my] = await Promise.all([api.fetchCourses(), api.fetchMyCourses()])
        const coursesList = Array.isArray(cs) ? cs : []
        // my may be array of { course, completedLessons } or simple course objects
        const enrolledIds = new Set(

  (Array.isArray(my) ? my : [])

    .map(x => {

      if (x.course?._id) {
        return String(x.course._id)
      }

      if (x._id) {
        return String(x._id)
      }

      return null
    })

    .filter(Boolean)

)
        if(mounted){
          setCourses(coursesList)
          setEnrolledIds(enrolledIds)
        }
      }catch(err){
        console.error('Browse load error', err)
        if(mounted) setError(err)
      } finally { if(mounted) setLoading(false) }
    }
    load()
    return ()=> mounted = false
  },[])

  const [enrolledIds, setEnrolledIds] = useState(new Set())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold">Browse Courses</h1>
            </div>

            {loading && <div className="text-gray-500">Loading courses...</div>}
            {error && <div className="text-red-600">Failed to load courses: {error.message || JSON.stringify(error)}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(c => (
                  <CourseCard key={c._id || c.title} course={c} enrolled={enrolledIds.has(String(c._id || c))} onEnrolled={async ()=>{
                    // refresh enrollment state when enrollment completes
                    try{
                      const my = await api.fetchMyCourses()
                      const newSet = new Set(

  (Array.isArray(my) ? my : [])

    .map(x => {

      if (x.course?._id) {
        return String(x.course._id)
      }

      if (x._id) {
        return String(x._id)
      }

      return null
    })

    .filter(Boolean)

)
                      setEnrolledIds(newSet)
                    }catch(e){ console.error('refresh enrolled ids failed', e) }
                  }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
