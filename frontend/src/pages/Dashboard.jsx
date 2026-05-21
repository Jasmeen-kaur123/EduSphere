import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Dashboard() {

  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [profile, setProfile] = useState({
    name: 'Student'
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {

    let mounted = true

    async function load() {

      try {

        // FETCH ENROLLED COURSES
        const cs = await api.fetchMyCourses()

        if (mounted) {
          setCourses(Array.isArray(cs) ? cs : [])
        }

        // FETCH ASSIGNMENTS
        const as = await api.fetchAssignments()

        if (mounted) {
          setAssignments(Array.isArray(as) ? as : [])
        }

        // FETCH PROFILE
        try {

          const p = await api.getProfile()

          if (p && mounted) {
            setProfile(p)
          }

        } catch (err) {
          console.log(err)
        }

      } catch (err) {

        console.error(err)

        if (mounted) {
          setError(err)
        }

      } finally {

        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }

  }, [])

  const initials =
  profile?.name?.[0]?.toUpperCase() || 'U'

  const enrolledCount = courses.length

 const pendingAssignments = assignments.filter(
  a => (a.submission?.status || 'pending') !== 'graded'
).length

  function resumeCourse(course) {

    const courseId =
      course.course?._id || course._id

    if (!courseId) {
      console.error('Course ID missing')
      return
    }

    navigate(`/course/${courseId}`, {
      state: {
        lessonIndex: course.lastLesson || 0
      }
    })
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          {/* ERROR */}

          {error && (

            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl">
              Something went wrong
            </div>

          )}

          {/* HEADER */}

          <div className="flex items-center justify-between mb-8">

            <h1 className="text-4xl font-extrabold">
              Dashboard
            </h1>

            <div className="flex items-center gap-4">

              <div className="relative">

                <input
                  placeholder="Search courses, assignments..."
                  className="pl-10 pr-4 py-3 rounded-2xl border border-gray-200 w-96"
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

              </div>

              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                🔔
              </div>

              <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {initials}
              </div>

            </div>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="text-gray-500">
                Enrolled Courses
              </div>

              <div className="text-4xl font-bold mt-3">
                {enrolledCount}
              </div>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="text-gray-500">
                Assignments Due
              </div>

              <div className="text-4xl font-bold mt-3">
                {pendingAssignments}
              </div>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="text-gray-500">
                Avg. Score
              </div>

              <div className="text-4xl font-bold mt-3">
                85%
              </div>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <div className="text-gray-500">
                Hours Learned
              </div>

              <div className="text-4xl font-bold mt-3">
                {courses.length * 5}
              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CONTINUE LEARNING */}

            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-3xl font-bold">
                    Continue Learning
                  </h2>

                  <p className="text-gray-500">
                    Continue where you left off
                  </p>

                </div>

                <button className="border px-4 py-2 rounded-xl">
                  View All
                </button>

              </div>

              {loading && (

                <div className="text-gray-500">
                  Loading...
                </div>

              )}

              {!loading && courses.length === 0 && (

                <div className="text-gray-500">
                  No enrolled courses
                </div>

              )}

              <div className="space-y-4">

                {courses.map((course, index) => {

                  const courseData =
                    course.course || course

                  const totalLessons =
                    courseData.lessons?.length || 0

                  const completedCount =
                    course.completedLessons?.length || 0

                  const progress =
                    totalLessons > 0
                      ? Math.round(
                          (completedCount / totalLessons) * 100
                        )
                      : 0

                  return (

                    <div
                      key={
                        courseData._id || index
                      }
                      className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center justify-between"
                    >

                      {/* LEFT */}

                      <div className="flex items-center gap-4 flex-1 min-w-0">

                        {/* ICON */}

                        <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center text-3xl shrink-0">
                          📘
                        </div>

                        {/* CONTENT */}

                        <div className="flex-1 min-w-0">

                          <h3 className="text-xl font-bold leading-snug break-words">
                            {courseData.title || 'Untitled Course'}
                          </h3>

                          <p className="text-gray-500 text-sm mt-1">
                            {
                              courseData.instructor?.name ||
                              'Instructor'
                            }
                          </p>

                          {/* PROGRESS */}

                          <div className="mt-3">

                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{
                                  width: `${progress}%`
                                }}
                              />

                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                              Progress {progress}%
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* BUTTON */}

                      <button
                        onClick={() => resumeCourse(course)}
                        className="ml-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold whitespace-nowrap min-w-[180px]"
                      >
                        Resume Course
                      </button>

                    </div>

                  )
                })}

              </div>

            </div>

            {/* ASSIGNMENTS */}

            <aside className="bg-white rounded-2xl shadow p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-2xl font-bold">
                    Upcoming Assignments
                  </h2>

                  <p className="text-gray-500">
                    Due dates and status
                  </p>

                </div>

                <button className="border px-4 py-2 rounded-xl">
                  View All
                </button>

              </div>

              <div className="space-y-4">

                {assignments.length === 0 && (

                  <div className="text-gray-500">
                    No assignments
                  </div>

                )}

                {assignments.map((a, index) => (

                  <div
                    key={a._id || index}
                    className="border rounded-xl p-4 flex items-center justify-between"
                  >

                    <div>

                      <div className="font-semibold">
                        {a.title}
                      </div>

                      <div className="text-sm text-gray-500">

                        {a.course?.title || 'Course'} · Due:

                        {' '}

                        {a.dueDate
                          ? new Date(a.dueDate).toLocaleDateString()
                          : 'No due date'
                        }

                      </div>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        a.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : a.status === 'graded'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {a.status}
                    </span>

                  </div>

                ))}

              </div>

            </aside>

          </div>

        </main>

      </div>

    </div>
  )
}

