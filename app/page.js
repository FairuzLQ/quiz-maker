'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t, currentLang } = useLanguage(); // Use the global language context
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, title, author, user_id, created_at');

        if (error) {
          setError(error.message);
        } else {
          setQuizzes(data);
        }
      } catch (err) {
        setError('Failed to fetch quizzes.');
      }
    };

    fetchQuizzes();
  }, []);

  // Function to format dates
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat(
      currentLang === 'ar' ? 'ar-SA' : 'id-ID',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...(currentLang === 'ar' && { numberingSystem: 'arab' }), // Use Arabic numbering system for Arabic
      }
    ).format(date);
  };

  if (error) {
    return <div className="text-red-500">{t.errorLoadingQuizzes || 'Error loading quizzes'}: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800 tracking-wide">
        {t.discoverQuizzes || 'Discover Quizzes'}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 p-6 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 ease-in-out"
          >
            <Link
              href={`/quiz/${quiz.id}`}
              className="text-2xl font-semibold text-white hover:text-gray-100"
            >
              {quiz.title}
            </Link>
            <p className="text-sm text-gray-100 mt-2">{t.createdBy || 'Created by'}: {quiz.author}</p>
            <p className="text-sm text-gray-100">{t.createdOn || 'Created on'}: {formatDate(quiz.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
