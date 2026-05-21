import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function InstructorAssignments() {

  const [assignments, setAssignments] = useState([])

  const [loading, setLoading] = useState(true)

  const [gradeData, setGradeData] = useState({})

  const [gradingId, setGradingId] = useState(null)

  const navigate = useNavigate()



  useEffect(() => {

    let mounted = true

    async function load() {

      try {

        const data =
          await api.fetchAssignments()

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



  function setField(id, field, value) {

    setGradeData(prev => ({

      ...prev,

      [id]: {

        ...prev[id],

        [field]: value

      }

    }))
  }



  async function handleGrade(submissionId) {

    if (!submissionId) {

      alert('Submission not found')

      return
    }

    setGradingId(submissionId)

    const {
      score = 0,
      feedback = ''
    } = gradeData[submissionId] || {}



    try {

      await api.gradeAssignment(

        submissionId,

        {
          score: Number(score),
          feedback
        }

      )



      // UPDATE UI

      const updated =
        assignments.map((a) => {

          if (a.submission?._id === submissionId) {

            return {

              ...a,

              submission: {

                ...a.submission,

                status: 'graded',

                score: Number(score),

                feedback

              }

            }
          }

          return a
        })



      setAssignments(updated)

      alert('Graded successfully!')

    } catch (err) {

      console.error(err)

      alert('Grading failed')

    } finally {

      setGradingId(null)
    }
  }



  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-8">

            <div>

              <h1 className="text-4xl font-extrabold">

                Assignments

              </h1>

              <p className="text-gray-500 mt-2">

                Review and grade student submissions

              </p>

            </div>


            <button
              onClick={() =>
                navigate('/create-assignment')
              }
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
            >

              + Create Assignment

            </button>

          </div>



          {/* LOADING */}

          {loading && (

            <div className="text-gray-500">

              Loading...

            </div>

          )}



          {/* EMPTY */}

          {!loading && assignments.length === 0 && (

            <div className="bg-white p-6 rounded-2xl shadow text-gray-500">

              No assignments found.

            </div>

          )}



          {/* LIST */}

          <div className="space-y-6">

            {assignments.map((a) => {

              const submission = a.submissions?.[0]

              const status =
                submission?.status || 'pending'

              return (

                <div
                  key={a._id}
                  className="bg-white rounded-2xl shadow-sm border p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    {/* LEFT */}

                    <div className="flex-1 min-w-0">

                      <h2 className="text-2xl font-bold leading-snug">

                        {a.title}

                      </h2>

                      <p className="text-gray-500 text-sm mt-2">

                        {a.course?.title || 'Course'}

                      </p>

                      <p className="text-gray-400 text-sm mt-1">

                        Due:

                        {' '}

                        {a.dueDate
                          ? new Date(a.dueDate)
                              .toLocaleDateString()
                          : '—'
                        }

                      </p>

                    </div>


                    {/* STATUS */}

                    <div>

                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium capitalize ${
                          status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : status === 'graded'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >

                        {status}

                      </span>

                    </div>

                  </div>



                  {/* STUDENT */}

                  {submission?.student && (

                    <div className="mt-4 text-sm text-gray-600">

                      Student:

                      {' '}

                      <span className="font-medium">

                        {submission.student.name}

                      </span>

                      {' '}

                      ({submission.student.email})

                    </div>

                  )}



                  {/* ANSWER */}

                  {submission?.answer && (

                    <div className="mt-5 bg-gray-50 border rounded-xl p-4">

                      <div className="text-sm font-semibold text-gray-700 mb-2">

                        Student's Answer

                      </div>

                      <pre className="whitespace-pre-wrap text-sm text-gray-700">

                        {submission.answer}

                      </pre>

                    </div>

                  )}



                  {/* GRADE FORM */}

                  {status === 'submitted' && (

                    <div className="mt-6 border-t pt-5">

                      <div className="font-semibold text-gray-700 mb-3">

                        Grade this submission

                      </div>


                      <textarea
                        value={
                          (gradeData[submission._id] || {}).feedback || ''
                        }
                        onChange={(e) =>
                          setField(
                            submission._id,
                            'feedback',
                            e.target.value
                          )
                        }
                        placeholder="Write feedback..."
                        rows={4}
                        className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />


                      <div className="mt-4 flex items-center gap-4">

                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={
                            (gradeData[submission._id] || {}).score ?? ''
                          }
                          onChange={(e) =>
                            setField(
                              submission._id,
                              'score',
                              e.target.value
                            )
                          }
                          placeholder="Score"
                          className="w-28 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />


                        <button
                          disabled={
                            gradingId === submission._id
                          }
                          onClick={() =>
                            handleGrade(submission._id)
                          }
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >

                          {gradingId === submission._id
                            ? 'Saving...'
                            : 'Save Grade'
                          }

                        </button>

                      </div>

                    </div>

                  )}



                  {/* GRADED */}

                  {status === 'graded' && (

                    <div className="mt-5 bg-green-50 border border-green-100 rounded-xl p-4">

                      <div className="text-green-700 font-semibold">

                        Score:

                        {' '}

                        {submission?.score || 0}/100

                      </div>

                      {submission?.feedback && (

                        <div className="text-sm text-gray-600 mt-2">

                          {submission.feedback}

                        </div>

                      )}

                    </div>

                  )}



                  {/* PENDING */}

                  {status === 'pending' && (

                    <div className="mt-4 text-sm text-gray-400 italic">

                      Waiting for student submission.

                    </div>

                  )}

                </div>

              )
            })}

          </div>

        </main>

      </div>

    </div>
  )
}