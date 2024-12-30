'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faRightFromBracket, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('./auth/login');
      } else {
        setIsAuthenticated(true);
        const { data: quizzesData, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error fetching quizzes:', error.message);
        } else {
          const quizzesWithDetails = await Promise.all(
            quizzesData.map(async (quiz) => {
              const { count: takerCount } = await supabase
                .from('quiz_results')
                .select('id', { count: 'exact' })
                .eq('quiz_id', quiz.id);

              const { data: scores } = await supabase
                .from('quiz_results')
                .select('score')
                .eq('quiz_id', quiz.id);

              const avgScore = scores.length > 0 ? (
                scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length
              ) : 0;

              return {
                ...quiz,
                takers: takerCount,
                avgScore: avgScore.toFixed(2),
              };
            })
          );

          setQuizzes(quizzesWithDetails);
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleAddQuiz = () => {
    router.push('/dashboard/new-quiz');
  };

  const handleEditQuiz = (quizId) => {
    router.push(`/dashboard/quiz/${quizId}`);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setShowLogoutModal(false);
        router.push('./auth/login');
      }
    } catch (error) {
      console.error('Unexpected Logout Error:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await fetch('/api/quizzez/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });

      if (response.ok) {
        setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
      } else {
        console.error('Error deleting quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-blue-600 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Quiz-Maker</h1>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          <button className="flex items-center w-full py-2 hover:bg-blue-700 rounded-md px-3">
            <FontAwesomeIcon icon={faUser} className="h-5 w-5 mr-3" />
            Profile
          </button>
          <button className="flex items-center w-full py-2 hover:bg-blue-700 rounded-md px-3">
            <FontAwesomeIcon icon={faClock} className="h-5 w-5 mr-3" />
            Quiz History
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center w-full py-2 hover:bg-blue-700 rounded-md px-3"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Quizzes</h1>
            <button
              onClick={handleAddQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add New Quiz
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border">Title</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Takers</th>
                  <th className="px-4 py-2 border">Avg Score</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border">{quiz.title}</td>
                      <td className="px-4 py-2 border">{new Date(quiz.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 border">{quiz.takers}</td>
                      <td className="px-4 py-2 border">{quiz.avgScore}%</td>
                      <td className="px-4 py-2 border">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditQuiz(quiz.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center">No quizzes available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
            <div className="flex justify-between">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
