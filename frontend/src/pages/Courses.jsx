import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Courses(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const cs = await api.fetchMyCourses()
        // api.fetchMyCourses returns array of { course, completedLessons } or plain course objects
        const normalized = (Array.isArray(cs) ? cs : []).map(item => item && item.course ? item.course : item)
        if(mounted) setCourses(normalized)
      }catch(e){ console.error(e) } finally { if(mounted) setLoading(false) }
    }
    load()
    return ()=> mounted = false
  },[])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-4">My Courses</h1>
            {loading && <div>Loading...</div>}
            {!loading && courses.length===0 && <div className="bg-white p-6 rounded-xl shadow">You have no courses yet. Browse courses to enroll.</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(c => (
                <div key={c._id || c.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-xs text-gray-500">Instructor: {c.instructor ? (c.instructor.name || c.instructor) : 'TBA'}</div>
                  </div>
                  <div>
                    <button onClick={()=>navigate(`/course/${c._id || c.id}`)} className="px-3 py-2 bg-blue-600 text-white rounded">Open</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
