'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@lib/supabase';

export default function QuizPage() {
  const router = useRouter();
  const { quizId } = useParams(); // Use useParams to access quizId
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        const { data: quizData, error } = await supabase
          .from('quizzes')
          .select('id, title, questions')
          .eq('id', quizId)
          .single(); // Fetch quiz by ID

        if (error) {
          console.error(error.message);
        } else {
          setQuiz(quizData);
        }
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers({
      ...answers,
      [questionIndex]: selectedOption,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let calculatedScore = 0;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        calculatedScore += 1;
      }
    });

    setScore((calculatedScore / quiz.questions.length) * 100); // Calculate percentage
  };

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{quiz.title}</h1>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={index}>
                  <p className="text-lg font-semibold">{question.question}</p>
                  <div className="mt-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`question-${index}-option-${optionIndex}`}
                          name={`question-${index}`}
                          value={option}
                          onChange={() => handleAnswerChange(index, option)}
                          checked={answers[index] === option}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor={`question-${index}-option-${optionIndex}`} className="text-gray-700">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Quiz
            </button>
          </form>

          {score !== null && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800">Your Score: {score}%</h2>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Go Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
