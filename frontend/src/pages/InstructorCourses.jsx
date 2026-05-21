import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function InstructorCourses() {

  const [courses, setCourses] = useState([])

  useEffect(() => {

    async function loadCourses() {

      try {

        const data = await api.fetchInstructorCourses()

        setCourses(
          Array.isArray(data) ? data : []
        )

      } catch (err) {

        console.error(err)
      }
    }

    loadCourses()

  }, [])



  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          <h1 className="text-5xl font-extrabold">

            My Courses

          </h1>

          <p className="text-gray-500 mt-2 mb-8">

            Manage your published courses

          </p>



          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {courses.map((course) => (

              <div
                key={course._id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border"
              >

                {/* TOP */}

                <div className="h-52 bg-blue-100 flex items-center justify-center relative">

                  <span className="absolute top-4 left-4 bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full font-semibold">

                    PUBLISHED

                  </span>

                  <div className="text-6xl">

                    📘

                  </div>

                </div>



                {/* BODY */}

                <div className="p-6">

                  <h2 className="text-2xl font-bold leading-snug">

                    {course.title}

                  </h2>

                  <p className="text-gray-500 mt-3 line-clamp-2">

                    {course.description}

                  </p>



                  <div className="flex gap-3 mt-6">

                    <button className="flex-1 border rounded-xl py-3 font-semibold hover:bg-gray-50">

                      Edit

                    </button>

                    <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700">

                      Analytics

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </main>

      </div>

    </div>
  )
}