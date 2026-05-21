
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'

export default function InstructorDashboard(){

  const [courses, setCourses] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentStudentName, setRecentStudentName] =
  useState('')

  useEffect(() => {

    let mounted = true

    async function load(){

      try{

        // ALL COURSES

        const cs = await api.fetchCourses()

        // ALL STUDENTS

        const students = await api.fetchInstructorStudents()

        if (
  Array.isArray(students) &&
  students.length > 0
) {

  setRecentStudentName(
    students[0].name
  )

}

        const totalAssignments =
  assignments.length

const pendingGrades =
  assignments.filter(
    a => a.pendingSubmissions > 0
  ).reduce(
    (sum, a) =>
      sum + a.pendingSubmissions,
    0
  )

        // PROFILE

        const tokenProfile = localStorage.getItem('profile')

        let profId = null

        if(tokenProfile){

          try{
            profId = JSON.parse(tokenProfile)._id
          }catch(e){}
        }

        // FILTER COURSES

        let myCourses = Array.isArray(cs)
          ? cs
          : []

        if(profId){

          myCourses = myCourses.filter(c =>

            c.instructor &&
            (
              c.instructor._id === profId ||
              c.instructor === profId
            )
          )
        }

        if(mounted){

          setCourses(myCourses)

          // TOTAL STUDENTS FROM ENROLLMENTS

          setTotalStudents(
            Array.isArray(students)
              ? students.length
              : 0
          )
        }

      }catch(err){

        console.error(err)

      }finally{

        if(mounted){
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }

  }, [])

  // ACTIVE COURSES

  const activeCourses = courses.length

  const totalAssignments =
  assignments.length

const pendingGrades =
  assignments.filter(
    a => a.pendingSubmissions > 0
  ).reduce(
    (sum, a) =>
      sum + a.pendingSubmissions,
    0
  )

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-8">

            <h1 className="text-3xl font-bold">
              Welcome, Dr.
            </h1>

            <div className="flex items-center gap-4">

              {/* SEARCH */}

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

             

              {/* PROFILE */}

            <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold uppercase">
  {
    localStorage.getItem('profile')
      ? JSON.parse(localStorage.getItem('profile'))
          .name
          ?.split(' ')
          .map(n => n[0])
          .join('')
      : 'I'
  }
</div>

            </div>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

            {/* TOTAL STUDENTS */}

            <div className="bg-white rounded-2xl p-5 shadow-sm">

              <div className="text-gray-500">
                Total Students
              </div>

              <div className="text-3xl font-bold mt-3">
                {totalStudents}
              </div>

            </div>

            {/* ACTIVE COURSES */}

            <div className="bg-white rounded-2xl p-5 shadow-sm">

              <div className="text-gray-500">
                Active Courses
              </div>

              <div className="text-3xl font-bold mt-3">
                {activeCourses}
              </div>

            </div>

           <div className="bg-white rounded-2xl p-5 shadow-sm">

  <div className="text-gray-500">
    Total Assignments
  </div>

  <div className="text-3xl font-bold mt-3">
    {totalAssignments}
  </div>

</div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">

  <div className="text-gray-500">
    Pending Grades
  </div>

  <div className="text-3xl font-bold mt-3">
    {pendingGrades}
  </div>

</div>

          </div>

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* COURSES */}

            <section className="bg-white rounded-2xl p-6 shadow-sm">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold">
                  Your Courses
                </h2>

                <CreateNewButton />

              </div>

              <div className="space-y-4">

                {loading && (

                  <div className="text-gray-500">
                    Loading...
                  </div>

                )}

                {!loading && courses.length === 0 && (

                  <div className="text-gray-500">
                    No courses yet
                  </div>

                )}

                {courses.map(c => (

                  <div
                    key={c._id}
                    className="border rounded-2xl p-5 flex items-center justify-between"
                  >

                    <div>

                      <div className="text-xl font-semibold">
                        {c.title}
                      </div>

                    </div>

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      Published
                    </span>

                  </div>

                ))}

              </div>

            </section>

            {/* RECENT ACTIVITY */}

            <section className="bg-white rounded-2xl p-6 shadow-sm">

  <h2 className="text-2xl font-bold mb-6">
    Recent Activity
  </h2>

  {totalStudents > 0 ? (

    <div className="flex items-center gap-4">

      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
        📚
      </div>

      <div>

        <div className="text-xl font-medium">
          New enrollment: {recentStudentName}
        </div>

        <div className="text-gray-400">
          Just now
        </div>

      </div>

    </div>

  ) : (

    <div className="text-gray-500">
      No recent activity
    </div>

  )}

</section>

          </div>

        </main>

      </div>

    </div>
  )
}

function CreateNewButton(){

  const navigate = useNavigate()

  return (

    <button
      onClick={() => navigate('/create-course')}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
    >
      + Create New
    </button>

  )
}

