import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Assignments(){
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [answer, setAnswer] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  
  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const a = await api.fetchAssignments()
        if(mounted) setAssignments(Array.isArray(a) ? a : [])
      }catch(e){ console.error(e) } finally { if(mounted) setLoading(false) }
    }
    load()
    return ()=> mounted=false
  },[])

  function openSubmitModal(assignment){
    setSelectedAssignment(assignment)
    setAnswer('')
    setFile(null)
    setModalOpen(true)
  }

  function closeModal(){
    setModalOpen(false)
    setSelectedAssignment(null)
    setAnswer('')
    setFile(null)
  }

  async function handleSubmit(){
    if(!selectedAssignment) return
    setSubmitting(true)
    try{
      await api.submitAssignment(selectedAssignment._id, { answer })
      alert('Assignment submitted successfully!')
      closeModal()
      const a = await api.fetchAssignments()
      setAssignments(Array.isArray(a) ? a : [])
    }catch(e){
      console.error(e)
      alert('Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-extrabold mb-4">Assignments</h1>
          <div className="space-y-6">
            {loading && <div>Loading...</div>}
            {(!loading && assignments.length === 0) && (
              <div className="bg-white p-6 rounded shadow">No assignments yet.</div>
            )}
            {assignments.map(a => (
              <div key={a._id} className="bg-white p-6 rounded shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-semibold">{a.title}</div>
                    <div className="text-sm text-gray-500">{a.course?.title}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {a.status === 'pending' && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">Pending</span>}
                    {a.status === 'submitted' && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">Submitted</span>}
                    {a.status === 'graded' && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Graded</span>}
                    {a.status === 'pending' && (
                      <button onClick={() => openSubmitModal(a)}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">
                        Submit Assignment →
                      </button>
                    )}
                  </div>
                </div>
                {a.status === 'graded' && (
                  <div className="mt-4 p-3 bg-green-50 rounded">
                    <div className="text-green-700 font-semibold">Score: {a.score ?? '—'}/100</div>
                    {a.feedback && <div className="text-gray-600 text-sm mt-1">Feedback: {a.feedback}</div>}
                  </div>
                )}
                {a.status === 'submitted' && (
                  <div className="mt-3 text-sm text-gray-500 italic">Submitted — waiting for instructor to grade.</div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ✅ Submit Modal */}
      {modalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Submit: {selectedAssignment.title}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-gray-600 text-sm">
                Course: <span className="font-medium">{selectedAssignment.course?.title || '—'}</span>
                &nbsp;·&nbsp;
                Due: <span className="font-medium">{selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleDateString() : '—'}</span>
              </p>
              <div>
                <label className="block text-sm font-semibold mb-1">Your Answer / Solution</label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Write your solution here... You can paste code, describe your approach, or write your answer."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={7}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Attach File <span className="font-normal text-gray-400">(optional)</span></label>
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-200 rounded-xl p-6 cursor-pointer hover:bg-blue-50 transition">
                  <span className="text-3xl mb-2">📎</span>
                  <span className="text-blue-500 text-sm font-medium">
                    {file ? file.name : 'Click to upload or drag & drop'}
                  </span>
                  <span className="text-gray-400 text-xs mt-1">PDF, ZIP, or code files supported</span>
                  <input type="file" accept=".pdf,.zip,.js,.ts,.jsx,.tsx,.py,.java,.txt,.md"
                    className="hidden" onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting || !answer.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : 'Submit Assignment →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}