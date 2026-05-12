import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles }){
  const token = localStorage.getItem('token')

  let role = localStorage.getItem('role')

  // prefer decoding role from token when available — helps avoid stale localStorage.role
  if(token){
    try{
      const payload = JSON.parse(atob(token.split('.')[1]))
      if(payload && payload.role){
        role = payload.role
        localStorage.setItem('role', role)
      }
    }catch(e){
      // ignore decode errors
    }
  }

  // debug helpers (will appear in browser console)
  try{ console.debug('[ProtectedRoute] token?', Boolean(token), 'role=', role, 'allowed=', allowedRoles) }catch(e){}

  if(!token) return <Navigate to="/login" replace />
  if(allowedRoles && !allowedRoles.includes(role)){
    // user is authenticated but doesn't have the required role; send them to their dashboard instead
    if(role === 'student') return <Navigate to="/dashboard" replace />
    if(role === 'instructor') return <Navigate to="/instructor" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
