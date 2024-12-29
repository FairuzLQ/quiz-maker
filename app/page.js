import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default async function Home() {
  // Fetch quizzes from Supabase, including the user's name using a foreign table join
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, title, user_id, created_at, users:id')  // Fetch quiz details and user name from auth.users

  if (error) {
    return <div className="text-red-500">Error loading quizzes: {error.message}</div>;
  }

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
            <p className="text-sm text-gray-500 mt-2">Created by: {quiz.users?.name || 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
