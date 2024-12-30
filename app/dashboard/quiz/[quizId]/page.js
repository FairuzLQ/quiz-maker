'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@lib/supabase';
import { FiTrash2 } from 'react-icons/fi'; // Icon for deleting questions
import { BiPlus } from 'react-icons/bi'; // Icon for adding a question

export default function EditQuiz() {
  const router = useRouter();
  const { quizId } = useParams(); // Access the dynamic route parameter
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuizData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) {
        console.error('Error fetching quiz:', error.message);
        setLoading(false);
        return;
      }

      const parsedQuizData = {
        ...data,
        questions: typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions,
      };

      setQuizData(parsedQuizData);
      setLoading(false);
    };

    fetchQuizData();
  }, [quizId]);

  const handleSave = async (e) => {
    e.preventDefault();

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      console.error('User not authenticated or session error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .update({
          title: quizData.title,
          author: quizData.author,
          questions: quizData.questions,
        })
        .eq('id', quizId);

      if (error) {
        console.error('Error updating quiz:', error.message);
        return;
      }

      router.push('/dashboard'); // Redirect to the dashboard after saving
    } catch (err) {
      console.error('Unexpected error saving quiz:', err.message);
    }
  };

  const handleAddQuestion = () => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: [
        ...(prevData.questions || []),
        {
          id: Date.now(),
          question: '',
          options: ['', '', '', ''], // Default options
          correctAnswer: 0, // Default correct answer index
        },
      ],
    }));
  };

  const handleRemoveQuestion = (questionId) => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.filter((q) => q.id !== questionId),
    }));
  };

  const handleChangeQuestion = (e, questionId) => {
    const { name, value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((q) =>
        q.id === questionId ? { ...q, [name]: value } : q
      ),
    }));
  };

  const handleChangeOption = (e, questionId, optionIndex) => {
    const { value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, index) =>
                index === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }));
  };

  const handleCorrectAnswerChange = (e, questionId) => {
    const { value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswer: parseInt(value) } : q
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Quiz not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Edit Quiz</h1>
      <form onSubmit={handleSave}>
        {/* Quiz Title */}
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700">Quiz Title</label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Author Name */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">Author Name</label>
          <input
            type="text"
            value={quizData.author}
            onChange={(e) => setQuizData({ ...quizData, author: e.target.value })}
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>
          {quizData.questions.map((question) => (
            <div key={question.id} className="mb-6 border p-4 rounded-lg shadow-sm">
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Question</label>
                <input
                  type="text"
                  name="question"
                  value={question.question}
                  onChange={(e) => handleChangeQuestion(e, question.id)}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {question.options.map((option, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">
                    Option {index + 1}
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleChangeOption(e, question.id, index)}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Correct Answer</label>
                <select
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(e, question.id)}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
                >
                  {question.options.map((option, index) => (
                    <option key={index} value={index}>
                      {option || `Option ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveQuestion(question.id)}
                className="text-red-500 hover:text-red-700 flex items-center"
              >
                <FiTrash2 className="mr-2" />
                Remove Question
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddQuestion}
          className="bg-blue-500 text-white p-3 rounded-lg mb-4 flex items-center hover:bg-blue-700"
        >
          <BiPlus className="mr-2" />
          Add Question
        </button>

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
