import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Courses() {

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {

    let mounted = true

    async function load() {

      try {

        const cs = await api.fetchMyCourses()

        const normalized =
          (Array.isArray(cs) ? cs : []).map(item => {

            const courseData =
              item?.course || item

            return {

              ...courseData,

              progress:
                item?.progress || 0,

              completedLessons:
                item?.completedLessons || []
            }
          })

        if (mounted) {
          setCourses(normalized)
        }

      } catch (e) {

        console.error(e)

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



  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-8">

          <div className="max-w-7xl mx-auto">

            {/* HEADER */}

            <div className="mb-10">

              <h1 className="text-5xl font-extrabold">
                My Courses
              </h1>

              <p className="text-gray-500 mt-2 text-lg">
                Continue learning from your enrolled courses
              </p>

            </div>


            {loading && (

              <div className="text-gray-500">
                Loading...
              </div>

            )}


            {!loading && courses.length === 0 && (

              <div className="bg-white rounded-3xl shadow p-8">

                You have no enrolled courses yet.

              </div>

            )}


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

              {courses.map((course, index) => {

                const totalLessons =
                  Array.isArray(course.lessons)
                    ? course.lessons.length
                    : 0

                const progress =
                  course.progress || 0

                return (

                  <div
                    key={course._id || index}
                    className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                  >

                    {/* TOP SECTION */}

                    <div className="relative h-32 bg-blue-100 flex items-center justify-center">

                      <span className="absolute top-4 left-4 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">

                        ENROLLED

                      </span>

                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600"></div>

                    </div>


                    {/* CONTENT */}

                    <div className="p-6">

                      <p className="text-sm text-purple-700 font-medium mb-2">

                        👨‍🏫 {course?.instructor?.name || 'Instructor'}

                      </p>

                      <h3 className="text-2xl font-bold text-gray-900 leading-snug min-h-[70px]">

                        {course?.title || 'Untitled Course'}

                      </h3>


                      <div className="flex items-center gap-5 mt-4 text-gray-500 text-sm">

                        <span>
                          📚 {totalLessons} lessons
                        </span>

                        <span>
                          ⏰ {course.duration || 20} hrs
                        </span>

                      </div>


                      {/* PROGRESS */}

                      <div className="mt-6">

                        <div className="flex justify-between mb-2">

                          <span className="font-medium">
                            Progress
                          </span>

                          <span className="font-bold text-blue-600">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`
                            }}
                          />

                        </div>

                      </div>


                      {/* BUTTON */}

                      <button
                        onClick={() =>
                          navigate(`/course/${course._id}`)
                        }
                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg"
                      >

                        ▶ Continue Learning

                      </button>

                    </div>

                  </div>

                )
              })}

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}