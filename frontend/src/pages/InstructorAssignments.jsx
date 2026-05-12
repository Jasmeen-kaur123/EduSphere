import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import {useNavigate } from 'react-router-dom'

export default function InstructorAssignments(){
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [gradeData, setGradeData] = useState({}) 
  const [gradingId, setGradingId] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const a= await api.fetchAssignments()
        if(mounted) setAssignments(Array.isArray(a) ? a : [])
      }catch(e){ console.error(e) } finally { if(mounted) setLoading(false) }
    }
    load()
    return ()=> mounted = false
  },[])

  function setField(id, field, value){
    setGradeData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function handleGrade(id){
    setGradingId(id)
    const { score = 0, feedback = '' } = gradeData[id] || {}
    try{
      await api.gradeAssignment(id, { score: Number(score), feedback })
      alert('Graded successfully!')
      const a = await api.fetchAssignments()
      setAssignments(Array.isArray(a) ? a : [])
    }catch(e){ console.error(e); alert('Grading failed') } finally { setGradingId(null) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold">Assignments</h1>
            <button onClick={() => navigate('/create-assignment')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">
              + Create Assignment
            </button>
          </div>
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
                  <div>
                    {a.status === 'pending' && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">Pending</span>}
                    {a.status === 'submitted' && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">Submitted</span>}
                    {a.status === 'graded' && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Graded</span>}
                  </div>
                </div>

                {a.answer && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    <div className="font-medium text-gray-500 mb-1">Student's Answer:</div>
                    <pre className="whitespace-pre-wrap">{a.answer}</pre>
                  </div>
                )}

                {a.status === 'submitted' && (
                  <div className="mt-4 border-t pt-4">
                    <div className="text-sm font-semibold mb-2 text-gray-700">Grade this submission</div>
                    <textarea
                      value={(gradeData[a._id] || {}).feedback || ''}
                      onChange={e => setField(a._id, 'feedback', e.target.value)}
                      placeholder="Feedback (optional)"
                      className="w-full p-3 border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows={3}
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <label className="text-sm text-gray-600">Score:</label>
                      <input type="number" min={0} max={100}
                        value={(gradeData[a._id] || {}).score ?? ''}
                        onChange={e => setField(a._id, 'score', e.target.value)}
                        placeholder="0-100"
                        className="w-24 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button disabled={gradingId === a._id} onClick={() => handleGrade(a._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50">
                        {gradingId === a._id ? 'Saving...' : 'Save Grade'}
                      </button>
                    </div>
                  </div>
                )}

                {a.status === 'graded' && (
                  <div className="mt-4 p-3 bg-green-50 rounded">
                    <div className="text-green-700 font-semibold">Score: {a.score ?? '—'}/100</div>
                    {a.feedback && <div className="text-gray-600 text-sm mt-1">{a.feedback}</div>}
                  </div>
                )}

                {a.status === 'pending' && (
                  <div className="mt-3 text-sm text-gray-400 italic">Waiting for student submission.</div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}