import React from 'react'
import Sidebar from '../components/Sidebar'

export default function Schedule(){
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-4">Schedule</h1>
            <div className="bg-white p-6 rounded-xl shadow">Your schedule will be shown here.</div>
          </div>
        </main>
      </div>
    </div>
  )
}
