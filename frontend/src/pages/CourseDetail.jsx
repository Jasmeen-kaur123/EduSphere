import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'

function formatTime(sec){
  if(!sec && sec !== 0) return '0:00'

  const s = Math.floor(sec || 0)
  const m = Math.floor(s / 60)
  const r = s % 60

  return `${m}:${r.toString().padStart(2, '0')}`
}

export default function CourseDetail(){

  const { id } = useParams()

  const navigate = useNavigate()

  const location = useLocation()

  const [course, setCourse] = useState(null)

  const [loading, setLoading] = useState(true)

  const [completed, setCompleted] = useState(new Set())

  const [selectedLesson, setSelectedLesson] = useState(
    location.state?.lessonIndex || 0
  )

  const videoRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)

  const [currentTime, setCurrentTime] = useState(0)

  const [durationTime, setDurationTime] = useState(0)

  useEffect(() => {

    let mounted = true

    async function load(){

      try{

        const res = await api.fetchCourseById(id)

        if(mounted){

          setCourse(res.course || res)

          if(Array.isArray(res.completedLessons)){
            setCompleted(new Set(res.completedLessons))
          }
        }

      }catch(err){
        console.error(err)
      }finally{
        if(mounted){
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }

  }, [id])

  if(loading){
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Loading...
      </div>
    )
  }

  if(!course){
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Course not found
      </div>
    )
  }

  const totalLessons = course.lessons?.length || 0

  const completedCount = completed.size

  const currentLesson = course.lessons?.[selectedLesson]

  async function markComplete(index){

    try{

      await api.completeLesson(course._id, index)

      setCompleted(prev => new Set([...prev, index]))

    }catch(err){

      console.error(err)

      alert('Failed to mark lesson complete')
    }
  }

  const isYoutubeVideo =
    currentLesson?.videoUrl?.includes('youtube.com') ||
    currentLesson?.videoUrl?.includes('youtu.be')

  const getYoutubeEmbedUrl = (url) => {

    if(url.includes('watch?v=')){
      return url.replace('watch?v=', 'embed/')
    }

    if(url.includes('youtu.be/')){
      return url.replace(
        'youtu.be/',
        'www.youtube.com/embed/'
      )
    }

    return url
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="flex">

        <Sidebar />

        <main className="flex-1 p-6">

          <div className="max-w-7xl mx-auto">

            <button
              onClick={() => navigate('/dashboard')}
              className="mb-6 px-5 py-2 border rounded-xl bg-white shadow hover:bg-gray-50"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-4xl font-extrabold mb-6">
              {course.title}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT SIDE */}

              <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">

                {/* VIDEO */}

                <div className="h-[500px] bg-black rounded-2xl overflow-hidden relative">

                  {currentLesson?.videoUrl ? (

                    isYoutubeVideo ? (

                      <iframe
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                        title="Course Video"
                        allowFullScreen
                      />

                    ) : (

                      <>
                        <video
                          ref={videoRef}
                          key={currentLesson.videoUrl}
                          src={currentLesson.videoUrl}
                          className="w-full h-full object-cover"
                          controls={false}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onTimeUpdate={(e) => {
                            setCurrentTime(e.target.currentTime)
                          }}
                          onLoadedMetadata={(e) => {
                            setDurationTime(e.target.duration)
                          }}
                        />

                        {!isPlaying && (

                          <button
                            onClick={() => videoRef.current.play()}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl">

                              <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M8 5v14l11-7L8 5z"
                                  fill="#111827"
                                />
                              </svg>

                            </div>
                          </button>

                        )}

                        {/* CONTROLS */}

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">

                          <div className="flex items-center gap-4">

                            <button
                              onClick={() => {
                                if(isPlaying){
                                  videoRef.current.pause()
                                }else{
                                  videoRef.current.play()
                                }
                              }}
                              className="text-white"
                            >
                              {isPlaying ? '⏸' : '▶'}
                            </button>

                            <div
                              className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                              onClick={(e) => {

                                const rect = e.currentTarget.getBoundingClientRect()

                                const pct =
                                  (e.clientX - rect.left) / rect.width

                                const time = pct * durationTime

                                if(!isNaN(time)){
                                  videoRef.current.currentTime = time
                                }
                              }}
                            >

                              <div
                                className="h-full bg-blue-500"
                                style={{
                                  width: durationTime
                                    ? `${(currentTime / durationTime) * 100}%`
                                    : '0%'
                                }}
                              />

                            </div>

                            <div className="text-white text-sm">

                              {formatTime(currentTime)} / {formatTime(durationTime)}

                            </div>

                            <button
                              onClick={() => {

                                if(videoRef.current.requestFullscreen){
                                  videoRef.current.requestFullscreen()
                                }
                              }}
                              className="text-white"
                            >
                              ⛶
                            </button>

                          </div>

                        </div>
                      </>

                    )

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                      No Video Available
                    </div>

                  )}

                </div>

                {/* LESSON INFO */}

                <div className="mt-6">

                  <h2 className="text-2xl font-bold">
                    {currentLesson?.title}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Lesson {selectedLesson + 1} of {totalLessons}
                  </p>

                  <p className="mt-4 text-gray-700">
                    {course.description}
                  </p>

                </div>

                {/* COMPLETE BUTTON */}

                <div className="mt-6">

                  {completed.has(selectedLesson) ? (

                    <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold">
                      ✓ Completed
                    </button>

                  ) : (

                    <button
                      onClick={() => markComplete(selectedLesson)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Mark Complete
                    </button>

                  )}

                </div>

              </div>

              {/* RIGHT SIDEBAR */}

              <aside className="bg-white rounded-2xl shadow p-6">

                <h3 className="text-2xl font-bold">
                  Course Content
                </h3>

                <p className="text-gray-500 mt-2">
                  {completedCount}/{totalLessons} completed
                </p>

                <div className="mt-6 space-y-3">

                  {course.lessons?.map((lesson, index) => (

                    <div
                      key={index}
                      onClick={() => setSelectedLesson(index)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedLesson === index
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <div className="font-semibold">
                            {index + 1}. {lesson.title}
                          </div>

                          <div className="text-sm text-gray-500 mt-1">
                            {lesson.duration || '5 min'}
                          </div>

                        </div>

                        <div>

                          {completed.has(index) ? (

                            <span className="text-green-600 font-bold">
                              ✓
                            </span>

                          ) : (

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markComplete(index)
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Mark
                            </button>

                          )}

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </aside>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}