import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Grades() {

  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    let mounted = true

    async function load() {

      try {

        const res = await api.fetchAssignments()

        if (mounted) {
          setAssignments(Array.isArray(res) ? res : [])
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

  // COMPLETED ASSIGNMENTS

  const completedAssignments = useMemo(() => {

   return assignments.filter
      a =>
        a.score !== undefined &&
        a.score !== null
    )

  }, [assignments])

  // TOTAL DONE

  const assignmentsDone =
    completedAssignments.length

  // AVG SCORE

  const avgScore =
    completedAssignments.length > 0
      ? Math.round(
          completedAssignments.reduce(
            (sum, a) => sum + Number(a.score || 0),
            0
          ) / completedAssignments.length
        )
      : 0

  // STATUS COLOR

  function getStatusStyle(status) {

    switch(status){

      case 'submitted':
        return 'bg-green-100 text-green-700'

      case 'graded':
        return 'bg-blue-100 text-blue-700'

      case 'pending':
        return 'bg-yellow-100 text-yellow-700'

      default:
        return 'bg-red-100 text-red-700'
    }
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-8">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold">
              Grades & Progress
            </h1>

            <p className="text-gray-500 mt-2">
              Your academic performance overview
            </p>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* ASSIGNMENTS DONE */}

            <div className="bg-white rounded-2xl shadow-sm border p-6">

              <div className="text-gray-500 text-lg">
                Assignments Done
              </div>

              <div className="text-5xl font-bold text-blue-600 mt-4">
                {assignmentsDone}
              </div>

            </div>

            {/* AVG SCORE */}

            <div className="bg-white rounded-2xl shadow-sm border p-6">

              <div className="text-gray-500 text-lg">
                Avg Score
              </div>

              <div className="text-5xl font-bold text-orange-500 mt-4">
                {avgScore}%
              </div>

            </div>

          </div>

          {/* TABLE */}

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

            {/* TITLE */}

            <div className="px-8 py-6 border-b">

              <h2 className="text-2xl font-bold">
                Course Performance
              </h2>

            </div>

            {/* HEADER */}

            <div className="grid grid-cols-4 px-8 py-4 border-b bg-gray-50 text-gray-400 font-semibold tracking-wide text-sm">

              <div>
                COURSE
              </div>

              <div>
                STATUS
              </div>

              <div>
                ASSIGNMENTS
              </div>

              <div>
                SCORE
              </div>

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

            {/* TABLE BODY */}

            {!loading && assignments.map((a, index) => (

              <div
                key={a._id || index}
                className="grid grid-cols-4 px-8 py-6 border-b items-center hover:bg-gray-50 transition"
              >

                {/* COURSE */}

                <div>

                  <div className="text-lg font-semibold text-black">
                    {a.title}
                  </div>

                  <div className="text-gray-400 mt-1">
                    {a.course?.title || 'Course'}
                  </div>

                </div>

                {/* STATUS */}

                <div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(a.status)}`}
                  >
                    {a.status || 'pending'}
                  </span>

                </div>

                {/* DUE DATE */}

                <div className="text-gray-600 font-medium">

                  {a.dueDate
                    ? `Due ${new Date(a.dueDate).toLocaleDateString()}`
                    : '--'}

                </div>

                {/* SCORE */}

                <div className="text-2xl font-bold text-black">

                  {a.score !== undefined &&
                   a.score !== null
                    ? `${a.score}/100`
                    : '--'}

                </div>

              </div>

            ))}

          </div>

        </main>

      </div>

    </div>
  )
}

