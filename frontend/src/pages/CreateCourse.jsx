import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'


export default function CreateCourse(){
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Backend')
  const [level, setLevel] = useState('Beginner')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [lessons, setLessons] = useState([{ name: 'Introduction', duration: '10:00' }])
  const [thumbnail, setThumbnail] = useState(null)
  const [videoFiles, setVideoFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const { id } = useParams();
  const isEdit = Boolean(id)

useEffect(() => {
  if (isEdit) {
    loadCourse()
  }
}, [id])

async function loadCourse() {
  try {
    const course = await api.fetchInstructorCourseById(id)

    setTitle(course.title || '')
    setDescription(course.description || '')
    setDuration(course.duration || '')
    setLessons(
      course.lessons?.map(ls => ({
        name: ls.title || ls.name || '',
        duration: ls.duration || '',
        videoUrl: ls.videoUrl || ''
      })) || []
    )

  } catch (err) {
    console.error(err)
  }
}



  function addLesson(){
    setLessons(l=>[...l, { name: '', duration: '', videoUrl: '' }])
  }
  function updateLesson(idx, field, value){
    setLessons(l=>l.map((it,i)=> i===idx ? { ...it, [field]: value } : it))
  }
  function removeLesson(idx){
    setLessons(l=>l.filter((_,i)=>i!==idx))
  }

//   const body = {
//   title,
//   description,
//   category,
//   level,
//   price: Number(price) || 0,
//   duration,
//   lessons
// }

  async function handlePublish(e) {
  e.preventDefault()
  setSubmitting(true)

  try {

    const body = {
      title,
      description,
      category,
      level,
      price: Number(price) || 0,
      duration,
      lessons
    }

    if (isEdit) {

      await api.updateCourse(id, body)

      alert('Course Updated Successfully ✔️')

      navigate('/instructor/courses')

      return
    }

    const token = localStorage.getItem('token')

    const res = await fetch(
      'http://localhost:5000/api/courses',
      {
        method: 'POST',
        headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
},
        body: JSON.stringify(body)
      }
    )

    const data = await res.json()

    if (res.ok) {

      alert('Course created ✔️')

      navigate('/instructor/courses')

    } else {

      alert(
        data.message ||
        'Failed to create course'
      )
    }

  } catch (err) {

    console.error(err)

    alert('Server error')

  } finally {

    setSubmitting(false)

  }
}
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold">
  {isEdit ? 'Edit Course' : 'Create New Course'}
</h1>
              <p className="text-gray-500 mt-2">Build and publish your course</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow" onSubmit={handlePublish}>
            <div>
              <h2 className="font-semibold text-lg">Course Details</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Course Title *</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Complete React Development Bootcamp" className="mt-1 w-full px-4 py-3 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What will students learn?" className="mt-1 w-full px-4 py-3 border rounded-lg" rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full px-4 py-3 border rounded-lg">
                      <option>Backend</option>
                      <option>Frontend</option>
                      <option>Data Science</option>
                      <option>DevOps</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Level</label>
                    <select value={level} onChange={e=>setLevel(e.target.value)} className="mt-1 w-full px-4 py-3 border rounded-lg">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Duration</label>
                    <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="e.g. 30 hours" className="mt-1 w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

 <div>
  <h2 className="font-semibold text-lg mb-4">
    📚 Course Curriculum
  </h2>

  <div className="bg-gray-50 p-4 rounded-2xl space-y-3">

    {lessons.map((ls, idx) => (

      <div
        key={idx}
        className="grid grid-cols-[40px_2fr_100px_2.5fr_90px] gap-4 items-center bg-white p-4 rounded-xl border shadow-sm"
      >

        <div className="text-center font-semibold text-blue-600">
          {idx + 1}
        </div>

        <input
  value={ls.name}
  onChange={(e)=>updateLesson(idx,'name',e.target.value)}
  placeholder="Lesson title"
  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

        <input
  value={ls.duration}
  onChange={(e)=>updateLesson(idx,'duration',e.target.value)}
  placeholder="00:00"
  className="w-full px-4 py-3 border rounded-xl text-center"
 />

        <input
  value={ls.videoUrl || ''}
  onChange={(e)=>updateLesson(idx,'videoUrl',e.target.value)}
  placeholder="https://youtube.com/..."
  className="w-full px-4 py-3 border rounded-xl truncate"
 />

        {lessons.length > 1 && (
          <button
            type="button"
            onClick={() => removeLesson(idx)}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
          >
            Remove
          </button>
        )}

      </div>

    ))}

    <button
      type="button"
      onClick={addLesson}
     className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
    >
      + Add Lesson
    </button>

  </div>
</div>

            <div>
              <h2 className="font-semibold text-lg">Media & Uploads</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <label className="block text-sm font-medium">Video Upload</label>
                  <input type="file" accept="video/*" multiple onChange={e=>setVideoFiles(Array.from(e.target.files))} className="mt-2" />
                  <div className="text-xs text-gray-400 mt-2">Supported: MP4, MOV, AVI · Max 2GB per video</div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <label className="block text-sm font-medium">Thumbnail</label>
                  <input type="file" accept="image/*" onChange={e=>setThumbnail(e.target.files[0])} className="mt-2" />
                </div>
              </div>
            </div>

            <div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">{submitting
  ? (isEdit ? 'Updating...' : 'Publishing...')
  : (isEdit ? '💾 Update Course' : '🚀 Publish Course')
}</button>
            </div>
          </form>

          <aside className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow border">
              <h3 className="font-semibold">Course Curriculum</h3>
              <div className="mt-4 space-y-2">
                {lessons.map((ls,idx)=> (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">{idx+1}</div>
                      <div>
                        <div className="font-medium">{ls.name || 'Untitled'}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{ls.duration}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={addLesson} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600">+ Add Lesson</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold">Thumbnail</h3>
              <div className="mt-4 border-dashed border-2 border-gray-200 rounded-lg p-6 text-center">
                <div className="text-gray-400">Drop image here or click to upload</div>
              </div>
            </div>

              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
