'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@lib/supabase';
import { FiTrash2 } from 'react-icons/fi';
import { BiPlus } from 'react-icons/bi';
import { useLanguage } from 'context/LanguageContext'; // Import the language context

export default function EditQuiz() {
  const router = useRouter();
  const { quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage(); // Use the language context

  useEffect(() => {
    if (!quizId) return;

    const fetchQuizData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, author, questions')
        .eq('id', quizId)
        .single();

      if (error) {
        console.error('Error fetching quiz:', error.message);
        setLoading(false);
        return;
      }

      // Parse questions and determine correctAnswer index
      const parsedQuestions = (typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions).map((q) => ({
        ...q,
        correctAnswer: q.options.indexOf(q.answer), // Determine the correct answer index
      }));

      setQuizData({ ...data, questions: parsedQuestions });
      setLoading(false);
    };

    fetchQuizData();
  }, [quizId]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!quizData.title || !quizData.author || quizData.questions.some(q => !q.question || q.options.some(opt => !opt.trim()))) {
      alert(t.fillAllFields || 'Please fill out all fields.');
      return;
    }

    setIsSaving(true);

    const formattedQuestions = quizData.questions.map((q) => ({
      question: q.question,
      options: q.options,
      answer: q.options[q.correctAnswer] || '',
    }));

    try {
      const response = await fetch('/api/quizzez/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          title: quizData.title,
          author: quizData.author,
          questions: formattedQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || t.updateFailed || 'Failed to update quiz.');
        setIsSaving(false);
        return;
      }

      alert(t.quizUpdated || 'Quiz updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert(t.saveError || 'An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
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
          options: ['', '', '', ''],
          correctAnswer: 0,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (questionId) => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.filter((q, idx) => q.id !== questionId && idx !== questionId),
    }));
  };

  const handleChangeQuestion = (e, questionIndex) => {
    const { value } = e.target;
    setQuizData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[questionIndex].question = value;
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const handleChangeOption = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    setQuizData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[questionIndex].options[optionIndex] = value;
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const handleCorrectAnswerChange = (e, questionIndex) => {
    const { value } = e.target;
    setQuizData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[questionIndex].correctAnswer = parseInt(value);
      return { ...prevData, questions: updatedQuestions };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t.loadingQuiz || 'Loading quiz...'}</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t.quizNotFound || 'Quiz not found.'}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">{t.editQuiz || 'Edit Quiz'}</h1>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">{t.quizTitle || 'Quiz Title'}</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700">{t.authorName || 'Author Name'}</label>
            <input
              type="text"
              value={quizData.author}
              onChange={(e) => setQuizData({ ...quizData, author: e.target.value })}
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.questions || 'Questions'}</h2>
            {quizData.questions.map((question, index) => (
              <div key={question.id || index} className="mb-6 border p-4 rounded-lg shadow-sm">
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">{t.question || 'Question'}</label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleChangeQuestion(e, index)}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
                  />
                </div>
                {question.options.map((option, idx) => (
                  <div key={idx} className="mb-4">
                    <label className="block text-lg font-medium text-gray-700">{t.option} {idx + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleChangeOption(e, index, idx)}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">{t.correctAnswer || 'Correct Answer'}</label>
                  <select
                    value={question.correctAnswer ?? 0}
                    onChange={(e) => handleCorrectAnswerChange(e, index)}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
                  >
                    {question.options.map((option, idx) => (
                      <option key={idx} value={idx}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(question.id || index)}
                  className="text-red-500 hover:text-red-700 flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  {t.removeQuestion || 'Remove Question'}
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
            {t.addQuestion || 'Add Question'}
          </button>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-700"
          >
            {t.saveQuiz || 'Save Quiz'}
          </button>
        </form>
      </div>

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
