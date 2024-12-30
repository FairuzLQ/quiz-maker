'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // Import useParams for dynamic routes

export default function ResultPage() {
  const router = useRouter();
  const { quizId, userId } = useParams(); // Use useParams to access quizId and userId from the URL
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Fetch result data when quizId and userId are available
  useEffect(() => {
    if (quizId && userId) {
      const fetchResult = async () => {
        try {
          const response = await fetch(`/api/quizzez/take-result/${quizId}/${userId}`);
          const data = await response.json();

          if (response.ok) {
            setResult(data); // Set result data if fetch is successful
          } else {
            console.error('Error fetching result:', data.error);
            alert('Failed to fetch result.');
          }
        } catch (error) {
          console.error('Error fetching result:', error);
          alert('Error fetching result.');
        } finally {
          setIsLoading(false); // Set loading to false after data is fetched
        }
      };

      fetchResult();
    }
  }, [quizId, userId]); // Trigger effect when quizId and userId are available

  // Show loading message if quizId or userId is not yet available
  if (isLoading || !quizId || !userId) {
    return <div>Loading...</div>; // Wait for query params to be available
  }

  // Display result once it's fetched
  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Result</h1>
          <div>
            <p className="text-lg font-semibold">Quiz ID: {result.quiz_id}</p>
            <p className="text-lg font-semibold">User ID: {result.user_id}</p>
            <p className="text-xl font-bold mt-4">
              Score: {result.score}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
