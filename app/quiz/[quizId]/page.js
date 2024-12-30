'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@lib/supabase';

export default function QuizPage() {
  const router = useRouter();
  const { quizId } = useParams(); // Use useParams to access quizId
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user session to ensure authentication
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('../auth/login'); // Redirect to login if not authenticated
        alert('You must be logged in to take this quiz. Please log in.');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkSession();
  }, [router]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId && isAuthenticated) {
        const { data: quizData, error } = await supabase
          .from('quizzes')
          .select('id, title, questions')
          .eq('id', quizId)
          .single(); // Fetch quiz by ID

        if (error) {
          console.error(error.message);
        } else {
          // Parse questions if they are stored as a JSON string
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

    // Check if all questions have been answered
    const unansweredQuestions = quiz.questions.filter((_, index) => !answers[index]);
    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Calculate the score
    let calculatedScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        calculatedScore += 1;
      }
    });

    const score = (calculatedScore / quiz.questions.length) * 100; // Calculate percentage
    //console.log(`Calculated Score: ${score}%`); // Debugging log

    // Fetch user session to get the user ID
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      alert('Failed to get user session');
      return;
    }

    const userId = session.user.id;

    // Post the result to the API
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
        router.push(`/result/${quizId}/${userId}`); // Redirect to dashboard after submission
      } else {
        alert('Failed to submit your result.');
      }
    } catch (err) {
      console.error('Error submitting result:', err);
      alert('Error submitting result. Please try again later.');
    }
  };

  if (!isAuthenticated) {
    return null; // Show nothing until session is checked
  }

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
                        <label
                          htmlFor={`question-${index}-option-${optionIndex}`}
                          className="text-gray-700"
                        >
                          {option}
                        </label>
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
        </div>
      </div>
    </div>
  );
}
