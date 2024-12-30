'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi'; // Icon for deleting questions
import { BiPlus } from 'react-icons/bi'; // Icon for adding a question
import { supabase } from '@lib/supabase'; // Import Supabase client
import { useLanguage } from 'context/LanguageContext'; // Import the language context

export default function NewQuiz() {
  const [quizData, setQuizData] = useState({
    title: '',
    author: '',
    questions: [],
  });
  const [isSaving, setIsSaving] = useState(false); // State for managing the modal visibility

  const router = useRouter();
  const { t } = useLanguage(); // Use language context to get translations

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Show modal

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      console.error('User not authenticated or session error');
      setIsSaving(false); // Hide modal on error
      return;
    }

    const quizPayload = {
      title: quizData.title,
      author: quizData.author,
      questions: quizData.questions.map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.options[q.correctAnswer],
      })),
      user_id: session.user.id,
    };

    try {
      const response = await fetch('/api/quizzez/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizPayload),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setIsSaving(false); // Hide modal
    }
  };

  const handleAddQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          id: Date.now(),
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
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
    <div className="relative">
      {/* Main Form */}
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">{t.createNewQuiz || 'Create New Quiz'}</h1>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">{t.quizTitle || 'Quiz Title'}</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              placeholder={t.enterQuizTitle || 'Enter quiz title'}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">{t.authorName || 'Author Name'}</label>
            <input
              type="text"
              value={quizData.author}
              onChange={(e) => setQuizData({ ...quizData, author: e.target.value })}
              placeholder={t.enterAuthorName || 'Enter author name'}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.questions || 'Questions'}</h2>
            {quizData.questions.map((question) => (
              <div key={question.id} className="mb-6 border p-4 rounded-lg shadow-sm">
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">{t.question || 'Question'}</label>
                  <input
                    type="text"
                    name="question"
                    value={question.question}
                    onChange={(e) => handleChangeQuestion(e, question.id)}
                    placeholder={t.enterQuestion || 'Enter the question'}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {question.options.map((option, index) => (
                  <div key={index} className="mb-4">
                    <label className="block text-lg font-medium text-gray-700">
                      {t.option} {index + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleChangeOption(e, question.id, index)}
                      placeholder={`${t.option} ${index + 1}`}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                ))}

                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">{t.correctAnswer || 'Correct Answer'}</label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => handleCorrectAnswerChange(e, question.id)}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {question.options.map((option, index) => (
                      <option key={index} value={index}>
                        {option || `${t.option} ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 flex items-center space-x-2"
                >
                  <FiTrash2 className="text-xl" />
                  <span>{t.removeQuestion || 'Remove Question'}</span>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-blue-500 text-white p-3 rounded-lg mb-4 flex items-center space-x-2 hover:bg-blue-700"
          >
            <BiPlus className="text-xl" />
            <span>{t.addQuestion || 'Add Question'}</span>
          </button>

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-700"
          >
            {t.saveQuiz || 'Save Quiz'}
          </button>
        </form>
      </div>

      {/* Modal */}
      {isSaving && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-gray-800">{t.savingQuiz || 'Saving your quiz...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
