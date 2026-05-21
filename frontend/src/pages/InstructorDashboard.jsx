import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'

export default function InstructorDashboard() {

  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const profile = (() => {
    try {
      return JSON.parse(
        localStorage.getItem('profile')
      )
    } catch {
      return null
    }
  })()

  useEffect(() => {

    let mounted = true

    async function load() {

      try {

        const cs =
          await api.fetchCourses()

        const studentData =
          await api.fetchInstructorStudents()

        const profId =
          profile?._id

        let myCourses =
          Array.isArray(cs)
            ? cs
            : []

        if (profId) {

          myCourses = myCourses.filter(c =>

            c.instructor &&
            (
              c.instructor === profId ||
              c.instructor?._id === profId
            )
          )
        }

     const activity =
  (Array.isArray(studentData)
    ? studentData
    : []
  )
  .map(student => ({
  name: student.name || 'Student'
}))
  .sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  )
  .slice(0, 5)

        if (mounted) {

          setCourses(myCourses)

          setStudents(
            Array.isArray(studentData)
              ? studentData
              : []
          )

          setRecentActivity(activity)
        }

      } catch (err) {

        console.error(
          'Instructor dashboard error',
          err
        )

      } finally {

        if (mounted)
          setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }

  }, [])

  const activeCourses =
    courses.length

  const totalStudents =
    students.length

  

  const initials =
    profile?.name
      ?.split(' ')
      ?.map(x => x[0])
      ?.join('')
      ?.toUpperCase() || 'I'

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-8">

            <h1 className="text-4xl font-bold">

              Welcome,
              {' '}
              {profile?.name || 'Instructor'}

            </h1>

            <div className="flex items-center gap-4">

              <div className="relative">

                <input
                  placeholder="Search courses, assignments..."
                  className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 w-80 bg-white"
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-4 text-gray-400"
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

              <div className="h-11 w-11 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                🔔
              </div>

              <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {initials}
              </div>

            </div>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

            <div className="bg-white rounded-2xl p-5 shadow-sm">

              <div className="text-gray-500">
                Total Students
              </div>

              <div className="text-3xl font-bold mt-3">
                {totalStudents}
              </div>

              <div className="text-green-500 text-sm mt-2">
                +{totalStudents} enrolled
              </div>

            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">

              <div className="text-gray-500">
                Active Courses
              </div>

              <div className="text-3xl font-bold mt-3">
                {activeCourses}
              </div>

              <div className="text-green-500 text-sm mt-2">
                {activeCourses} published
              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* COURSES */}

            <section className="bg-white rounded-2xl p-6 shadow-sm">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold">
                  Your Courses
                </h2>

                <CreateNewButton />

              </div>

              {loading && (
                <div>Loading...</div>
              )}

              {!loading &&
                courses.length === 0 && (

                <div className="text-gray-500">
                  No courses found
                </div>

              )}

              <div className="space-y-4">

                {courses.map(course => (

                  <div
                    key={course._id}
                    className="border rounded-2xl p-5 flex items-center justify-between"
                  >

                    <div>

                      <div className="font-semibold text-lg">
                        {course.title}
                      </div>

                      <div className="text-gray-500 text-sm mt-1">
                        ⭐ {course.rating || 4.8}
                      </div>

                    </div>

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                      Published
                    </span>

                  </div>

                ))}

              </div>

            </section>

            {/* RECENT ACTIVITY */}
{/* RECENT ACTIVITY */}

<section className="bg-white rounded-2xl p-6 shadow-sm">

  <h2 className="text-2xl font-bold mb-6">
    Recent Activity
  </h2>

  {recentActivity.length === 0 ? (

    <div className="text-gray-500">
      No recent activity
    </div>

  ) : (

    <div className="divide-y">

      {recentActivity.map((item, index) => (

        <div
          key={index}
          className="flex items-center gap-4 py-5"
        >

          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
            📚
          </div>

          <div>

            <p className="font-medium text-lg">
              New enrollment: {item.name}
            </p>

            <p className="text-gray-400 text-sm">
              Just now
            </p>

          </div>

        </div>

      ))}

    </div>

  )}

</section>
          </div>

        </main>

      </div>

    </div>
  )
}

function CreateNewButton() {

  const navigate =
    useNavigate()

  return (

    <button
      onClick={() =>
        navigate('/create-course')
      }
      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700"
    >
      + Create New
    </button>

  )
}