'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faRightFromBracket, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication state
  const [quizzes, setQuizzes] = useState([]); // Store quizzes dynamically

  // Check if the user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('./auth/login'); // Redirect to login page if not authenticated
      } else {
        setIsAuthenticated(true); // Set authenticated state

        // Fetch quizzes created by the logged-in user
        const { data: quizzesData, error: quizError } = await supabase
          .from('quizzes') // Assuming 'quizzes' is the table where quiz data is stored
          .select('*')
          .eq('user_id', session.user.id); // Filter quizzes by the logged-in user's ID

        if (quizError) {
          console.error('Error fetching quizzes:', quizError.message);
        } else {
          // For each quiz, fetch the number of takers and average score
          const quizzesWithDetails = await Promise.all(
            quizzesData.map(async (quiz) => {
              // Fetch the taker count
              const { count: takerCount } = await supabase
                .from('quiz_results') // Assuming 'quiz_results' stores user answers and scores
                .select('id', { count: 'exact' })
                .eq('quiz_id', quiz.id);

              // Calculate the average score for the quiz
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
                avgScore: avgScore.toFixed(2), // Format the average score to 2 decimal places
              };
            })
          );

          setQuizzes(quizzesWithDetails); // Set the quizzes state with detailed information
        }
      }
    };

    checkAuth();
  }, [router]);

  // Navigate to the new quiz page
  const handleAddQuiz = () => {
    router.push('/dashboard/new-quiz');
  };

  // Navigate to the edit quiz page
  const handleEditQuiz = (quizId) => {
    router.push(`/quiz/${quizId}`);
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout Error:', error.message);
        return;
      }
      setShowLogoutModal(false);
      router.push('./auth/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Unexpected Logout Error:', error);
    }
  };

  // Handle quiz deletion
  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await fetch('/api/quizzez/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizId }), // Pass the quiz ID in the request body
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the deleted quiz from the local state
        setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== quizId));
        console.log(data.message); // Log success message
      } else {
        console.error(data.error); // Log error message if any
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  // Render loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Quiz-Maker</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="mb-4">
              <button className="flex items-center w-full px-4 py-2 hover:bg-blue-700">
                <FontAwesomeIcon icon={faUser} className="h-6 w-6 mr-3" />
                Profile
              </button>
            </li>
            <li className="mb-4">
              <button className="flex items-center w-full px-4 py-2 hover:bg-blue-700">
                <FontAwesomeIcon icon={faClock} className="h-6 w-6 mr-3" />
                Quiz History
              </button>
            </li>
            <li className="mb-4">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center w-full px-4 py-2 hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="h-6 w-6 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
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
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditQuiz(quiz.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
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
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl mb-4">Are you sure you want to log out?</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
