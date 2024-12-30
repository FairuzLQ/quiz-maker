import { supabase } from '@lib/supabase';
import Link from 'next/link';

export const revalidate = 0; // Disable caching, fetch fresh data on every request

export default async function Home() {
  // Fetch quizzes from Supabase
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, title, author, user_id, created_at');

  if (error) {
    return <div className="text-red-500">Error loading quizzes: {error.message}</div>;
  }

  // Function to format dates
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800 tracking-wide">
        Discover Quizzes
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
            <p className="text-sm text-gray-100 mt-2">Created by: {quiz.author}</p>
            <p className="text-sm text-gray-100">Created on: {formatDate(quiz.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
