'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@lib/supabase';

export default function QuizPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('../auth/login');
        alert('You must be logged in to take this quiz. Please log in.');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId && isAuthenticated) {
        const { data: quizData, error } = await supabase
          .from('quizzes')
          .select('id, title, questions')
          .eq('id', quizId)
          .single();

        if (error) {
          console.error(error.message);
        } else {
          const parsedQuestions = typeof quizData.questions === 'string'
            ? JSON.parse(quizData.questions)
            : quizData.questions;

          setQuiz({ ...quizData, questions: parsedQuestions });
        }
      }
    };

    fetchQuiz();
  }, [quizId, isAuthenticated]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers({
      ...answers,
      [questionIndex]: selectedOption,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const unansweredQuestions = quiz.questions.filter((_, index) => !answers[index]);
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    let calculatedScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        calculatedScore += 1;
      }
    });

    const score = (calculatedScore / quiz.questions.length) * 100;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      alert('Failed to get user session');
      return;
    }

    const userId = session.user.id;

    try {
      const response = await fetch('/api/quizzez/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          userId,
          score,
        }),
      });

      if (response.ok) {
        alert('Your result has been saved successfully!');
        router.push(`/result/${quizId}/${userId}`);
      } else {
        alert('Failed to submit your result.');
      }
    } catch (err) {
      console.error('Error submitting result:', err);
      alert('Error submitting result. Please try again later.');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-1 p-6 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-6">{quiz.title}</h1>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-lg font-medium text-gray-800">{question.question}</p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        htmlFor={`question-${index}-option-${optionIndex}`}
                        className={`flex items-center px-4 py-3 border rounded-lg cursor-pointer transition ${
                          answers[index] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-100'
                        }`}
                      >
                        <input
                          type="radio"
                          id={`question-${index}-option-${optionIndex}`}
                          name={`question-${index}`}
                          value={option}
                          onChange={() => handleAnswerChange(index, option)}
                          checked={answers[index] === option}
                          className="hidden"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Quiz
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
