import React,{ useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api"

export default function EditCourse() {

  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [lessons, setLessons] = useState([])

  useEffect(() => {

    loadCourse()

  }, [])

  async function loadCourse() {
  try {
    const course = await api.fetchInstructorCourseById(id)

    console.log("COURSE DATA:", course)

    setTitle(course.title || "")
    setDescription(course.description || "")
    setDuration(course.duration || "")
    setLessons(course.lessons || [])
  } catch (err) {
    console.error(err)
  }
}

  async function handleUpdate(e) {

    e.preventDefault()

    await api.updateCourse(id, {
      title,
      description,
      duration,
      lessons
    })

    alert("Course Updated Successfully")
  }

  return (

    <form
      onSubmit={handleUpdate}
      className="max-w-4xl mx-auto p-6"
    >

      <h1 className="text-4xl font-bold mb-8">
        Edit Course
      </h1>

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="w-full border p-3 rounded mb-4"
      />

      <textarea
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        className="w-full border p-3 rounded mb-4"
      />

      <input
        value={duration}
        onChange={(e) =>
          setDuration(e.target.value)
        }
        className="w-full border p-3 rounded mb-4"
      />

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        Save Changes
      </button>

    </form>
  )
}