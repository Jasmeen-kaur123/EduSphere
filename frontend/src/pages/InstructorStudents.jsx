import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function InstructorStudents(){
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const s = await api.fetchInstructorStudents()
        if(mounted) setStudents(Array.isArray(s) ? s : [])
      }catch(e){ console.error(e) } finally { if(mounted) setLoading(false) }
    }
    load()
    return()=>mounted =false
  },[])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-extrabold mb-4">Students</h1>
          <p className="text-gray-500 mb-6">Manage and track your enrolled students</p>

          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="font-semibold">All Students ({students.length})</div>
              <input placeholder="Search students..." className="px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <table className="w-full table-auto">
                <thead className="text-left text-sm text-gray-500">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Enrolled Courses</th>
                    <th className="p-4">Assignments</th>
                    <th className="p-4">Avg Progress</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (<tr><td colSpan={6} className="p-6">Loading...</td></tr>)}
                  {!loading && students.map(s => (
                    <tr key={s._id} className="border-t">
                      <td className="p-4">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.email}</div>
                      </td>
                      <td className="p-4">{s.enrolledCount} courses</td>
                      <td className="p-4">{s.assignmentsSubmitted} submitted</td>
                      <td className="p-4">
                        <div className="w-40 bg-gray-100 h-2 rounded overflow-hidden inline-block align-middle mr-2">
                          <div className="h-2 bg-blue-500" style={{ width: `${s.avgProgress || 0}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{s.avgProgress || 0}%</span>
                      </td>
                      <td className="p-4">—</td>
                      <td className="p-4"><button className="px-3 py-2 border rounded">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
