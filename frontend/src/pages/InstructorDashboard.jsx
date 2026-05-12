
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'

export default function InstructorDashboard(){

  const [courses, setCourses] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    let mounted = true

    async function load(){

      try{

        // ALL COURSES

        const cs = await api.fetchCourses()

        // ALL STUDENTS

        const students = await api.fetchInstructorStudents()

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

  // REVENUE

  const revenue = courses.reduce((sum, c) => {

    return sum + Number(c.revenue || 0)

  }, 0)

  // AVG RATING

  const avgRating =
    courses.length > 0
      ? (
          courses.reduce(
            (sum, c) =>
              sum + Number(c.rating || 0),
            0
          ) / courses.length
        ).toFixed(1)
      : '0.0'

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

              {/* NOTIFICATION */}

              <div className="h-11 w-11 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                🔔
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

              <div className="text-green-500 text-sm mt-2">
                +{totalStudents} enrolled
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

              <div className="text-green-500 text-sm mt-2">
                {activeCourses} published
              </div>

            </div>

            {/* REVENUE */}

            <div className="bg-white rounded-2xl p-5 shadow-sm">

              <div className="text-gray-500">
                Revenue
              </div>

              <div className="text-3xl font-bold mt-3">
                ₹{(revenue / 1000).toFixed(1)}k
              </div>

              <div className="text-green-500 text-sm mt-2">
                +₹18K this month
              </div>

            </div>

            {/* RATING */}

            <div className="bg-white rounded-2xl p-5 shadow-sm">

              <div className="text-gray-500">
                Avg. Rating
              </div>

              <div className="text-3xl font-bold mt-3">
                {avgRating}
              </div>

              <div className="text-green-500 text-sm mt-2">
                Excellent
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

                      <div className="text-gray-500 mt-1 text-sm">
                        ⭐ {c.rating || 4.8}
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

              <div className="border rounded-2xl p-5">

                <div className="text-lg font-medium">
                  New enrollment: Manjot
                </div>

                <div className="text-gray-400 mt-1 text-sm">
                  just now
                </div>

              </div>

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

