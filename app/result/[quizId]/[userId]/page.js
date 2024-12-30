'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useLanguage } from 'context/LanguageContext'; // Import language context

export default function ResultPage() {
  const router = useRouter();
  const { quizId, userId } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage(); // Use the language context

  useEffect(() => {
    if (quizId && userId) {
      const fetchResult = async () => {
        try {
          const response = await fetch(`/api/quizzez/take-result/${quizId}/${userId}`);
          const data = await response.json();

          if (response.ok) {
            setResult(data);
          } else {
            console.error('Error fetching result:', data.error);
            alert(t.fetchResultError || 'Failed to fetch result.');
          }
        } catch (error) {
          console.error('Error fetching result:', error);
          alert(t.fetchResultError || 'Error fetching result.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchResult();
    }
  }, [quizId, userId, t]);

  if (isLoading || !quizId || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">{t.loading || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-4 text-center">{t.yourResult || 'Your Result'}</h1>
        <div className="space-y-4">
          <div className="p-4 bg-blue-100 rounded-lg text-center">
            <p className="text-xl font-bold text-blue-600">{t.score || 'Score'}: {result.score}%</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t.backToDashboard || 'Back to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
