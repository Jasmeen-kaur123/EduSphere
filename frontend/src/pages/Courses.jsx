import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await api.fetchMyCourses();

        if (!mounted) return;

        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <h1 className="text-5xl font-extrabold text-slate-900">
            My Courses
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            Track your learning progress
          </p>

          {loading && (
            <div className="mt-10 text-gray-500">
              Loading courses...
            </div>
          )}

          {!loading && courses.length === 0 && (
            <div className="mt-10 bg-white rounded-3xl p-8 shadow">
              No enrolled courses found.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
            {courses.map((item, index) => {
              const course = item.course || item;

              const totalLessons =
                course?.lessons?.length || 0;

              const completedLessons =
                item?.completedLessons?.length || 0;

              const progress =
                totalLessons > 0
                  ? Math.round(
                      (completedLessons / totalLessons) * 100
                    )
                  : 0;

              return (
                <div
                  key={course._id || index}
                  className="bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  {/* TOP SECTION */}
                  <div className="bg-green-100 h-28 relative flex items-center justify-center">
                    <div className="absolute top-6 left-6 bg-green-200 text-green-900 px-5 py-2 rounded-full text-sm font-bold tracking-wide">
                      ENROLLED
                    </div>

                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-300 via-green-400 to-cyan-500 shadow-lg" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <div className="text-purple-700 text-lg font-medium">
                      👨‍🏫{" "}
                      {course?.instructor?.name ||
                        "Instructor"}
                    </div>

                   <h2 className="mt-3 text-2xl font-bold text-slate-900 line-clamp-2">
  {course?.title}
</h2>

                    {/* DETAILS */}
                    <div className="flex items-center gap-8 text-gray-500 mt-5">
                      <div className="flex items-center gap-2">
                        📚
                        <span>
                          {totalLessons} lessons
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        ⏰
                        <span>
                          {course?.duration ||
                            "1 hr 50 min"}
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-7">
                      <div className="flex justify-between font-medium mb-2">
                        <span>Progress</span>
                        <span className="text-blue-600 font-bold">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        navigate(`/course/${course._id}`)
                      }
                      className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-2xl transition-all"
                    >
                      ▶ Continue Learning
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}