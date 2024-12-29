'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi'; // Icon for deleting questions
import { BiPlus } from 'react-icons/bi'; // Icon for adding a question
import { supabase } from '@lib/supabase'; // Import Supabase client

export default function NewQuiz() {
  const [quizData, setQuizData] = useState({
    title: '',
    author: '',
    questions: [],
  });

  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();

    // Get the current user's session and ID from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      console.error('User not authenticated or session error');
      return;
    }

    const quizPayload = {
      title: quizData.title,
      author: quizData.author,
      questions: quizData.questions,
      user_id: session.user.id, // Include the user ID from the session
    };

    try {
      // Send the quiz data to the API route
      const response = await fetch('/api/quizzez/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizPayload),
      });

      if (response.ok) {
        // After saving, redirect to the dashboard
        router.push('/dashboard');
      } else {
        console.error('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleAddQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          id: Date.now(), // Use a unique ID based on timestamp
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0, // Default correct answer (index of options)
        },
      ],
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter((q) => q.id !== questionId),
    });
  };

  const handleChangeQuestion = (e, questionId) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) =>
        q.id === questionId ? { ...q, [name]: value } : q
      ),
    });
  };

  const handleChangeOption = (e, questionId, optionIndex) => {
    const { value } = e.target;
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, index) =>
                index === optionIndex ? value : opt
              ),
            }
          : q
      ),
    });
  };

  const handleCorrectAnswerChange = (e, questionId) => {
    const { value } = e.target;
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswer: parseInt(value) } : q
      ),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Create New Quiz</h1>
      <form onSubmit={handleSave}>
        {/* Quiz Title */}
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700">Quiz Title</label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
            placeholder="Enter quiz title"
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Author Name */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">Author Name</label>
          <input
            type="text"
            value={quizData.author}
            onChange={(e) => setQuizData({ ...quizData, author: e.target.value })}
            placeholder="Enter author name"
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
          {quizData.questions.map((question) => (
            <div key={question.id} className="mb-6 border p-4 rounded-lg shadow-sm">
              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Question</label>
                <input
                  type="text"
                  name="question"
                  value={question.question}
                  onChange={(e) => handleChangeQuestion(e, question.id)}
                  placeholder="Enter the question"
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Options */}
              {question.options.map((option, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">
                    Option {index + 1}
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleChangeOption(e, question.id, index)}
                    placeholder={`Option ${index + 1}`}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              ))}

              {/* Correct Answer */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Correct Answer</label>
                <select
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(e, question.id)}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {question.options.map((option, index) => (
                    <option key={index} value={index}>
                      {`Option ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove Question */}
              <button
                type="button"
                onClick={() => handleRemoveQuestion(question.id)}
                className="text-red-500 hover:text-red-700 flex items-center space-x-2"
              >
                <FiTrash2 className="text-xl" />
                <span>Remove Question</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <button
          type="button"
          onClick={handleAddQuestion}
          className="bg-blue-500 text-white p-3 rounded-lg mb-4 flex items-center space-x-2 hover:bg-blue-700"
        >
          <BiPlus className="text-xl" />
          <span>Add Question</span>
        </button>

        {/* Save Quiz Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-700"
        >
          Save Quiz
        </button>
      </form>
    </div>
  );
}
