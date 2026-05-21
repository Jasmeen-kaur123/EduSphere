import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  const stored = localStorage.getItem('profile')
  let name = 'Instructor'
  let role = 'instructor'
  if(stored) try{ const p = JSON.parse(stored); name = p.name || name; role = p.role || role }catch(e){}
  
  if(!role){
    const r = localStorage.getItem('role')
    if(r) role = r
  }

  return (
    <aside className="w-72 bg-white border-r min-h-screen hidden md:block">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold">EduCore</div>
            <div className="text-xs text-gray-500">{role}</div>
          </div>
        </div>
      </div>

      <nav className="px-4">
        <ul className="space-y-1">
          {role === 'instructor' ? (
            <>
              <li>
                <NavLink to="/instructor" className={({isActive}) => isActive ? 'bg-blue-50 text-blue-600 rounded-lg px-3 py-2 block' : 'px-3 py-2 rounded-lg hover:bg-gray-100 block'}>Dashboard</NavLink>
              </li>
              <li>
                <NavLink to="/instructor" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">My Courses</NavLink>
              </li>
              <li>
                <NavLink to="/create-course" className={({isActive}) => isActive ? 'bg-blue-50 text-blue-600 rounded-lg px-3 py-2 block' : 'px-3 py-2 rounded-lg hover:bg-gray-100 block'}>Create Course</NavLink>
              </li>
              <li className="mt-4 text-xs uppercase text-gray-400 px-3">Teaching</li>
              <li>
                <NavLink to="/instructor/students" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Students</NavLink>
              </li>
              <li>
                <NavLink to="/instructor/assignments" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Assignments</NavLink>
              </li>
              <li>
                <NavLink to="/instructor/analytics" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Analytics</NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'bg-blue-50 text-blue-600 rounded-lg px-3 py-2 block' : 'px-3 py-2 rounded-lg hover:bg-gray-100 block'}>Dashboard</NavLink>
              </li>
              <li>
                <NavLink to="/courses" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">My Courses</NavLink>
              </li>
              <li>
                <NavLink to="/browse" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Browse Courses</NavLink>
              </li>
              <li className="mt-4 text-xs uppercase text-gray-400 px-3">Learning</li>
              <li>
                <NavLink to="/assignments" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Assignments</NavLink>
              </li>
              <li>
                <NavLink to="/grades" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Grades & Progress</NavLink>
              </li>
              <li>
                <NavLink to="/schedule" className="px-3 py-2 rounded-lg hover:bg-gray-100 block">Schedule</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="mt-auto p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center">{(name.split(' ').map(n=>n[0]||'').slice(0,2).join('')||'IN')}</div>
          <div>
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-gray-500">{role}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
