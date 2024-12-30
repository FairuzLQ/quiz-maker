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
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8">All Quizzes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
          >
            <Link href={`/quiz/${quiz.id}`} className="text-2xl font-semibold text-blue-600 hover:text-blue-800">
              {quiz.title}
            </Link>
            <p className="text-sm text-gray-500 mt-2">Created by: {quiz.author}</p>
            <p className="text-sm text-gray-500">Created on: {formatDate(quiz.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
