import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const navigate = useNavigate()
  const toggleForm = () => setIsLogin(v => !v)

  const handleAuth = async (e) => {
    e.preventDefault()
    try{
      if(isLogin){
        const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password, role })
        })
        const data = await res.json()
        if(res.ok){
          localStorage.setItem('token', data.token)
          localStorage.setItem('role', role)
          try{
            const profileRes = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': data.token } })
            const profile = await profileRes.json()
            localStorage.setItem('profile', JSON.stringify(profile))
          }catch(e){
            console.warn('Failed to fetch profile after login', e)
          }
          if(role === 'instructor') navigate('/instructor')
          else navigate('/dashboard')
        } else {
          alert(data.message || 'Login failed')
        }
      } 
      else {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        })
        const data = await res.json()
        if(res.ok){
          alert('Signup successful — please login')
          setIsLogin(true)
        } else {
          alert(data.message || 'Signup failed')
        }
      }
    } catch(err){
      console.error(err)
      alert('Server error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">EduCore LMS</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p className="text-gray-500 mt-2">{isLogin ? 'Sign in to continue your learning journey' : 'Create a new account to get started'}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-2 mb-6">
          <div className="flex">
            <button type="button" onClick={()=>setRole('student')} className={`w-1/2 py-3 rounded-lg font-medium ${role==='student' ? 'bg-white shadow' : 'text-gray-600'}`}>
              <span className="mr-2">👨‍🎓</span> Student
            </button>
            <button type="button" onClick={()=>setRole('instructor')} className={`w-1/2 py-3 rounded-lg font-medium ${role==='instructor' ? 'bg-white shadow' : 'text-gray-600'}`}>
              <span className="mr-2">🧑‍🏫</span> Instructor
            </button>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input value={name} onChange={e=>setName(e.target.value)} required className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Enter your email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Enter your password" />
          </div>

          <button type="submit" className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">{isLogin ? 'Sign In →' : 'Create account'}</button>
        </form>

        
        <p className="text-center text-sm text-gray-500 mt-5">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleForm} className="ml-2 text-blue-600 font-medium">{isLogin ? 'Sign Up' : 'Sign In'}</button>
        </p>
      </div>
    </div>
  )
}
