import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function CreateAssignment(){
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [courses, setCourses] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const cs = await api.fetchCourses()
        if(mounted) setCourses(Array.isArray(cs) ? cs : [])
      }catch(e){ console.error(e) } 
    }
    load()
    return ()=> mounted = false
  },[])

  async function handleCreate(e){
    e.preventDefault()
    setSubmitting(true)
    try{
      await api.createAssignment({ title, course, dueDate })
      navigate('/instructor/assignments')
    }catch(e){ console.error(e); alert('Failed') } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-extrabold mb-4">Create a new Assignment</h1>
          <div className="bg-white p-6 rounded shadow max-w-3xl">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} required className="mt-1 w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium">Course</label>
                <select value={course} onChange={e=>setCourse(e.target.value)} className="mt-1 w-full px-4 py-3 border rounded-lg">
                  <option value="">Select course</option>
                  {courses.map(c=> (<option key={c._id} value={c._id}>{c.title}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Due date</label>
                <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="mt-1 px-4 py-3 border rounded-lg" />
              </div>

              <div className="text-right">
                <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">Create Assignment</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
