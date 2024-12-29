'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faRightFromBracket, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { supabase } from '@lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const quizzes = [
    { id: 1, title: 'JavaScript Basics', date: '2024-12-01', takers: 150, avgScore: 85 },
    { id: 2, title: 'React Fundamentals', date: '2024-12-10', takers: 200, avgScore: 90 },
    { id: 3, title: 'CSS Grid and Flexbox', date: '2024-12-20', takers: 120, avgScore: 78 },
  ]; // Sample data for now

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
                      <td className="px-4 py-2 border">{quiz.date}</td>
                      <td className="px-4 py-2 border">{quiz.takers}</td>
                      <td className="px-4 py-2 border">{quiz.avgScore}%</td>
                      <td className="px-4 py-2 border">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditQuiz(quiz.id)}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-2 border text-center text-gray-500"
                    >
                      No quizzes found. Click "Add New Quiz" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
