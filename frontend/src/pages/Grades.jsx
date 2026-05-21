import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Grades() {

  const [assignments, setAssignments] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    let mounted = true

    async function load() {

      try {

        const data = await api.fetchAssignments()

        if (mounted) {

          setAssignments(
            Array.isArray(data) ? data : []
          )
        }

      } catch (err) {

        console.error(err)

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


  // GRADED ONLY

  const gradedAssignments = assignments.filter(
    a => a.submission?.status === 'graded'
  )


  // AVG SCORE

  const avgScore =
    gradedAssignments.length > 0
      ? Math.round(

          gradedAssignments.reduce(

            (acc, a) =>

              acc + (a.submission?.score || 0),

            0

          ) / gradedAssignments.length

        )
      : 0


  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="text-4xl font-extrabold">

              Grades & Progress

            </h1>

            <p className="text-gray-500 mt-2">

              Your academic performance overview

            </p>

          </div>


          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow p-6">

              <div className="text-gray-500 text-lg">

                Assignments Done

              </div>

              <div className="text-5xl font-bold text-blue-600 mt-3">

                {gradedAssignments.length}

              </div>

            </div>


            <div className="bg-white rounded-2xl shadow p-6">

              <div className="text-gray-500 text-lg">

                Avg Score

              </div>

              <div className="text-5xl font-bold text-orange-500 mt-3">

                {avgScore}%

              </div>

            </div>

          </div>


          {/* TABLE */}

          <div className="bg-white rounded-2xl shadow overflow-hidden">

            <div className="p-6 border-b">

              <h2 className="text-2xl font-bold">

                Course Performance

              </h2>

            </div>


            {/* LOADING */}

            {loading && (

              <div className="p-6 text-gray-500">

                Loading...

              </div>

            )}


            {/* EMPTY */}

            {!loading && assignments.length === 0 && (

              <div className="p-6 text-gray-500">

                No assignments found

              </div>

            )}


            {!loading && assignments.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase">

                        Course

                      </th>

                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase">

                        Status

                      </th>

                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase">

                        Due Date

                      </th>

                      <th className="text-left px-6 py-4 text-gray-400 text-sm font-semibold uppercase">

                        Score

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {assignments.map((a, index) => {

                      const status =
                        a.submission?.status || 'pending'

                      return (

                        <tr
                          key={a._id || index}
                          className="border-t hover:bg-gray-50 transition"
                        >

                          {/* TITLE */}

                          <td className="px-6 py-5">

                            <div className="font-semibold text-lg line-clamp-2">

                              {a.title}

                            </div>

                            <div className="text-gray-500 text-sm mt-1">

                              {a.course?.title || 'Course'}

                            </div>

                          </td>


                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <span
                              className={`px-4 py-1 rounded-full text-xs font-semibold capitalize ${
                                status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : status === 'graded'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >

                              {status}

                            </span>

                          </td>


                          {/* DUE DATE */}

                          <td className="px-6 py-5 text-gray-600 text-sm">

                            {a.dueDate
                              ? new Date(a.dueDate)
                                  .toLocaleDateString()
                              : '—'
                            }

                          </td>


                          {/* SCORE */}

                          <td className="px-6 py-5 font-semibold text-lg">

                            {status === 'graded'

                              ? `${a.submission?.score || 0}/100`

                              : '--'
                            }

                          </td>

                        </tr>

                      )
                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  )
}