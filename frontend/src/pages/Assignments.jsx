import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Assignments() {

  const [assignments, setAssignments] = useState([])

  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)

  const [selectedAssignment, setSelectedAssignment] = useState(null)

  const [answer, setAnswer] = useState('')

  const [file, setFile] = useState(null)

  const [submitting, setSubmitting] = useState(false)


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



  function openSubmitModal(assignment) {

    setSelectedAssignment(assignment)

    setAnswer('')

    setFile(null)

    setModalOpen(true)
  }



  function closeModal() {

    setModalOpen(false)

    setSelectedAssignment(null)

    setAnswer('')

    setFile(null)
  }



  async function handleSubmit() {

  if (!selectedAssignment) return

  setSubmitting(true)

  try {

    const formData = new FormData()

formData.append(
  "answer",
  answer
)

if (file) {
  formData.append(
    "file",
    file
  )
}

await api.submitAssignment(
  selectedAssignment._id,
  formData
)

    // UPDATE UI IMMEDIATELY

    const updatedAssignments =
      assignments.map((item) => {

        if(item._id === selectedAssignment._id){

          return {

            ...item,

            submission: {

              ...(item.submission || {}),

              status: 'submitted'
            }
          }
        }

        return item
      })

    setAssignments(updatedAssignments)

    closeModal()

    alert('Assignment submitted successfully!')

  } catch (err) {

    console.error(err)

    alert('Submission failed')

  } finally {

    setSubmitting(false)
  }
}



  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="text-4xl font-extrabold">

              Assignments

            </h1>

            <p className="text-gray-500 mt-2">

              Track and submit your assignments

            </p>

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


          {/* ASSIGNMENTS */}

          <div className="space-y-5">

            {assignments.map((a) => {

              const status =
                a.submission?.status || 'pending'

              return (

                <div
                  key={a._id}
                  className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    {/* LEFT */}

                    <div className="flex-1 min-w-0">

                      <h2 className="text-2xl font-bold leading-snug line-clamp-2">

                        {a.title}

                      </h2>

                      <p className="text-gray-600 mt-3 text-sm line-clamp-3">

  {a.description || 'No description available'}

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


                      {/* GRADED */}

                      {status === 'graded' && (

                        <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">

                          <div className="text-green-700 font-semibold">

                            Score:

                            {' '}

                            {a.submission?.score || 0}/100

                          </div>

                          {a.submission?.feedback && (

                            <div className="text-sm text-gray-600 mt-1">

                              Feedback:

                              {' '}

                              {a.submission?.feedback}

                            </div>

                          )}

                        </div>

                      )}


                      {/* SUBMITTED */}

                      {status === 'submitted' && (

                        <div className="mt-4 text-sm text-blue-600 italic">

                          Submitted — waiting for instructor to grade.

                        </div>

                      )}

                    </div>


                    {/* RIGHT */}

                    <div className="flex flex-row lg:flex-col items-center gap-3 shrink-0">

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


                      {status === 'pending' && (

                        <button
                          onClick={() => openSubmitModal(a)}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
                        >

                          Submit Assignment →

                        </button>

                      )}

                    </div>

                  </div>

                </div>

              )
            })}

          </div>

        </main>

      </div>



      {/* SUBMIT MODAL */}

      {modalOpen && selectedAssignment && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between p-6 border-b">

              <h2 className="text-xl font-bold">

                Submit Assignment

              </h2>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

            </div>


            {/* BODY */}

            <div className="p-6 space-y-5">

              <div>

                <h3 className="font-semibold text-lg">

                  {selectedAssignment.title}

                </h3>

                <p className="text-sm text-gray-500 mt-1">

                  {selectedAssignment.description || 'No description available'}
                </p>

              </div>


              {/* ANSWER */}

              <div>

                <label className="block text-sm font-semibold mb-2">

                  Your Answer

                </label>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={7}
                  placeholder="Write your solution..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

              </div>


              {/* FILE */}

              <div>

                <label className="block text-sm font-semibold mb-2">

                  Attach File

                </label>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-6 cursor-pointer hover:bg-blue-50 transition">

                  <span className="text-3xl mb-2">

                    📎

                  </span>

                  <span className="text-blue-500 text-sm">

                    {file
                      ? file.name
                      : 'Click to upload file'
                    }

                  </span>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setFile(e.target.files[0])
                    }
                  />

                </label>

              </div>

            </div>


            {/* FOOTER */}

            <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-2xl">

              <button
                onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >

                Cancel

              </button>


              <button
                onClick={handleSubmit}
                disabled={submitting || !answer.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >

                {submitting
                  ? 'Submitting...'
                  : 'Submit Assignment →'
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}